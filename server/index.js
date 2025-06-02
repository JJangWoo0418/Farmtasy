const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
require('dotenv').config();

const app = express();
const AWS = require('aws-sdk');

// 환경변수 체크
const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('필수 환경변수가 설정되지 않았습니다:', missingEnvVars);
    process.exit(1);
}

// AWS SDK 설정
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4'
});

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4'
});

// CORS 설정을 더 구체적으로
app.use(cors({
    origin: '*',  // 모든 출처 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// body-parser 설정
app.use(express.json({ limit: '10mb' })); // JSON 요청 최대 10MB로 증가
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded 요청 최대 10MB로 증가

// 데이터베이스 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 에러:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// auth 라우터를 먼저 등록
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// 가장 단순한 사용자 정보 조회 API (다른 라우터보다 위에 둘 것)
app.get('/api/user', async (req, res) => {
    const { phone } = req.query;
    console.log('GET /api/user 호출됨, phone:', phone);
    if (!phone) return res.status(400).json({ error: 'phone 필요' });
    const [rows] = await pool.query('SELECT * FROM user WHERE phone = ?', [phone]);
    if (rows.length === 0) return res.status(404).json({ error: '사용자 없음' });
    res.json(rows[0]);
});

// 서버 상태 확인용 엔드포인트
app.get('/', (req, res) => {
    res.json({ message: '서버가 정상적으로 실행 중입니다.' });
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
    console.log('회원가입 요청 받음:', req.body);

    const { phone, name, password, region, profile, introduction } = req.body;

    try {
        // 전화번호 중복 체크
        const [existingUser] = await pool.query(
            'SELECT phone FROM User WHERE phone = ?',
            [phone]
        );

        if (existingUser.length > 0) {
            console.log('중복된 전화번호:', phone);
            return res.status(400).json({
                success: false,
                message: '이미 등록된 전화번호입니다.'
            });
        }

        // 새 사용자 등록
        const [result] = await pool.query(
            `INSERT INTO User (phone, name, password, region, profile, introduction) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [phone, name, password, region, profile, introduction]
        );

        console.log('사용자 등록 성공:', result);

        res.json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            userId: result.insertId
        });

    } catch (error) {
        console.error('회원가입 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 좋아요 저장 API
app.post('/api/post/post_like', async (req, res) => {
    console.log('좋아요 저장 API 호출됨');
    try {
        const { postId, like, phone } = req.body;

        // 게시글 작성자 정보 가져오기
        const [post] = await pool.query(
            'SELECT phone FROM post WHERE post_id = ?',
            [postId]
        );
        const postAuthorPhone = post[0]?.phone;

        // 먼저 현재 좋아요 상태 확인
        const [existingLike] = await pool.query(
            'SELECT id FROM post_likes WHERE post_id = ? AND user_phone = ?',
            [postId, phone]
        );

        if (like) {
            // 좋아요 추가
            if (existingLike.length === 0) {
                await pool.query(
                    'INSERT INTO post_likes (post_id, user_phone) VALUES (?, ?)',
                    [postId, phone]
                );
                await pool.query(
                    'UPDATE post SET post_like = post_like + 1 WHERE post_id = ?',
                    [postId]
                );
                // 알림 생성 (본인 글이 아닐 때만)
                if (postAuthorPhone && postAuthorPhone !== phone) {
                    await createNotification({
                        recipientPhone: postAuthorPhone,
                        actorPhone: phone,
                        type: 'POST_LIKE',
                        targetPostId: postId
                    });
                }
            }
        } else {
            // 좋아요 삭제 - 본인이 누른 좋아요만 취소 가능
            if (existingLike.length > 0) {
                const [likeOwner] = await pool.query(
                    'SELECT user_phone FROM post_likes WHERE post_id = ? AND user_phone = ?',
                    [postId, phone]
                );
                if (likeOwner.length > 0) {
                    await pool.query(
                        'DELETE FROM post_likes WHERE post_id = ? AND user_phone = ?',
                        [postId, phone]
                    );
                    await pool.query(
                        'UPDATE post SET post_like = GREATEST(post_like - 1, 0) WHERE post_id = ?',
                        [postId]
                    );
                } else {
                    return res.status(403).json({
                        error: '권한이 없습니다.',
                        details: '본인이 누른 좋아요만 취소할 수 있습니다.'
                    });
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('좋아요 처리 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 게시글 목록 조회 API 수정
app.get('/api/post', async (req, res) => {
    try {
        const { category, user_phone } = req.query;
        console.log('게시글 조회 요청:', { category, user_phone });

        if (!user_phone) {
            return res.status(400).json({
                error: '사용자 전화번호가 필요합니다.',
                details: 'user_phone 파라미터가 누락되었습니다.'
            });
        }

        let query = `
            SELECT 
                p.post_id as id,
                u.name as user,
                p.phone,
                p.post_content as text,
                p.post_category as category,
                p.post_created_at as time,
                p.image_urls,
                u.region,
                p.post_like as likes,
                u.introduction,
                u.profile_image,
                CASE WHEN pl2.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
                (
                    SELECT COUNT(*) 
                    FROM Comment c 
                    WHERE c.post_id = p.post_id
                ) as comment_count,
                (
                    SELECT c2.comment_content
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_content,
                (
                    SELECT u2.name
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_user,
                (
                    SELECT u2.profile_image
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_profile,
                (
                    SELECT c2.comment_created_at
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_time,
                (
                    SELECT (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    )
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_likes,
                (
                    SELECT u2.region
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_region,
                (
                    SELECT u2.introduction
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_introduction
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            LEFT JOIN post_likes pl2 ON p.post_id = pl2.post_id AND pl2.user_phone = ?
            LEFT JOIN post_bookmarks pb ON p.post_id = pb.post_id AND pb.user_phone = ?
            ${category ? 'WHERE p.post_category = ?' : ''}
            GROUP BY p.post_id
            ORDER BY p.post_created_at DESC
        `;

        const params = [user_phone, user_phone];
        if (category) params.push(category);

        const [posts] = await pool.query(query, params);
        console.log('조회된 게시글 수:', posts.length);
        console.log('첫 번째 게시글의 프로필 이미지:', posts[0]?.profile_image);

        // image_urls 필드 처리 및 데이터 정제
        const formattedPosts = posts.map(post => {
            let imageUrls = [];
            try {
                if (post.image_urls) {
                    if (typeof post.image_urls === 'string') {
                        imageUrls = JSON.parse(post.image_urls);
                    } else if (Array.isArray(post.image_urls)) {
                        imageUrls = post.image_urls;
                    } else {
                        imageUrls = [post.image_urls];
                    }

                    if (Array.isArray(imageUrls[0])) {
                        imageUrls = imageUrls.flat();
                    }

                    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
                }
            } catch (e) {
                console.error('image_urls 파싱 에러:', e);
                imageUrls = [];
            }

            console.log('게시글 작성자 프로필:', post.profile_image);

            return {
                id: post.id || 0,
                user: post.user || '알 수 없음',
                phone: post.phone || '',
                text: post.text || '',
                category: post.category || '',
                time: post.time || new Date().toISOString(),
                image_urls: imageUrls,
                region: post.region || '지역 미설정',
                introduction: post.introduction || '소개 미설정',
                likes: parseInt(post.likes) || 0,
                is_liked: post.is_liked === 1,
                is_bookmarked: post.is_bookmarked === 1,
                profile_image: post.profile_image || null,
                commentCount: parseInt(post.comment_count) || 0,
                best_comment_content: post.best_comment_content || '',
                best_comment_user: post.best_comment_user || '알 수 없음',
                best_comment_profile: post.best_comment_profile || '프로필 미설정',
                best_comment_time: post.best_comment_time || new Date().toISOString(),
                best_comment_likes: parseInt(post.best_comment_likes) || 0,
                best_comment_region: post.best_comment_region || '지역 미설정',
                best_comment_introduction: post.best_comment_introduction || '소개 미설정'
            };
        });

        console.log('응답 데이터:', JSON.stringify(formattedPosts, null, 2));
        res.json(formattedPosts);
    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// S3 presigned URL 생성 API 수정
app.post('/api/s3/presign', (req, res) => {
    const { fileName, fileType } = req.body;
    console.log('Presigned URL 요청:', { fileName, fileType });
    console.log('S3 버킷:', process.env.AWS_S3_BUCKET);

    if (!process.env.AWS_S3_BUCKET) {
        console.error('AWS_S3_BUCKET 환경변수가 설정되지 않았습니다.');
        return res.status(500).json({
            error: 'S3 설정 오류',
            details: 'S3 버킷이 설정되지 않았습니다.'
        });
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType
    };

    console.log('S3 파라미터:', params);

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            console.error('S3 presigned URL 생성 실패:', err);
            return res.status(500).json({
                error: 'S3 URL 생성 실패',
                details: err.message
            });
        }
        console.log('S3 presigned URL 생성 성공');
        res.json({ url });
    });
});

// 게시글 생성 API 수정: post_title 관련 부분 제거
app.post('/api/post', async (req, res) => {
    console.log('게시글 작성 요청 받음:', req.body);

    try {
        const { name, post_content, post_category, phone, region, image_urls } = req.body;
        console.log('파싱된 데이터:', { name, post_content, post_category, phone, region, image_urls });

        // 필수 필드 검증
        if (!name || !post_content || !post_category || !phone) {
            console.log('필수 필드 누락:', { name, post_content, post_category, phone });
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // image_urls 처리
        const imageUrlsString = image_urls ? JSON.stringify(image_urls) : JSON.stringify([]);
        console.log('이미지 URL 처리:', imageUrlsString);

        const query = `
            INSERT INTO post 
            (name, post_content, post_category, phone, region, image_urls, post_created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const params = [name, post_content, post_category, phone, region, imageUrlsString];

        console.log('실행할 쿼리:', query);
        console.log('쿼리 파라미터:', params);

        const [result] = await pool.query(query, params);
        console.log('게시글 등록 성공:', result);

        res.json({
            success: true,
            message: '게시글이 등록되었습니다.',
            postId: result.insertId
        });

    } catch (error) {
        console.error('게시글 등록 오류:', error);
        console.error('에러 상세:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message,
            details: error.sqlMessage || '데이터베이스 오류'
        });
    }
});

// 댓글 좋아요 API
app.post('/api/comment/like', async (req, res) => {
    console.log('댓글 좋아요 API 호출됨');
    try {
        const { commentId, like, phone } = req.body;

        // 댓글 작성자 정보 가져오기
        const [comment] = await pool.query(
            'SELECT phone FROM comment WHERE comment_id = ?',
            [commentId]
        );
        const commentAuthorPhone = comment[0]?.phone;

        // 먼저 현재 좋아요 상태 확인
        const [existingLike] = await pool.query(
            'SELECT id FROM comment_likes WHERE comment_id = ? AND user_phone = ?',
            [commentId, phone]
        );

        if (like) {
            // 좋아요 추가
            if (existingLike.length === 0) {
                await pool.query(
                    'INSERT INTO comment_likes (comment_id, user_phone) VALUES (?, ?)',
                    [commentId, phone]
                );
                // 알림 생성 (본인 댓글이 아닐 때만)
                if (commentAuthorPhone && commentAuthorPhone !== phone) {
                    await createNotification({
                        recipientPhone: commentAuthorPhone,
                        actorPhone: phone,
                        type: 'COMMENT_LIKE',
                        targetCommentId: commentId
                    });
                }
            }
        } else {
            // 좋아요 삭제
            if (existingLike.length > 0) {
                await pool.query(
                    'DELETE FROM comment_likes WHERE comment_id = ? AND user_phone = ?',
                    [commentId, phone]
                );
            }
        }

        // 좋아요 수 업데이트
        await pool.query(`
            UPDATE Comment 
            SET comment_like = (
                SELECT COUNT(*) 
                FROM comment_likes 
                WHERE comment_id = ?
            )
            WHERE comment_id = ?
        `, [commentId, commentId]);

        res.json({ success: true });
    } catch (error) {
        console.error('댓글 좋아요 처리 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 댓글 목록 조회 API 수정
app.get('/api/comment', async (req, res) => {
    const { post_id, user_phone } = req.query;
    console.log('댓글 목록 조회 요청:', { post_id, user_phone });

    if (!post_id || !user_phone) return res.status(400).json({ success: false, message: 'post_id와 user_phone 필요' });

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.comment_id, 
                c.comment_content, 
                c.comment_created_at, 
                c.comment_parent_id, 
                c.phone, 
                COALESCE(c.comment_like, 0) as comment_like,
                u.name, 
                u.profile_image as profile, 
                u.region, 
                u.introduction,
                CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                (
                    SELECT COUNT(*) 
                    FROM comment_likes cl2 
                    WHERE cl2.comment_id = c.comment_id
                ) as like_count
            FROM Comment c
            LEFT JOIN user u ON c.phone = u.phone
            LEFT JOIN comment_likes cl ON c.comment_id = cl.comment_id AND cl.user_phone = ?
            WHERE c.post_id = ?
            ORDER BY c.comment_created_at ASC
        `, [user_phone, post_id]);

        console.log('DB에서 조회된 댓글 데이터:', rows);

        const comments = rows.map(row => ({
            id: row.comment_id,
            user: row.name,
            profile: row.profile,
            time: row.comment_created_at,
            comment_content: row.comment_content,
            likes: row.like_count || 0,
            introduction: row.introduction,
            comment_parent_id: row.comment_parent_id,
            phone: row.phone,
            isLiked: row.is_liked === 1,
            region: row.region || '지역 미설정'
        }));

        console.log('클라이언트로 보내는 댓글 데이터:', comments);
        res.json(comments);
    } catch (e) {
        console.error('댓글 조회 오류:', e);
        res.status(500).json({ success: false, message: '댓글 조회 실패' });
    }
});

// 댓글 작성 API
app.post('/api/comment', async (req, res) => {
    console.log('댓글 작성 API 호출됨');
    const { comment_content, post_id, phone, comment_parent_id } = req.body;
    if (!comment_content || !post_id || !phone) {
        return res.status(400).json({ success: false, message: '필수값 누락' });
    }
    try {
        // 댓글 저장
        const [insertResult] = await pool.query(
            `INSERT INTO Comment (comment_content, comment_created_at, post_id, phone, comment_parent_id) VALUES (?, NOW(), ?, ?, ?)`,
            [comment_content, post_id, phone, comment_parent_id || null]
        );
        const comment_id = insertResult.insertId;

        // 알림 생성
        if (comment_parent_id) {
            // 대댓글: 원댓글 작성자에게 알림 (COMMENT_REPLY)
            const [parentComment] = await pool.query(
                'SELECT phone, comment_content FROM comment WHERE comment_id = ?',
                [comment_parent_id]
            );
            const parentCommentAuthorPhone = parentComment[0]?.phone;
            const parentCommentContent = parentComment[0]?.comment_content;
            
            if (parentCommentAuthorPhone && parentCommentAuthorPhone !== phone) {
                await createNotification({
                    recipientPhone: parentCommentAuthorPhone,
                    actorPhone: phone,
                    type: 'COMMENT_REPLY',
                    targetCommentId: comment_id,  // 수정: 새로 작성된 대댓글의 ID
                    targetPostId: post_id,
                    comment_content: comment_content,           // 새로 작성된 대댓글 내용
                    parent_comment_content: parentCommentContent // 원댓글 내용
                });
            }
        } else {
            // 일반 댓글: 게시글 작성자에게 알림 (POST_COMMENT)
            const [post] = await pool.query(
                'SELECT phone, post_content FROM post WHERE post_id = ?',
                [post_id]
            );
            const postAuthorPhone = post[0]?.phone;
            const postContent = post[0]?.post_content;
            
            if (postAuthorPhone && postAuthorPhone !== phone) {
                await createNotification({
                    recipientPhone: postAuthorPhone,
                    actorPhone: phone,
                    type: 'POST_COMMENT',
                    targetPostId: post_id,
                    targetCommentId: comment_id,
                    comment_content: comment_content,  // 새로 작성된 댓글 내용
                    post_content: postContent         // 게시글 내용
                });
            }
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: '댓글 작성 실패' });
    }
});

// 프로필 수정 전용 API
app.post('/api/user/update-profile', async (req, res) => {
    const { phone, name, region, introduction, profile_image, about_me } = req.body;
    if (!phone) {
        return res.status(400).json({ success: false, message: 'phone 파라미터가 필요합니다.' });
    }
    try {
        await pool.query(
            `UPDATE user SET name=?, region=?, introduction=?, profile_image=?, about_me=? WHERE phone=?`,
            [name, region, introduction, profile_image, about_me, phone]
        );
        res.json({ success: true, message: '프로필이 성공적으로 수정되었습니다.' });
    } catch (e) {
        res.status(500).json({ success: false, message: 'DB 오류', error: e.message });
    }
});

// 사용자 통계 정보 조회 API
app.get('/api/user/stats', async (req, res) => {
    const { phone } = req.query;
    if (!phone) {
        return res.status(400).json({ error: '전화번호가 필요합니다.' });
    }

    try {
        // 게시글 수 조회 - 전화번호로 매칭
        const [postCount] = await pool.query(
            'SELECT COUNT(*) as post_count FROM post WHERE phone = ?',
            [phone]
        );

        // 댓글 수 조회 - 전화번호로 매칭
        const [commentCount] = await pool.query(
            'SELECT COUNT(*) as comment_count FROM comment WHERE phone = ?',
            [phone]
        );

        // 받은 좋아요 수 조회 - 게시글과 댓글의 좋아요 합산
        const [likeCount] = await pool.query(`
            SELECT (
                -- 게시글 좋아요 수
                (SELECT COALESCE(SUM(post_like), 0) FROM post WHERE phone = ?) +
                -- 댓글 좋아요 수
                (SELECT COALESCE(SUM(comment_like), 0) FROM comment WHERE phone = ?)
            ) as like_count
        `, [phone, phone]);

        res.json({
            post_count: postCount[0].post_count || 0,
            comment_count: commentCount[0].comment_count || 0,
            like_count: likeCount[0].like_count || 0
        });
    } catch (error) {
        console.error('사용자 통계 조회 실패:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 특정 사용자가 작성한 게시글 목록 조회 API
app.get('/api/post/user', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'phone 파라미터 필요' });

    try {
        const [rows] = await pool.query(
            `SELECT 
                p.post_id as id,
                u.name as user,
                p.phone,
                p.post_content as text,
                p.post_category as category,
                p.post_created_at as time,
                p.image_urls,
                u.region,
                p.post_like as likes,
                u.introduction,
                u.profile_image,
                (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) as commentCount
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            WHERE p.phone = ?
            ORDER BY p.post_created_at DESC`,
            [phone]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: 'DB 오류' });
    }
});

// collectionwriting.js 전용: 특정 사용자의 전체 게시글 목록 조회 API (카테고리 구분 없이)
app.get('/api/collection/user-posts', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'phone 파라미터 필요' });

    try {
        const [posts] = await pool.query(`
            SELECT 
                p.post_id as id,
                u.name as user,
                p.phone,
                p.post_content as text,
                p.post_category as category,
                p.post_created_at as time,
                p.image_urls,
                u.region,
                p.post_like as likes,
                u.introduction,
                u.profile_image,
                CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
                CASE WHEN pl2.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) as commentCount,
                (
                    SELECT c2.comment_content
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_content,
                (
                    SELECT u2.name
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_user,
                (
                    SELECT u2.profile_image
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_profile,
                (
                    SELECT c2.comment_created_at
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_time,
                (
                    SELECT u2.region
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_region,
                (
                    SELECT u2.introduction
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_introduction
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            LEFT JOIN post_bookmarks pb ON p.post_id = pb.post_id AND pb.user_phone = ?
            LEFT JOIN post_likes pl2 ON p.post_id = pl2.post_id AND pl2.user_phone = ?
            WHERE p.phone = ?
            ORDER BY p.post_created_at DESC
        `, [phone, phone, phone]);

        // image_urls 등 데이터 정제
        const formattedPosts = posts.map(post => {
            let imageUrls = [];
            try {
                if (post.image_urls) {
                    if (typeof post.image_urls === 'string') {
                        imageUrls = JSON.parse(post.image_urls);
                    } else if (Array.isArray(post.image_urls)) {
                        imageUrls = post.image_urls;
                    } else {
                        imageUrls = [post.image_urls];
                    }
                    if (Array.isArray(imageUrls[0])) {
                        imageUrls = imageUrls.flat();
                    }
                    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
                }
            } catch (e) {
                imageUrls = [];
            }

            return {
                ...post,
                image_urls: imageUrls,
                is_bookmarked: post.is_bookmarked === 1,
                is_liked: post.is_liked === 1
            };
        });

        res.json(formattedPosts);
    } catch (e) {
        res.status(500).json({ error: 'DB 오류' });
    }
});

// 북마크 추가/삭제 API
app.post('/api/post_bookmarks', async (req, res) => {
    const { post_id, user_phone } = req.body;

    try {
        // 1. 먼저 북마크가 있는지 확인
        const [existingBookmark] = await pool.query(
            'SELECT * FROM post_bookmarks WHERE post_id = ? AND user_phone = ?',
            [post_id, user_phone]
        );

        if (existingBookmark.length > 0) {
            // 2. 있으면 삭제 (북마크 취소)
            await pool.query(
                'DELETE FROM post_bookmarks WHERE post_id = ? AND user_phone = ?',
                [post_id, user_phone]
            );
            res.json({
                success: true,
                message: '북마크가 삭제되었습니다.',
                is_bookmarked: false
            });
        } else {
            // 3. 없으면 추가 (북마크 추가)
            await pool.query(
                'INSERT INTO post_bookmarks (post_id, user_phone) VALUES (?, ?)',
                [post_id, user_phone]
            );
            res.json({
                success: true,
                message: '북마크가 추가되었습니다.',
                is_bookmarked: true
            });
        }
    } catch (error) {
        console.error('북마크 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            error: '북마크 처리 중 오류가 발생했습니다.'
        });
    }
});

// 사용자의 북마크 목록 조회 API
app.get('/api/post_bookmarks/user/:phone', async (req, res) => {
    const { phone } = req.params;
    try {
        const [posts] = await pool.query(`
            SELECT 
                p.post_id as id,
                u.name as user,
                p.phone,
                p.post_content as text,
                p.post_category as category,
                p.post_created_at as time,
                p.image_urls,
                u.region,
                p.post_like as likes,
                u.introduction,
                u.profile_image,
                CASE WHEN pl2.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
                (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) as commentCount,
                (
                    SELECT c2.comment_content
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_content,
                (
                    SELECT u2.name
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_user,
                (
                    SELECT u2.profile_image
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_profile,
                (
                    SELECT c2.comment_created_at
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_time,
                (
                    SELECT (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    )
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_likes,
                (
                    SELECT u2.region
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_region,
                (
                    SELECT u2.introduction
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_introduction
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            LEFT JOIN post_bookmarks pb ON p.post_id = pb.post_id AND pb.user_phone = ?
            LEFT JOIN post_likes pl2 ON p.post_id = pl2.post_id AND pl2.user_phone = ?
            WHERE pb.user_phone = ?
            ORDER BY pb.created_at DESC
        `, [phone, phone, phone]);

        // image_urls 등 데이터 정제
        const formattedPosts = posts.map(post => {
            let imageUrls = [];
            try {
                if (post.image_urls) {
                    if (typeof post.image_urls === 'string') {
                        imageUrls = JSON.parse(post.image_urls);
                    } else if (Array.isArray(post.image_urls)) {
                        imageUrls = post.image_urls;
                    } else {
                        imageUrls = [post.image_urls];
                    }
                    if (Array.isArray(imageUrls[0])) {
                        imageUrls = imageUrls.flat();
                    }
                    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
                }
            } catch (e) {
                imageUrls = [];
            }

            return {
                ...post,
                image_urls: imageUrls,
                is_bookmarked: post.is_bookmarked === 1,
                is_liked: post.is_liked === 1
            };
        });

        res.json({ bookmarks: formattedPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: '북마크 목록 조회 오류', error: error.message });
    }
});

// 댓글 단 게시글 조회 라우터 (404 핸들러보다 반드시 위에 위치)
app.get('/api/comment/user-posts', async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'phone 파라미터 필요' });

    try {
        // 1. 댓글에서 내가 쓴 post_id 목록 추출
        const [commentRows] = await pool.query(
            'SELECT DISTINCT post_id FROM Comment WHERE phone = ?',
            [phone]
        );
        const postIds = commentRows.map(row => row.post_id);
        if (postIds.length === 0) return res.json([]); // 댓글 단 게시글이 없으면 빈 배열

        // 2. 해당 post_id의 게시글 정보 조회
        const [posts] = await pool.query(`
            SELECT 
                p.post_id as id,
                u.name as user,
                p.phone,
                p.post_content as text,
                p.post_category as category,
                p.post_created_at as time,
                p.image_urls,
                u.region,
                p.post_like as likes,
                u.introduction,
                u.profile_image,
                CASE WHEN pl2.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
                (SELECT COUNT(*) FROM Comment c2 WHERE c2.post_id = p.post_id) as commentCount,
                (
                    SELECT c2.comment_content
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_content,
                (
                    SELECT u2.name
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_user,
                (
                    SELECT u2.profile_image
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_profile,
                (
                    SELECT c2.comment_created_at
                    FROM Comment c2
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_time,
                (
                    SELECT u2.region
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_region,
                (
                    SELECT u2.introduction
                    FROM Comment c2
                    LEFT JOIN user u2 ON c2.phone = u2.phone
                    WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                    ORDER BY (
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                        +
                        (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                         FROM (
                           SELECT c3.comment_id, COUNT(cl2.id) as like_count
                           FROM Comment c3
                           LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                           WHERE c3.comment_parent_id = c2.comment_id
                           GROUP BY c3.comment_id
                         ) as sub_likes
                        )
                    ) DESC, c2.comment_created_at ASC
                    LIMIT 1
                ) as best_comment_introduction
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            LEFT JOIN post_likes pl2 ON p.post_id = pl2.post_id AND pl2.user_phone = ?
            LEFT JOIN post_bookmarks pb ON p.post_id = pb.post_id AND pb.user_phone = ?
            WHERE p.post_id IN (${postIds.map(() => '?').join(',')})
            ORDER BY p.post_created_at DESC
        `, [phone, phone, ...postIds]);

        // image_urls 등 데이터 정제
        const formattedPosts = posts.map(post => {
            let imageUrls = [];
            try {
                if (post.image_urls) {
                    if (typeof post.image_urls === 'string') {
                        imageUrls = JSON.parse(post.image_urls);
                    } else if (Array.isArray(post.image_urls)) {
                        imageUrls = post.image_urls;
                    } else {
                        imageUrls = [post.image_urls];
                    }
                    if (Array.isArray(imageUrls[0])) {
                        imageUrls = imageUrls.flat();
                    }
                    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
                }
            } catch (e) {
                imageUrls = [];
            }

            return {
                ...post,
                image_urls: imageUrls,
                is_bookmarked: post.is_bookmarked === 1,
                is_liked: post.is_liked === 1
            };
        });

        res.json(formattedPosts);
    } catch (e) {
        console.error('댓글 작성 게시글 조회 오류:', e);
        res.status(500).json({ error: 'DB 오류' });
    }
});

// 각 카테고리별 인기 게시글 가져오기
app.get('/api/posts/popular', async (req, res) => {
    const { user_phone } = req.query;

    try {
        const categories = ['농사질문', '농사공부', '자유주제'];
        const popularPosts = [];

        for (const category of categories) {
            const [posts] = await pool.query(`
                SELECT 
                    p.post_id as id,
                    u.name as username,
                    p.phone,
                    p.post_content as content,
                    p.post_category as category,
                    p.post_created_at as createdAt,
                    p.image_urls,
                    u.region,
                    p.post_like as likes,
                    u.introduction,
                    u.profile_image as profileImage,
                    CASE WHEN pl2.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
                    CASE WHEN pb.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
                    (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) as commentCount,
                    (
                        SELECT c2.comment_content
                        FROM Comment c2
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_content,
                    (
                        SELECT u2.name
                        FROM Comment c2
                        LEFT JOIN user u2 ON c2.phone = u2.phone
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_user,
                    (
                        SELECT u2.profile_image
                        FROM Comment c2
                        LEFT JOIN user u2 ON c2.phone = u2.phone
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_profile,
                    (
                        SELECT c2.comment_created_at
                        FROM Comment c2
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_time,
                    (
                        SELECT u2.region
                        FROM Comment c2
                        LEFT JOIN user u2 ON c2.phone = u2.phone
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_region,
                    (
                        SELECT u2.introduction
                        FROM Comment c2
                        LEFT JOIN user u2 ON c2.phone = u2.phone
                        WHERE c2.post_id = p.post_id AND c2.comment_parent_id IS NULL
                        ORDER BY (
                            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c2.comment_id)
                            +
                            (SELECT IFNULL(SUM(sub_likes.like_count), 0)
                             FROM (
                               SELECT c3.comment_id, COUNT(cl2.id) as like_count
                               FROM Comment c3
                               LEFT JOIN comment_likes cl2 ON cl2.comment_id = c3.comment_id
                               WHERE c3.comment_parent_id = c2.comment_id
                               GROUP BY c3.comment_id
                             ) as sub_likes
                            )
                        ) DESC, c2.comment_created_at ASC
                        LIMIT 1
                    ) as best_comment_introduction
                FROM post p
                LEFT JOIN user u ON p.phone = u.phone
                LEFT JOIN post_likes pl2 ON p.post_id = pl2.post_id AND pl2.user_phone = ?
                LEFT JOIN post_bookmarks pb ON p.post_id = pb.post_id AND pb.user_phone = ?
                WHERE p.post_category = ?
                ORDER BY p.post_like DESC
                LIMIT 1
            `, [user_phone || '', user_phone || '', category]);


            if (posts.length > 0) {
                const post = posts[0];
                // image_urls 처리
                let imageUrls = [];
                try {
                    if (post.image_urls) {
                        if (typeof post.image_urls === 'string') {
                            imageUrls = JSON.parse(post.image_urls);
                        } else if (Array.isArray(post.image_urls)) {
                            imageUrls = post.image_urls;
                        }
                    }
                } catch (e) {
                    console.error('image_urls 파싱 에러:', e);
                }

                // 날짜 포맷팅
                const formattedPost = {
                    ...post,
                    id: post.id,
                    text: post.content,
                    user: post.username,
                    phone: post.phone,
                    category: post.category,
                    time: post.createdAt,
                    image_urls: imageUrls,
                    region: post.region || '지역 미설정',
                    introduction: post.introduction || '소개 미설정',
                    likes: parseInt(post.likes) || 0,
                    is_liked: post.is_liked === 1,
                    is_bookmarked: post.is_bookmarked === 1,
                    profile_image: post.profileImage || null,
                    commentCount: parseInt(post.commentCount) || 0,
                    createdAt: new Date(post.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                popularPosts.push(formattedPost);
            }
        }

        res.json(popularPosts);
    } catch (error) {
        console.error('인기 게시글을 가져오는데 실패했습니다:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 농장 정보 저장(생성) API
app.post('/api/farm', async (req, res) => {
    console.log('POST /api/farm 호출됨');
    console.log('요청 바디:', req.body);

    const { user_phone, farm_name, latitude, longitude, coordinates, address } = req.body;

    try {
        // 필수값 체크
        if (!user_phone || !farm_name || !latitude || !longitude || !coordinates) {
            console.log('필수값 누락:', { user_phone, farm_name, latitude, longitude, coordinates });
            return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
        }

        // coordinates를 JSON 문자열로 변환
        const coordinatesJson = JSON.stringify(coordinates);

        // 쿼리 및 파라미터 로그
        const query = `INSERT INTO farm (user_phone, farm_name, latitude, longitude, coordinates, address) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [user_phone, farm_name, latitude, longitude, coordinatesJson, address];
        console.log('쿼리:', query);
        console.log('파라미터:', params);

        // DB에 저장
        const [result] = await pool.query(query, params);
        console.log('DB 저장 결과:', result);

        res.status(201).json({
            message: '농장이 성공적으로 등록되었습니다.',
            farm_id: result.insertId
        });
    } catch (error) {
        console.error('Error saving farm:', error);
        console.error('SQL Message:', error?.sqlMessage);
        console.error('Error Code:', error?.code);
        res.status(500).json({ error: '농장 정보 저장에 실패했습니다.' });
    }
});

// 모든 농장 정보 조회 (테스트용)
app.get('/api/farm', async (req, res) => {
    console.log('GET /api/farm 호출됨');
    const { user_phone } = req.query;
    try {
        let query = 'SELECT * FROM farm';
        let params = [];
        if (user_phone) {
            query += ' WHERE user_phone = ?';
            params.push(user_phone);
        }
        const [rows] = await pool.query(query, params);

        // coordinates를 항상 배열로 파싱해서 반환
        const farms = rows.map(farm => {
            let coordinates = [];
            try {
                if (Array.isArray(farm.coordinates)) {
                    coordinates = farm.coordinates;
                } else if (typeof farm.coordinates === 'string') {
                    coordinates = JSON.parse(farm.coordinates);
                }
            } catch (e) {
                coordinates = [];
            }
            return {
                ...farm,
                coordinates
            };
        });

        res.json(farms);
    } catch (error) {
        console.error('Error fetching farms:', error);
        res.status(500).json({ error: '농장 정보 조회에 실패했습니다.' });
    }
});

// 농장 삭제 API
app.delete('/api/farm/:farmId', async (req, res) => {
    const { farmId } = req.params;
    console.log('DELETE /api/farm/:farmId 호출됨, farmId:', farmId);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. 해당 농장의 crop_id 목록 조회
        const [crops] = await connection.query('SELECT crop_id FROM crop WHERE farm_id = ?', [farmId]);
        const cropIds = crops.map(crop => crop.crop_id);

        // 2. cropdetail 삭제 (해당 crop_id들)
        if (cropIds.length > 0) {
            await connection.query('DELETE FROM cropdetail WHERE crop_id IN (?)', [cropIds]);
        }

        // 3. crop 삭제
        await connection.query('DELETE FROM crop WHERE farm_id = ?', [farmId]);

        // 4. farm 삭제
        await connection.query('DELETE FROM farm WHERE farm_id = ?', [farmId]);

        await connection.commit();
        res.json({ message: '농장 및 관련 작물/상세작물이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        await connection.rollback();
        console.error('농장 삭제 중 오류:', error);
        res.status(500).json({ error: '농장 및 관련 데이터 삭제에 실패했습니다.' });
    } finally {
        connection.release();
    }
});

// 농장 정보 업데이트 API
app.put('/api/farm/:farmId', async (req, res) => {
    const { farmId } = req.params;
    const { latitude, longitude, coordinates, address } = req.body;
    console.log('PUT /api/farm/:farmId 호출됨:', { farmId, latitude, longitude, coordinates, address });

    try {
        // coordinates를 JSON 문자열로 변환
        const coordinatesJson = JSON.stringify(coordinates);

        // 쿼리 및 파라미터 로그
        const query = `
            UPDATE farm 
            SET latitude = ?, 
                longitude = ?, 
                coordinates = ?, 
                address = ?,
                updated_at = NOW()
            WHERE farm_id = ?
        `;
        const params = [latitude, longitude, coordinatesJson, address, farmId];
        console.log('쿼리:', query);
        console.log('파라미터:', params);

        // DB 업데이트
        const [result] = await pool.query(query, params);
        console.log('DB 업데이트 결과:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 농장을 찾을 수 없습니다.' });
        }

        res.json({
            message: '농장 정보가 성공적으로 업데이트되었습니다.',
            farm_id: farmId
        });
    } catch (error) {
        console.error('Error updating farm:', error);
        console.error('SQL Message:', error?.sqlMessage);
        console.error('Error Code:', error?.code);
        res.status(500).json({ error: '농장 정보 업데이트에 실패했습니다.' });
    }
});

// 특정 농장의 주소 정보 조회 API
app.get('/api/farm/address/:farmId', async (req, res) => {
    const { farmId } = req.params;
    console.log('GET /api/farm/address/:farmId 호출됨, farmId:', farmId);

    try {
        // 농장 정보 조회
        const [farm] = await pool.query(
            'SELECT farm_id, farm_name, address FROM farm WHERE farm_id = ?',
            [farmId]
        );

        if (farm.length === 0) {
            return res.status(404).json({ error: '해당 농장을 찾을 수 없습니다.' });
        }

        res.json({
            farm_id: farm[0].farm_id,
            farm_name: farm[0].farm_name,
            address: farm[0].address || '주소 정보가 없습니다.'
        });
    } catch (error) {
        console.error('Error fetching farm address:', error);
        res.status(500).json({ error: '농장 주소 정보 조회에 실패했습니다.' });
    }
});

// 농장 이미지 업데이트 API
app.put('/api/farm/image/:farmId', async (req, res) => {
    const { farmId } = req.params;
    const { farm_image } = req.body;
    console.log('PUT /api/farm/image/:farmId 호출됨:', { farmId, farm_image });

    try {
        const [result] = await pool.query(
            'UPDATE farm SET farm_image = ? WHERE farm_id = ?',
            [farm_image, farmId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 농장을 찾을 수 없습니다.' });
        }

        res.json({
            message: '농장 이미지가 성공적으로 업데이트되었습니다.',
            farm_id: farmId
        });
    } catch (error) {
        console.error('Error updating farm image:', error);
        res.status(500).json({ error: '농장 이미지 업데이트에 실패했습니다.' });
    }
});

// 작물 목록 조회
app.get('/api/crop', async (req, res) => {
    try {
        const { farm_id } = req.query;

        if (!farm_id) {
            return res.status(400).json({ error: 'farm_id is required' });
        }

        const [crops] = await pool.query(
            'SELECT * FROM crop WHERE farm_id = ? ORDER BY created_at DESC',
            [farm_id]
        );

        res.json(crops);
    } catch (error) {
        console.error('작물 목록 조회 실패:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 작물 상세 조회
app.get('/api/crop/:crop_id', async (req, res) => {
    try {
        const { crop_id } = req.params;

        const [crops] = await pool.query(
            'SELECT * FROM crop WHERE crop_id = ?',
            [crop_id]
        );

        if (crops.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        res.json(crops[0]);
    } catch (error) {
        console.error('작물 상세 조회 실패:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 작물 추가
app.post('/api/crop', async (req, res) => {
    try {
        const {
            farm_id,
            crop_name,
            crop_type,
            crop_image_url,
            crop_area_m2,
            crop_planting_date,
            crop_harvest_date,
            crop_yield_kg
        } = req.body;

        // 필수 필드 검증
        if (!farm_id || !crop_name || !crop_type || !crop_area_m2 ||
            !crop_planting_date || !crop_harvest_date || !crop_yield_kg) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // farm_id 유효성 검증
        const [farms] = await pool.query('SELECT farm_id FROM farm WHERE farm_id = ?', [farm_id]);
        if (farms.length === 0) {
            return res.status(404).json({ error: 'Farm not found' });
        }

        // 작물 추가
        const [result] = await pool.query(
            `INSERT INTO crop (
        farm_id, crop_name, crop_type, crop_image_url, 
        crop_area_m2, crop_planting_date, crop_harvest_date, crop_yield_kg
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farm_id,
                crop_name,
                crop_type,
                crop_image_url,
                crop_area_m2,
                crop_planting_date,
                crop_harvest_date,
                crop_yield_kg
            ]
        );

        res.status(201).json({
            message: 'Crop added successfully',
            crop_id: result.insertId
        });
    } catch (error) {
        console.error('작물 추가 실패:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 작물 수정
app.put('/api/crop/:crop_id', async (req, res) => {
    try {
        const { crop_id } = req.params;
        const {
            crop_name,
            crop_type,
            crop_image_url,
            crop_area_m2,
            crop_planting_date,
            crop_harvest_date,
            crop_yield_kg
        } = req.body;

        // 필수 필드 검증
        if (!crop_name || !crop_type || !crop_area_m2 ||
            !crop_planting_date || !crop_harvest_date || !crop_yield_kg) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // 작물 존재 여부 확인
        const [crops] = await pool.query('SELECT crop_id FROM crop WHERE crop_id = ?', [crop_id]);
        if (crops.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        // 작물 정보 수정
        await pool.query(
            `UPDATE crop SET 
        crop_name = ?,
        crop_type = ?,
        crop_image_url = ?,
        crop_area_m2 = ?,
        crop_planting_date = ?,
        crop_harvest_date = ?,
        crop_yield_kg = ?
      WHERE crop_id = ?`,
            [
                crop_name,
                crop_type,
                crop_image_url,
                crop_area_m2,
                crop_planting_date,
                crop_harvest_date,
                crop_yield_kg,
                crop_id
            ]
        );

        res.json({ message: 'Crop updated successfully' });
    } catch (error) {
        console.error('작물 수정 실패:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 작물 삭제
app.delete('/api/crop/:crop_id', async (req, res) => {
    try {
        const { crop_id } = req.params;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 1. cropdetail 삭제
            await connection.query('DELETE FROM cropdetail WHERE crop_id = ?', [crop_id]);
            // 2. crop 삭제
            await connection.query('DELETE FROM crop WHERE crop_id = ?', [crop_id]);
            await connection.commit();
            res.json({ message: 'Crop 및 관련 상세작물이 삭제되었습니다.' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'Crop 삭제 실패', details: error.message });
    }
});

// cropdetail 테이블 생성
const createCropDetailTable = `
CREATE TABLE IF NOT EXISTS cropdetail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_id INT NOT NULL,
  detail_name VARCHAR(255) NOT NULL,
  detail_qr_code VARCHAR(255) NOT NULL,
  detail_image_url TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (crop_id) REFERENCES crop(crop_id)
)`;

// 테이블 생성 실행
(async () => {
    try {
        await pool.query(createCropDetailTable);
        console.log('cropdetail 테이블이 생성되었습니다.');
    } catch (err) {
        console.error('cropdetail 테이블 생성 중 오류:', err);
    }
})();

// 작물 상세 정보 저장 API
app.post('/api/cropdetail', async (req, res) => {
    try {
        const { crop_id, detail_name, detail_qr_code, detail_image_url, latitude, longitude } = req.body;

        // 요청 데이터 로깅
        console.log('작물 상세 정보 저장 요청:', {
            crop_id,
            detail_name,
            detail_qr_code,
            detail_image_url,
            latitude,
            longitude
        });

        // 필수 필드 검증
        if (!crop_id || !detail_name || !detail_qr_code || !latitude || !longitude) {
            console.error('필수 필드 누락:', { crop_id, detail_name, detail_qr_code, latitude, longitude });
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                details: '작물 ID, 이름, QR코드, 위도, 경도는 필수 입력 항목입니다.'
            });
        }

        // 위도, 경도 값 검증
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({
                error: '잘못된 좌표값입니다.',
                details: '위도와 경도는 숫자여야 합니다.'
            });
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                error: '잘못된 좌표값입니다.',
                details: '위도는 -90~90, 경도는 -180~180 사이의 값이어야 합니다.'
            });
        }

        // crop_id 유효성 검증
        const [crops] = await pool.query('SELECT crop_id FROM crop WHERE crop_id = ?', [crop_id]);
        if (crops.length === 0) {
            return res.status(404).json({
                error: '작물을 찾을 수 없습니다.',
                details: '유효한 작물 ID를 입력해주세요.'
            });
        }

        const query = `
      INSERT INTO cropdetail 
      (crop_id, detail_name, detail_qr_code, detail_image_url, latitude, longitude) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const [results] = await pool.query(
            query,
            [crop_id, detail_name, detail_qr_code, detail_image_url || null, lat, lng]
        );

        console.log('작물 상세 정보 저장 성공:', {
            insertId: results.insertId,
            affectedRows: results.affectedRows,
            savedCoordinates: { latitude: lat, longitude: lng }
        });

        res.status(201).json({
            message: '작물 상세 정보가 성공적으로 저장되었습니다.',
            cropDetailId: results.insertId,
            coordinates: { latitude: lat, longitude: lng }
        });
    } catch (error) {
        console.error('작물 상세 정보 저장 중 오류:', error);
        console.error('에러 상세:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
        res.status(500).json({
            error: '작물 상세 정보 저장에 실패했습니다.',
            details: error.sqlMessage || error.message
        });
    }
});

// 장터 제품 검색 API
app.get('/api/market/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        // market_image_url도 함께 가져오기
        const [products] = await pool.query(
            `SELECT 
                market_id,
                market_name,
                market_price,
                market_image_url,
                market_created_at
            FROM market 
            WHERE market_name LIKE ? 
            ORDER BY market_created_at DESC`,
            [`%${query}%`]
        );

        res.json({
            success: true,
            products: products
        });
    } catch (error) {
        console.error('장터 제품 검색 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '검색 중 오류가 발생했습니다.'
        });
    }
});

// 작물 상세 정보 조회 API
app.get('/api/cropdetail', async (req, res) => {
    try {
        const { user_phone } = req.query;

        if (!user_phone) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                details: 'user_phone은 필수 입력 항목입니다.'
            });
        }

        // 사용자의 농장 ID 목록 조회
        const [farms] = await pool.query(
            'SELECT farm_id FROM farm WHERE user_phone = ?',
            [user_phone]
        );

        if (farms.length === 0) {
            return res.json([]); // 농장이 없는 경우 빈 배열 반환
        }

        const farmIds = farms.map(farm => farm.farm_id);

        // 해당 농장들의 작물 ID 및 farm_id, farm_name 조회
        const [crops] = await pool.query(
            'SELECT crop_id, farm_id, crop_name FROM crop WHERE farm_id IN (?)',
            [farmIds]
        );

        if (crops.length === 0) {
            return res.json([]); // 작물이 없는 경우 빈 배열 반환
        }

        const cropIds = crops.map(crop => crop.crop_id);
        // crop_id -> farm_id, crop_name, farm_name 매핑
        const cropIdToFarmId = {};
        const cropIdToCropName = {};
        const cropIdToFarmName = {};
        for (const crop of crops) {
            cropIdToFarmId[crop.crop_id] = crop.farm_id;
            cropIdToCropName[crop.crop_id] = crop.crop_name;
        }
        // farm_id -> farm_name 매핑
        const [farmRows] = await pool.query(
            'SELECT farm_id, farm_name FROM farm WHERE farm_id IN (?)',
            [farmIds]
        );
        for (const farm of farmRows) {
            for (const crop of crops) {
                if (crop.farm_id === farm.farm_id) {
                    cropIdToFarmName[crop.crop_id] = farm.farm_name;
                }
            }
        }

        // 작물 상세 정보 조회
        const [results] = await pool.query(
            'SELECT * FROM cropdetail WHERE crop_id IN (?) ORDER BY created_at DESC',
            [cropIds]
        );

        // crop_id, farm_id, farm_name, crop_name을 각 상세에 추가
        const resultsWithFarmInfo = results.map(detail => {
            // memo가 문자열이면 파싱
            let parsedMemo = detail.memo;
            if (parsedMemo && typeof parsedMemo === 'string') {
                try {
                    parsedMemo = JSON.parse(parsedMemo);
                } catch (e) {
                    parsedMemo = [];
                }
            }
            return {
                ...detail,
                crop_id: detail.crop_id,
                farm_id: cropIdToFarmId[detail.crop_id] || null,
                farm_name: cropIdToFarmName[detail.crop_id] || null,
                crop_name: cropIdToCropName[detail.crop_id] || null,
                memo: parsedMemo,
            };
        });

        // console.log('조회된 작물 상세 정보:', resultsWithFarmInfo);
        res.json(resultsWithFarmInfo);
    } catch (error) {
        console.error('작물 상세 정보 조회 중 오류:', error);
        res.status(500).json({
            error: '작물 상세 정보 조회에 실패했습니다.',
            details: error.sqlMessage || error.message
        });
    }
});

// 특정 작물 상세 정보 조회 API
app.get('/api/cropdetail/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await pool.query('SELECT * FROM cropdetail WHERE cropdetail_id = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: '해당 작물 상세 정보를 찾을 수 없습니다.' });
        }
        const detail = results[0];
        // memo가 문자열이면 JSON 파싱, 객체면 그대로
        if (detail.memo && typeof detail.memo === 'string') {
            try {
                detail.memo = JSON.parse(detail.memo);
            } catch (e) {
                detail.memo = [];
            }
        }
        res.json(detail);
    } catch (error) {
        res.status(500).json({ error: '작물 상세 정보 조회에 실패했습니다.' });
    }
});

// cropdetail 정보(메모 포함) 수정 API
app.put('/api/cropdetail/:id', async (req, res) => {
    console.log('cropdetail 수정 API 호출됨:', {
        id: req.params.id,
        body: req.body
    });

    try {
        const { id } = req.params;
        const { latitude, longitude, memo, detail_image_url, detail_name, detail_qr_code } = req.body;

        console.log('수정할 데이터:', {
            id,
            latitude,
            longitude,
            memo,
            detail_image_url,
            detail_name,
            detail_qr_code
        });

        // 메모 데이터를 JSON 문자열로 변환
        const memoJson = memo ? JSON.stringify(memo) : null;

        // 기존 데이터 조회
        const [existingData] = await pool.query(
            'SELECT latitude, longitude, detail_image_url, detail_name, detail_qr_code FROM cropdetail WHERE cropdetail_id = ?',
            [id]
        );

        if (existingData.length === 0) {
            return res.status(404).json({ error: '수정할 작물을 찾을 수 없습니다.' });
        }

        // 제공되지 않은 경우 기존 값 사용
        const finalLatitude = latitude ?? existingData[0].latitude;
        const finalLongitude = longitude ?? existingData[0].longitude;
        const finalDetailImageUrl = detail_image_url ?? existingData[0].detail_image_url;
        const finalDetailName = detail_name ?? existingData[0].detail_name;
        const finalDetailQrCode = detail_qr_code ?? existingData[0].detail_qr_code;

        // 데이터베이스 업데이트
        const [result] = await pool.query(
            'UPDATE cropdetail SET latitude = ?, longitude = ?, memo = ?, detail_image_url = ?, detail_name = ?, detail_qr_code = ?, updated_at = NOW() WHERE cropdetail_id = ?',
            [finalLatitude, finalLongitude, memoJson, finalDetailImageUrl, finalDetailName, finalDetailQrCode, id]
        );

        console.log('데이터베이스 업데이트 결과:', result);

        console.log('수정 성공');
        res.json({
            success: true,
            message: '작물 정보가 성공적으로 수정되었습니다.',
            updatedData: {
                latitude: finalLatitude,
                longitude: finalLongitude,
                memo: memoJson,
                detail_image_url: finalDetailImageUrl,
                detail_name: finalDetailName,
                detail_qr_code: finalDetailQrCode
            }
        });
    } catch (error) {
        console.error('수정 중 오류 발생:', error);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// cropdetail 삭제 API (cropdetail_id 기준, 에러 핸들러 바로 위에 위치)
app.delete('/api/cropdetail/:cropdetail_id', async (req, res) => {
    try {
        const { cropdetail_id } = req.params;
        const [details] = await pool.query('SELECT cropdetail_id FROM cropdetail WHERE cropdetail_id = ?', [cropdetail_id]);
        if (details.length === 0) {
            return res.status(404).json({ error: '해당 작물 상세 정보를 찾을 수 없습니다.' });
        }
        await pool.query('DELETE FROM cropdetail WHERE cropdetail_id = ?', [cropdetail_id]);
        res.json({ message: '작물 상세 정보가 삭제되었습니다.' });
    } catch (error) {
        console.error('작물 상세 정보 삭제 실패:', error);
        res.status(500).json({ error: '작물 상세 정보 삭제에 실패했습니다.' });
    }
});


// 상세작물 위치(위도, 경도)만 독립적으로 수정하는 API
app.put('/api/cropdetail/location/:id', async (req, res) => {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    console.log('위치 수정 요청 받음:', {
        id,
        latitude,
        longitude,
        body: req.body
    });

    if (latitude === undefined || longitude === undefined) {
        console.error('위치 수정 실패: 필수 값 누락', { latitude, longitude });
        return res.status(400).json({ error: 'latitude, longitude는 필수입니다.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cropdetail SET latitude = ?, longitude = ? WHERE cropdetail_id = ?',
            [latitude, longitude, id]
        );

        console.log('위치 수정 결과:', {
            affectedRows: result.affectedRows,
            id,
            newLocation: { latitude, longitude }
        });

        if (result.affectedRows === 0) {
            console.error('위치 수정 실패: 해당 상세작물을 찾을 수 없음', { id });
            return res.status(404).json({ error: '해당 상세작물을 찾을 수 없습니다.' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('위치 수정 중 오류 발생:', {
            error: error.message,
            sqlMessage: error.sqlMessage,
            id,
            latitude,
            longitude
        });
        res.status(500).json({
            error: '상세작물 위치 수정에 실패했습니다.',
            details: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});


// 게시글 북마크 추가/해제 API
app.post('/api/post/bookmark', async (req, res) => {
    const { postId, phone, bookmark } = req.body;
    try {
        if (bookmark) {
            // 북마크 추가 (중복 방지)
            await pool.query(
                'INSERT IGNORE INTO post_bookmarks (post_id, user_phone) VALUES (?, ?)',
                [postId, phone]
            );
        } else {
            // 북마크 해제
            await pool.query(
                'DELETE FROM post_bookmarks WHERE post_id = ? AND user_phone = ?',
                [postId, phone]
            );
        }
        res.json({ success: true, is_bookmarked: bookmark });
    } catch (error) {
        res.status(500).json({ error: '서버 오류', details: error.message });
    }
});


// 유저의 농장 목록 조회 API
app.get('/api/farms/user/:phone', async (req, res) => {
    const { phone } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT farm_id as id, user_phone, farm_name, address, farm_image FROM farm WHERE user_phone = ?',
            [phone]
        );
        res.json({ farms: rows });
    } catch (error) {
        console.error('유저 농장 목록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
})

// 일지 목록 조회 API
app.get('/diary/list', async (req, res) => {
    try {
        const user_phone = req.query.user_phone;
        if (!user_phone) return res.status(400).json({ error: 'user_phone 필요' });
        const [rows] = await pool.query(
            'SELECT * FROM diary WHERE user_phone = ? ORDER BY diary_date DESC',
            [user_phone]
        );
        res.json(rows);
    } catch (error) {
        console.error('일지 목록 조회 실패:', error);
        res.status(500).json({ error: '일지 목록을 가져오는데 실패했습니다.' });
    }
});

// diary_date를 MySQL DATETIME 포맷으로 변환하는 함수
function toMysqlDatetime(isoString) {
    // '2025-05-17T15:26:44.646Z' → '2025-05-17 15:26:44'
    if (!isoString) return null;
    return isoString.replace('T', ' ').replace('Z', '').split('.')[0];
}

// 일지 작성 API (토큰 없이 user_phone을 body에서 받음)
app.post('/diary/create', async (req, res) => {
    console.log('일지 작성 요청 body:', req.body);
    console.log('user_phone:', req.body.user_phone);
    let { diary_date, content, crop_type, user_phone } = req.body;
    diary_date = toMysqlDatetime(diary_date);
    console.log('변환된 diary_date:', diary_date);
    try {
        const [result] = await pool.query(
            'INSERT INTO diary (user_phone, diary_date, content, crop_type) VALUES (?, ?, ?, ?)',
            [user_phone, diary_date, content, crop_type]
        );
        res.status(201).json({
            message: '일지가 성공적으로 저장되었습니다.',
            diary_id: result.insertId
        });
    } catch (error) {
        console.error('일지 저장 실패:', error);
        res.status(500).json({ error: '일지 저장에 실패했습니다.' });
    }
});

// 일지 삭제 API
app.delete('/diary/:diary_id', async (req, res) => {
    const { diary_id } = req.params;
    const user_phone = req.query.user_phone;
    if (!user_phone) return res.status(400).json({ error: 'user_phone 필요' });
    try {
        // 해당 일지가 사용자의 것인지 확인
        const [diary] = await pool.query(
            'SELECT * FROM diary WHERE diary_id = ? AND user_phone = ?',
            [diary_id, user_phone]
        );
        if (diary.length === 0) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        // 일지 삭제
        await pool.query(
            'DELETE FROM diary WHERE diary_id = ?',
            [diary_id]
        );
        res.json({ message: '일지가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('일지 삭제 실패:', error);
        res.status(500).json({ error: '일지 삭제에 실패했습니다.' });
    }
});

// 이미지 S3 미러링 함수 (기존 코드에 영향 X)
async function mirrorImageToS3(imageUrl) {
    const fileName = `pest-ai/mirrored-${uuidv4()}.jpg`;
    const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
        timeout: 10000
    });
    const passThrough = new stream.PassThrough();
    response.data.pipe(passThrough);
    const uploadResult = await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: passThrough,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    }).promise();
    return uploadResult.Location;
}

// AI 병해충 진단 API
app.post('/api/ai/pest-diagnosis', async (req, res) => {
    try {
        const { crop, partName, symptomName, detail, image } = req.body;

        // Gemini Flash API 호출
        const modelName = 'gemini-2.0-flash';
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=` + process.env.GEMINI_API_KEY;
        console.log('Gemini API 모델:', modelName);

        // 프롬프트 구성 (더 구체적이고 명확하게)
        let prompt = `작물: ${crop}\n부위: ${partName}\n증상: ${symptomName}\n설명: ${detail}\n`;
        prompt += `\n\n아래 조건을 반드시 지켜서 답변해줘.\n`;
        prompt += `1. 사용자가 입력한 텍스트 정보(작물, 부위, 증상, 상세설명)를 가장 중요하게 참고해서 진단하고, 이미지는 부가적으로 참고해.\n`;
        prompt += `2. 가장 가능성이 높은 병명, 증상, 방제법을 정리해줘.\n`;
        prompt += `3. 비슷한 증상을 보이는 다른 병해충도 최소 2가지 이상 함께 안내해줘.\n`;
        prompt += `4. 각 병해충별로 주요 증상 차이점, 방제법, 추천 약품, 추천 비료를 포함해.\n`;
        prompt += `5. 반드시 진단 근거(이미지에서 어떤 특징을 보고 판단했는지, 텍스트 정보 중 어떤 부분이 결정적이었는지)를 명확히 설명해.\n`;
        prompt += `6. 답변 마지막에 "정확한 진단과 방제를 위해서는 반드시 전문가 상담이 필요합니다."라는 경고문을 추가해.`;
        prompt += `7. 확신이 없을 경우 이유와 함께 "불확실합니다."라고 답변해.\n`;
        prompt += `8. 이미지에서 병징이 뚜렷한지 여부도 같이 평가해.\n`;
        prompt += `9. 각 병해충의 피해 심각도를 구분해서 표시해줘 (경미/보통/심각).\n`;
        prompt += `10. 피해 심각도에 따라 추천 조치 방법을 표시해줘.\n`;
        prompt += `11. 답변은 다음 순서로 작성해:\n1) 주요 병해 정보\n2) 유사 병해 비교\n3) 진단 근거 설명\n4) 이미지 평가\n5) 피해 심각도와 조치 방법\n6) 전문가 상담 경고문\n`;
        prompt += `12. 표 형식 대신 일반 텍스트로 작성해줘.\n`;
        prompt += `13. 병명, 증상, 방제법, 추천 약품, 추천 비료, 주요 증상 차이점 등 중요한 정보는 반드시 **두 개의 별표(asterisk)**로 감싸서 답변해줘. 예시:\n`;
        prompt += `- **병명:** **복숭아 세균성구멍병**\n- **증상:** **과실에 작은 갈색 반점이 생기며...**\n- **방제법:** **월동 병원균의 밀도를 낮추기 위해...**\n- **추천 약품:** **아그렙토마이신, 옥시테트라사이클린-동 복합제**\n- **주요 증상 차이점:** **구멍이 뚫리는 증상**\n`;
        prompt += `14. 병 해충명은 한글만 사용해줘. 영어 병 해충명은 사용하지 말아줘.\n`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        ...(image ? [{ inlineData: { mimeType: 'image/jpeg', data: image } }] : [])
                    ]
                }
            ]
        };

        const response = await axios.post(url, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiText) {
            throw new Error('AI가 답변을 반환하지 않았습니다.');
        }

        // 이미지 URL 추출
        const imageUrls = [];
        const lines = aiText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('[이미지:')) {
                const diseaseName = lines[i].match(/\[이미지:(.*?)\]/)[1];
                if (lines[i + 1] && lines[i + 1].startsWith('URL:')) {
                    const imageUrl = lines[i + 1].replace('URL:', '').trim();
                    imageUrls.push({ diseaseName, imageUrl });
                }
            }
        }
        // === S3 미러링 적용 (기존 로직, 변수, 응답 구조 등 절대 건드리지 않음) ===
        for (let i = 0; i < imageUrls.length; i++) {
            try {
                const mirroredUrl = await mirrorImageToS3(imageUrls[i].imageUrl);
                imageUrls[i].imageUrl = mirroredUrl;
            } catch (e) {
                // 실패 시 원본 URL 유지
            }
        }
        res.json({
            success: true,
            result: aiText,
            similarImages: imageUrls
        });

    } catch (error) {
        console.error('AI 진단 오류:', error);

        if (error.response?.status === 429) {
            res.status(429).json({
                success: false,
                message: 'AI 요청 제한에 도달했습니다. 잠시 후 다시 시도해주세요.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'AI 서버 연결에 실패했습니다.'
            });
        }
    }
});


// 상품 수정 API
app.put('/api/market/:marketId', async (req, res) => {
    try {
        const { marketId } = req.params;
        const {
            name,
            market_name,
            market_category,
            market_price,
            market_image_url,
            market_content,
            phone,
            market_like
        } = req.body;

        // 필수 정보 검증
        if (!marketId || !market_name || !market_category || !market_price || !market_image_url || !market_content || !phone) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 상품이 존재하는지와 권한이 있는지 확인
        const [market] = await pool.query(
            'SELECT * FROM market WHERE market_id = ? AND phone = ?',
            [marketId, phone]
        );

        if (market.length === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없거나 권한이 없습니다.'
            });
        }

        // 상품 정보 업데이트
        await pool.query(`
            UPDATE market 
            SET 
                name = ?,
                market_name = ?,
                market_category = ?,
                market_price = ?,
                market_image_url = ?,
                market_content = ?,
                market_like = ?,
                market_update_at = CURRENT_TIMESTAMP
            WHERE market_id = ?
        `, [
            name,
            market_name,
            market_category,
            market_price,
            market_image_url,
            market_content,
            market_like || 0, // market_like가 없으면 0으로 설정
            marketId
        ]);

        res.json({
            success: true,
            message: '상품이 수정되었습니다.'
        });

    } catch (error) {
        console.error('상품 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상품 삭제 API
app.delete('/api/market/:marketId', async (req, res) => {
    try {
        const { marketId } = req.params;
        const { phone } = req.body;

        if (!marketId || !phone) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 상품이 존재하는지와 권한이 있는지 확인
        const [market] = await pool.query(
            'SELECT * FROM market WHERE market_id = ? AND phone = ?',
            [marketId, phone]
        );

        if (market.length === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없거나 권한이 없습니다.'
            });
        }

        // 상품 삭제
        await pool.query(
            'DELETE FROM market WHERE market_id = ?',
            [marketId]
        );

        // 관련된 관심 상품도 삭제
        await pool.query(
            'DELETE FROM market_likes WHERE market_id = ?',
            [marketId]
        );

        res.json({
            success: true,
            message: '상품이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상품(장터) 문의(댓글) 개수 조회 API
app.get('/api/market/comment/count', async (req, res) => {
    const { market_id } = req.query;
    if (!market_id) {
        return res.status(400).json({ success: false, message: 'market_id 필요' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count FROM Market_comment WHERE market_id = ?`,
            [market_id]
        );
        res.json({ success: true, count: rows[0].count || 0 });
    } catch (e) {
        console.error('장터 문의 개수 조회 실패:', e);
        res.status(500).json({ success: false, message: '장터 문의 개수 조회 실패' });
    }
});

// 판매 상품 목록 조회 API (상태별 필터링)
app.get('/api/market/sales', async (req, res) => {
    console.log('판매 상품 목록 조회 API 호출됨');
    try {
        const { phone, status } = req.query;

        if (!phone || !status) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 상태에 따라 상품 목록 조회
        const [items] = await pool.query(
            'SELECT * FROM market WHERE phone = ? AND market_status = ? ORDER BY market_created_at DESC',
            [phone, status]
        );

        res.json({
            success: true,
            items: items
        });

    } catch (error) {
        console.error('상품 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상품 상태 변경 API
app.put('/api/market/:marketId/status', async (req, res) => {
    console.log('상품 상태 변경 API 호출됨');
    try {
        const { marketId } = req.params;
        const { market_status, phone } = req.body;

        if (!marketId || !market_status || !phone) {
            return res.status(400).json({
                success: false,
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 상품이 존재하는지 확인
        const [market] = await pool.query(
            'SELECT * FROM market WHERE market_id = ? AND phone = ?',
            [marketId, phone]
        );

        if (market.length === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없거나 권한이 없습니다.'
            });
        }

        // 상태 변경
        await pool.query(
            'UPDATE market SET market_status = ? WHERE market_id = ?',
            [market_status, marketId]
        );

        res.json({
            success: true,
            message: '상태가 변경되었습니다.'
        });

    } catch (error) {
        console.error('상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관심 상품 목록 조회 API (수정)
app.get('/api/market/likes', async (req, res) => {
    console.log('관심 상품 목록 조회 API 호출됨');
    try {
        const { phone } = req.query;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: '전화번호가 필요합니다.'
            });
        }

        // market_likes와 market 테이블을 JOIN하여 한 번에 모든 정보 가져오기
        const [likes] = await pool.query(
            `SELECT m.* 
             FROM market m
             INNER JOIN market_likes ml ON m.market_id = ml.market_id
             WHERE ml.phone = ?`,
            [phone]
        );

        res.json({
            success: true,
            likes: likes
        });

    } catch (error) {
        console.error('관심 상품 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 상품 등록 API
app.post('/api/market', async (req, res) => {
    try {
        const {
            name,
            market_name,
            market_category,
            market_price,
            market_image_url,
            market_content,
            phone
        } = req.body;

        if (!name || !market_name || !market_category || !market_price || !market_image_url || !phone) {
            return res.status(400).json({ success: false, message: '필수 항목 누락' });
        }

        const sql = `
        INSERT INTO Market
        (name, market_name, market_category, market_price, market_image_url, market_content, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
        await pool.query(sql, [
            name,
            market_name,
            market_category,
            market_price,
            market_image_url,
            market_content,
            phone
        ]);

        res.json({ success: true, message: '상품 등록 성공' });
    } catch (err) {
        console.error('상품 등록 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});

// server/index.js

app.get('/api/market', async (req, res) => {
    try {
        console.log('=== 마켓 상품 목록 API 호출됨 ===');
        const query = `
            SELECT 
                market_id,
                name,
                market_name,
                market_category,
                market_price,
                market_image_url,
                market_content,
                market_created_at,
                market_update_at,
                phone,
                market_status,
                market_like
            FROM market
            WHERE market_status IN ('판매중', '예약중')
        `;
        const [products] = await pool.query(query);
        console.log('조회된 상품 수:', products.length);
        res.json(products);
    } catch (error) {
        console.error('마켓 상품 목록 조회 에러:', error);
        res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' });
    }
});

// 상품(장터) 댓글 목록 조회 API (market_id로만 조회)
app.get('/api/market/comment', async (req, res) => {
    const { market_id } = req.query;
    if (!market_id) {
        return res.status(400).json({ success: false, message: 'market_id 필요' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                mc.market_comment_id,
                mc.market_comment_content,
                mc.market_comment_created_at,
                mc.market_comment_parent_id,
                mc.phone,
                u.name,
                u.region,
                u.introduction,
                u.profile_image
            FROM Market_comment mc
            LEFT JOIN user u ON mc.phone = u.phone
            WHERE mc.market_id = ?
            ORDER BY mc.market_comment_created_at ASC
        `, [market_id]);

        const comments = rows.map(row => ({
            id: row.market_comment_id,
            comment_content: row.market_comment_content,
            time: row.market_comment_created_at,
            parentId: row.market_comment_parent_id,
            phone: row.phone,
            user: row.name || '',
            region: row.region || '지역 미설정',
            introduction: row.introduction || '소개 미설정',
            profile: row.profile_image || ''
        }));

        res.json({ success: true, comments });
    } catch (e) {
        console.error('장터 댓글 조회 실패:', e);
        res.status(500).json({ success: false, message: '장터 댓글 조회 실패' });
    }
});

// 게시글 수정 API
app.put('/api/post/:postId', async (req, res) => {
    console.log('게시글 수정 API 호출됨');
    const { postId } = req.params;
    const { post_content, image_urls, post_category } = req.body;

    try {
        console.log('수정 요청된 post_id:', postId);
        console.log('수정할 데이터:', req.body);

        // 1. 먼저 해당 게시글이 존재하는지 확인
        const [post] = await pool.query(
            'SELECT * FROM post WHERE post_id = ?',
            [postId]
        );

        console.log('조회된 게시글:', post);

        if (post.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 2. 게시글 수정
        const [updateResult] = await pool.query(
            `UPDATE post 
             SET post_content = ?, 
                 image_urls = ?, 
                 post_category = ?,
                 post_update_at = CURRENT_TIMESTAMP
             WHERE post_id = ?`,
            [post_content, JSON.stringify(image_urls), post_category, postId]
        );

        console.log('수정 결과:', updateResult);

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: '게시글 수정에 실패했습니다.' });
        }

        // 3. 수정된 게시글 정보 조회
        const [updatedPost] = await pool.query(
            'SELECT * FROM post WHERE post_id = ?',
            [postId]
        );

        res.status(200).json({
            message: '게시글이 성공적으로 수정되었습니다.',
            post: updatedPost[0]
        });
    } catch (error) {
        console.error('게시글 수정 중 오류 발생:', error);
        res.status(500).json({
            message: '게시글 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 게시글 삭제 API
app.delete('/api/post/:postId', async (req, res) => {
    console.log('게시글 삭제 API 호출됨');
    const { postId } = req.params;

    try {
        console.log('삭제 요청된 post_id:', postId);

        // 1. 먼저 해당 게시글이 존재하는지 확인
        const [post] = await pool.query(
            'SELECT * FROM post WHERE post_id = ?',
            [postId]
        );

        console.log('조회된 게시글:', post);

        if (post.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 2. 트랜잭션 시작
        await pool.query('START TRANSACTION');

        try {
            // 3. 관련된 데이터 삭제 (순서 중요)
            // 3-1. 댓글 좋아요 삭제
            await pool.query(
                'DELETE cl FROM comment_likes cl INNER JOIN comment c ON cl.comment_id = c.comment_id WHERE c.post_id = ?',
                [postId]
            );

            // 3-2. 댓글 삭제
            await pool.query(
                'DELETE FROM comment WHERE post_id = ?',
                [postId]
            );

            // 3-3. 게시글 좋아요 삭제
            await pool.query(
                'DELETE FROM post_likes WHERE post_id = ?',
                [postId]
            );

            // 3-4. 게시글 북마크 삭제
            await pool.query(
                'DELETE FROM post_bookmarks WHERE post_id = ?',
                [postId]
            );

            // 3-5. 마지막으로 게시글 삭제
            const [deleteResult] = await pool.query(
                'DELETE FROM post WHERE post_id = ?',
                [postId]
            );

            // 4. 트랜잭션 커밋
            await pool.query('COMMIT');

            console.log('삭제 결과:', deleteResult);

            if (deleteResult.affectedRows === 0) {
                return res.status(400).json({ message: '게시글 삭제에 실패했습니다.' });
            }

            res.status(200).json({
                message: '게시글이 성공적으로 삭제되었습니다.'
            });

        } catch (error) {
            // 5. 오류 발생 시 롤백
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        res.status(500).json({
            message: '게시글 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 댓글 수정 API
app.put('/api/comment/:commentId', async (req, res) => {
    console.log('댓글 수정 API 호출됨');
    const { commentId } = req.params;
    const { comment_content } = req.body;

    try {
        console.log('수정 요청된 comment_id:', commentId);
        console.log('수정할 내용:', comment_content);

        // 1. 먼저 해당 댓글이 존재하는지 확인
        const [comment] = await pool.query(
            'SELECT * FROM comment WHERE comment_id = ?',
            [commentId]
        );

        console.log('조회된 댓글:', comment);

        if (comment.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 2. 댓글 수정
        const [updateResult] = await pool.query(
            `UPDATE comment 
             SET comment_content = ?,
                 comment_update_at = CURRENT_TIMESTAMP
             WHERE comment_id = ?`,
            [comment_content, commentId]
        );

        console.log('수정 결과:', updateResult);

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: '댓글 수정에 실패했습니다.' });
        }

        // 3. 수정된 댓글 정보 조회
        const [updatedComment] = await pool.query(
            'SELECT * FROM comment WHERE comment_id = ?',
            [commentId]
        );

        res.status(200).json({
            message: '댓글이 성공적으로 수정되었습니다.',
            comment: updatedComment[0]
        });

    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        res.status(500).json({
            message: '댓글 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 댓글 삭제 API
app.delete('/api/comment/:commentId', async (req, res) => {
    console.log('댓글 삭제 API 호출됨');
    const { commentId } = req.params;

    try {
        console.log('삭제 요청된 comment_id:', commentId);

        // 1. 먼저 해당 댓글이 존재하는지 확인
        const [comment] = await pool.query(
            'SELECT * FROM comment WHERE comment_id = ?',
            [commentId]
        );

        console.log('조회된 댓글:', comment);

        if (comment.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 2. 트랜잭션 시작
        await pool.query('START TRANSACTION');

        try {
            // 3. 관련된 데이터 삭제 (순서 중요)
            // 3-1. 댓글 좋아요 삭제
            await pool.query(
                'DELETE FROM comment_likes WHERE comment_id = ?',
                [commentId]
            );

            // 3-2. 대댓글 삭제 (해당 댓글의 대댓글들)
            await pool.query(
                'DELETE FROM comment WHERE comment_parent_id = ?',
                [commentId]
            );

            // 3-3. 마지막으로 댓글 삭제
            const [deleteResult] = await pool.query(
                'DELETE FROM comment WHERE comment_id = ?',
                [commentId]
            );

            // 4. 트랜잭션 커밋
            await pool.query('COMMIT');

            console.log('삭제 결과:', deleteResult);

            if (deleteResult.affectedRows === 0) {
                return res.status(400).json({ message: '댓글 삭제에 실패했습니다.' });
            }

            res.status(200).json({
                message: '댓글이 성공적으로 삭제되었습니다.'
            });

        } catch (error) {
            // 5. 오류 발생 시 롤백
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        res.status(500).json({
            message: '댓글 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 장터 댓글 수정 API
app.put('/api/market/comment/:commentId', async (req, res) => {
    console.log('장터 댓글 수정 API 호출됨');
    const { commentId } = req.params;
    const { market_comment_content } = req.body;

    try {
        console.log('수정 요청된 comment_id:', commentId);
        console.log('수정할 내용:', market_comment_content);

        // 1. 먼저 해당 댓글이 존재하는지 확인
        const [comment] = await pool.query(
            'SELECT * FROM market_comment WHERE market_comment_id = ?',
            [commentId]
        );

        console.log('조회된 댓글:', comment);

        if (comment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '댓글을 찾을 수 없습니다.'
            });
        }

        // 2. 댓글 수정
        const [updateResult] = await pool.query(
            `UPDATE market_comment 
             SET market_comment_content = ?,
                 market_comment_update_at = CURRENT_TIMESTAMP
             WHERE market_comment_id = ?`,
            [market_comment_content, commentId]
        );

        console.log('수정 결과:', updateResult);

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: '댓글 수정에 실패했습니다.'
            });
        }

        // 3. 수정된 댓글 정보 조회
        const [updatedComment] = await pool.query(
            'SELECT * FROM market_comment WHERE market_comment_id = ?',
            [commentId]
        );

        res.status(200).json({
            success: true,
            message: '댓글이 성공적으로 수정되었습니다.',
            comment: updatedComment[0]
        });

    } catch (error) {
        console.error('장터 댓글 수정 중 오류 발생:', error);
        res.status(500).json({
            success: false,
            message: '댓글 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 알림 목록 조회 API
app.get('/api/notifications', async (req, res) => {
    console.log('알림 목록 조회 API 호출됨');
    const { phone } = req.query;

    try {
        const [notifications] = await pool.query(
            `SELECT n.*, 
                u.name as actor_name,
                u.region as actor_region,
                p.post_content,
                m.market_name,
                c.comment_content,
                mc.market_comment_content,
                pmc.market_comment_content as parent_market_comment_content,
                pc.comment_content as parent_comment_content,
                CASE 
                    WHEN n.type = 'COMMENT_LIKE' THEN (
                        SELECT post_content 
                        FROM post 
                        WHERE post_id = (
                            SELECT post_id 
                            FROM comment 
                            WHERE comment_id = n.target_comment_id
                        )
                    )
                    ELSE p2.post_content 
                END as parent_post_content
            FROM Notifications n
            LEFT JOIN user u ON n.actor_phone = u.phone
            LEFT JOIN post p ON n.target_post_id = p.post_id
            LEFT JOIN market m ON n.target_market_id = m.market_id
            LEFT JOIN comment c ON n.target_comment_id = c.comment_id
            LEFT JOIN market_comment mc ON n.target_comment_id = mc.market_comment_id
            LEFT JOIN market_comment pmc ON mc.market_comment_parent_id = pmc.market_comment_id
            LEFT JOIN comment pc ON c.comment_parent_id = pc.comment_id
            LEFT JOIN post p2 ON pc.post_id = p2.post_id
            WHERE n.recipient_phone = ?
            ORDER BY n.created_at DESC
            LIMIT 50`,
            [phone]
        );

        // 읽지 않은 알림이 있는지 확인
        const [unreadCount] = await pool.query(
            `SELECT COUNT(*) as count 
            FROM Notifications 
            WHERE recipient_phone = ? AND is_read = 0`,
            [phone]
        );

        // 모달이 열릴 때 모든 알림을 읽음 처리
        await pool.query(
            `UPDATE Notifications 
            SET is_read = 1 
            WHERE recipient_phone = ? AND is_read = 0`,
            [phone]
        );

        res.json({
            success: true,
            notifications: notifications,
            hasUnreadNotifications: unreadCount[0].count > 0
        });

    } catch (error) {
        console.error('알림 조회 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 조회 중 오류가 발생했습니다.'
        });
    }
});

// 알림 읽음 처리 API
app.post('/api/notifications/read', async (req, res) => {
    console.log('알림 읽음 처리 API 호출됨');
    const { phone } = req.body;

    try {
        // 해당 사용자의 모든 알림을 읽음 처리
        await pool.query(
            `UPDATE Notifications 
            SET is_read = 1 
            WHERE recipient_phone = ? AND is_read = 0`,
            [phone]
        );

        res.json({
            success: true,
            message: '알림이 읽음 처리되었습니다.'
        });

    } catch (error) {
        console.error('알림 읽음 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 읽음 처리 중 오류가 발생했습니다.'
        });
    }
});

// QR코드로 상세 작물 정보 조회 API
app.get('/api/cropdetail/qr/:qrCode', async (req, res) => {
    console.log('QR코드로 상세 작물 정보 조회 API 호출됨');
    try {
        const { qrCode } = req.params;

        // QR코드로 상세 작물 정보 조회
        const [cropDetails] = await pool.query(
            `SELECT cd.*, c.farm_id, f.farm_name 
            FROM cropdetail cd
            JOIN crop c ON cd.crop_id = c.crop_id
            JOIN farm f ON c.farm_id = f.farm_id
            WHERE cd.detail_qr_code = ?`,
            [qrCode]
        );

        if (cropDetails.length > 0) {
            res.json({
                success: true,
                cropDetail: cropDetails[0]
            });
        } else {
            res.json({
                success: false,
                message: '일치하는 QR코드를 찾을 수 없습니다.'
            });
        }
    } catch (error) {
        console.error('QR코드 조회 중 오류:', error);
        res.status(500).json({
            success: false,
            message: 'QR코드 조회 중 오류가 발생했습니다.'
        });
    }
});

// 알림 생성 헬퍼 함수
async function createNotification({
    recipientPhone,
    actorPhone,
    type,
    targetCommentId = null,
    targetPostId = null,
    targetMarketId = null
}) {
    try {
        const [result] = await pool.query(
            `INSERT INTO Notifications 
             (recipient_phone, actor_phone, type, target_comment_id, target_post_id, target_market_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [recipientPhone, actorPhone, type, targetCommentId, targetPostId, targetMarketId]
        );
        return result.insertId;
    } catch (error) {
        console.error('알림 생성 중 오류:', error);
        return null;
    }
}

// 알림 삭제 API
app.delete('/api/notifications/:notificationId', async (req, res) => {
    console.log('알림 삭제 API 호출됨');
    const { notificationId } = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM Notifications WHERE notification_id = ?',
            [notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '알림을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '알림이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('알림 삭제 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '알림 삭제 중 오류가 발생했습니다.'
        });
    }
});

// 읽지 않은 알림 개수 조회 API
app.get('/api/notifications/unread/count', async (req, res) => {
    console.log('읽지 않은 알림 개수 조회 API 호출됨');
    const { phone } = req.query;

    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as unreadCount FROM Notifications WHERE recipient_phone = ? AND is_read = 0',
            [phone]
        );

        res.json({
            success: true,
            unreadCount: result[0].unreadCount
        });

    } catch (error) {
        console.error('읽지 않은 알림 개수 조회 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '읽지 않은 알림 개수 조회 중 오류가 발생했습니다.'
        });
    }
});

// 장터 댓글 삭제 API
app.delete('/api/market/comment/:commentId', async (req, res) => {
    console.log('장터 댓글 삭제 API 호출됨');
    const { commentId } = req.params;

    try {
        console.log('삭제 요청된 comment_id:', commentId);

        // 1. 먼저 해당 댓글이 존재하는지 확인
        const [comment] = await pool.query(
            'SELECT * FROM market_comment WHERE market_comment_id = ?',
            [commentId]
        );

        if (comment.length === 0) {
            return res.status(404).json({
                success: false,
                message: '댓글을 찾을 수 없습니다.'
            });
        }

        // 2. 댓글 삭제
        const [deleteResult] = await pool.query(
            'DELETE FROM market_comment WHERE market_comment_id = ?',
            [commentId]
        );

        console.log('삭제 결과:', deleteResult);

        if (deleteResult.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: '댓글 삭제에 실패했습니다.'
            });
        }

        res.status(200).json({
            success: true,
            message: '댓글이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('장터 댓글 삭제 중 오류 발생:', error);
        res.status(500).json({
            success: false,
            message: '댓글 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 카테고리별 상품 조회 API
app.get('/api/market/category/:category', async (req, res) => {
    try {
        console.log('받은 카테고리 파라미터:', req.params.category);
        const category = decodeURIComponent(req.params.category);
        console.log('디코딩된 카테고리:', category);

        const categoryMapping = {
            '제초용품': '제초용품',
            '농자재': '농자재',
            '농수산물': '농수산물',
            '생활잡화': '생활잡화',
            '농기계': '농기계',
            '비료/상토': '비료/상토',
            '종자/모종': '종자/모종',
            '기타': '기타',
        };

        console.log('매핑된 DB 카테고리:', categoryMapping[category]);

        const dbCategory = categoryMapping[category];

        if (!dbCategory) {
            console.log('카테고리 매핑 실패');
            return res.status(404).json({ error: '존재하지 않는 카테고리입니다.' });
        }

        // market_status 컬럼 추가하고 조건 수정
        const [products] = await pool.query(`
            SELECT 
                market_id,
                name,
                market_name,
                market_category,
                market_price,
                market_image_url,
                market_content,
                market_created_at,
                market_update_at,
                phone,
                market_status,
                market_like
            FROM market
            WHERE market_category = ? 
            AND (market_status = '판매중' OR market_status = '예약중')
        `, [dbCategory]);

        console.log('조회된 상품 수:', products.length);

        res.json(products);
    } catch (error) {
        console.error('카테고리별 상품 조회 에러:', error);
        res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' });
    }
});

app.get('/api/market/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // market 테이블에서 상세 정보 조회
        const [rows] = await pool.query(
            `SELECT market_id, market_name, market_price, market_image_url, market_content, phone, market_created_at, market_update_at
             FROM market
             WHERE market_id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: '해당 상품을 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('마켓 상세 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});


// server/index.js
app.get('/api/user/:phone', async (req, res) => {
    const { phone } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT name, region, introduction, profile_image FROM user WHERE phone = ?`,
            [phone]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: '해당 유저를 찾을 수 없습니다.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('유저 정보 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 예시: /api/market/:id/like?phone=01012345678
app.get('/api/market/:id/like', async (req, res) => {
    const { id } = req.params;
    const { phone } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT 1 FROM Market_likes WHERE market_id = ? AND phone = ? LIMIT 1`,
            [id, phone]
        );
        res.json({ liked: rows.length > 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 좋아요 상태 조회
app.get('/api/market/:id/like', async (req, res) => {
    const { id } = req.params;
    const { phone } = req.query;
    try {
        const [rows] = await pool.query(
            `SELECT 1 FROM Market_likes WHERE market_id = ? AND phone = ? LIMIT 1`,
            [id, phone]
        );
        res.json({ liked: rows.length > 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 좋아요 취소
app.delete('/api/market/:id/like', async (req, res) => {
    const { id } = req.params;
    const { phone } = req.query;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. 좋아요 취소
        const [deleteResult] = await conn.query(
            `DELETE FROM Market_likes WHERE phone = ? AND market_id = ?`,
            [phone, id]
        );
        console.log('DELETE 결과:', deleteResult);

        // 2. 실제로 삭제된 경우에만 market_like 감소
        if (deleteResult.affectedRows > 0) {
            const [updateResult] = await conn.query(
                `UPDATE market SET market_like = GREATEST(market_like - 1, 0) WHERE market_id = ?`,
                [id]
            );
            console.log('UPDATE 결과:', updateResult);
        }

        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        await conn.rollback();
        console.error('좋아요 취소 에러:', e);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
});

// 장터 게시글 좋아요 추가 
app.post('/api/market/:id/like', async (req, res) => {
    console.log('장터 게시글 좋아요 추가 API 호출됨');
    const { id } = req.params;
    const { phone } = req.body;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. 좋아요 기록 (중복 방지)
        const [insertResult] = await conn.query(
            `INSERT IGNORE INTO Market_likes (phone, market_id) VALUES (?, ?)`,
            [phone, id]
        );
        console.log('INSERT 결과:', insertResult);

        // 2. 실제로 추가된 경우에만 market_like 증가
        if (insertResult.affectedRows > 0) {
            const [updateResult] = await conn.query(
                `UPDATE market SET market_like = market_like + 1 WHERE market_id = ?`,
                [id]
            );
            console.log('UPDATE 결과:', updateResult);

            // 3. 알림 생성 (본인 글이 아닐 때만)
            const [market] = await conn.query(
                'SELECT phone FROM market WHERE market_id = ?',
                [id]
            );
            const marketAuthorPhone = market[0]?.phone;
            if (marketAuthorPhone && marketAuthorPhone !== phone) {
                await createNotification({
                    recipientPhone: marketAuthorPhone,
                    actorPhone: phone,
                    type: 'MARKET_POST_LIKE',
                    targetMarketId: id
                });
            }
        }

        await conn.commit();
        res.json({ success: true });
    } catch (e) {
        await conn.rollback();
        console.error('좋아요 추가 에러:', e);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
});


// 장터 댓글/대댓글 등록
app.post('/api/market/comment', async (req, res) => {
    const { market_comment_content, market_id, phone, market_comment_parent_id } = req.body;
    if (!market_comment_content || !market_id || !phone) {
        return res.status(400).json({ success: false, message: '필수값 누락' });
    }
    try {
        // 장터 댓글 저장
        const [insertResult] = await pool.query(
            `INSERT INTO Market_comment (market_comment_content, market_comment_created_at, market_id, phone, market_comment_parent_id) VALUES (?, NOW(), ?, ?, ?)`,
            [market_comment_content, market_id, phone, market_comment_parent_id || null]
        );
        const market_comment_id = insertResult.insertId;

        // 알림 생성
        if (market_comment_parent_id) {
            // 대댓글: 원댓글 작성자에게 알림 (MARKET_COMMENT_REPLY)
            const [parentComment] = await pool.query(
                'SELECT phone, market_comment_content FROM market_comment WHERE market_comment_id = ?',
                [market_comment_parent_id]
            );
            const parentCommentAuthorPhone = parentComment[0]?.phone;
            const parentCommentContent = parentComment[0]?.market_comment_content;
            
            if (parentCommentAuthorPhone && parentCommentAuthorPhone !== phone) {
                await createNotification({
                    recipientPhone: parentCommentAuthorPhone,
                    actorPhone: phone,
                    type: 'MARKET_COMMENT_REPLY',
                    targetCommentId: market_comment_id,  // 수정: 새로 작성된 대댓글의 ID
                    targetMarketId: market_id,
                    market_comment_content: market_comment_content,           // 새로 작성된 대댓글 내용
                    parent_market_comment_content: parentCommentContent       // 원댓글 내용
                });
            }
        } else {
            // 일반 댓글: 장터글 작성자에게 알림 (MARKET_COMMENT)
            const [market] = await pool.query(
                'SELECT phone, market_name FROM market WHERE market_id = ?',
                [market_id]
            );
            const marketAuthorPhone = market[0]?.phone;
            const marketName = market[0]?.market_name;
            
            if (marketAuthorPhone && marketAuthorPhone !== phone) {
                await createNotification({
                    recipientPhone: marketAuthorPhone,
                    actorPhone: phone,
                    type: 'MARKET_COMMENT',
                    targetMarketId: market_id,
                    targetCommentId: market_comment_id,
                    market_comment_content: market_comment_content,  // 새로 작성된 댓글 내용
                    market_name: marketName                        // 장터글 제목
                });
            }
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: '장터 댓글 작성 실패' });
    }
});

// 404 에러 핸들러 (맨 마지막에 위치)
app.use((req, res) => {
    res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);

    try {
        // farm 테이블에 coordinates 컬럼 추가
        await pool.query(`
            ALTER TABLE farm 
            ADD COLUMN IF NOT EXISTS coordinates JSON
        `);
        console.log('farm 테이블 coordinates 컬럼 추가 완료');

        // post 테이블에 likes 컬럼 추가
        await pool.query(`
            ALTER TABLE post 
            ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0
        `);
        console.log('post 테이블 likes 컬럼 추가 완료');

        // 서버 시작 시 테이블 확인
        const [tables] = await pool.query("SHOW TABLES");
        console.log('테이블 확인 결과:', tables);
        tables.forEach(table => {
            console.log(`${table.Tables_in_farmtasy_db} 테이블 확인 완료`);
        });
    } catch (err) {
        console.error('테이블 수정 중 오류:', err);
    }
});

// 부모 작물 ID 조회 API
app.get('/api/crop/parent', async (req, res) => {
    try {
        const { farm_id } = req.query;

        if (!farm_id) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                details: 'farm_id는 필수 입력 항목입니다.'
            });
        }

        // 해당 농장의 가장 최근에 추가된 작물 ID 조회
        const [crops] = await pool.query(
            'SELECT crop_id FROM crop WHERE farm_id = ? ORDER BY created_at DESC LIMIT 1',
            [farm_id]
        );

        if (crops.length === 0) {
            return res.status(404).json({
                error: '작물을 찾을 수 없습니다.',
                details: '해당 농장에 등록된 작물이 없습니다.'
            });
        }

        res.json({ crop_id: crops[0].crop_id });
    } catch (error) {
        console.error('부모 작물 ID 조회 중 오류:', error);
        res.status(500).json({
            error: '부모 작물 ID 조회에 실패했습니다.',
            details: error.sqlMessage || error.message
        });
    }
});

// cropdetail 조회 API
app.get('/api/cropdetail', async (req, res) => {
    const { crop_id, user_phone } = req.query;

    if (!crop_id || !user_phone) {
        return res.status(400).json({
            success: false,
            message: 'crop_id와 user_phone은 필수 입력 항목입니다.'
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // crop 테이블과 JOIN하여 crop_name과 detail_name도 함께 가져오기
        const [details] = await connection.query(`
            SELECT cd.*, c.crop_name, cd.detail_name
            FROM cropdetail cd
            JOIN crop c ON cd.crop_id = c.crop_id
            WHERE cd.crop_id = ? AND cd.user_phone = ?
        `, [crop_id, user_phone]);

        res.json(details);
    } catch (error) {
        console.error('작물 상세 정보 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '작물 상세 정보 조회 중 오류가 발생했습니다.'
        });
    } finally {
        if (connection) connection.release();
    }
});






