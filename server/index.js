const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    try {
        const { postId, like, phone } = req.body;

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
                // post 테이블의 post_like 수 증가
                await pool.query(
                    'UPDATE post SET post_like = post_like + 1 WHERE post_id = ?',
                    [postId]
                );
            }
        } else {
            // 좋아요 삭제 - 본인이 누른 좋아요만 취소 가능
            if (existingLike.length > 0) {
                // 좋아요를 누른 사용자가 맞는지 확인
                const [likeOwner] = await pool.query(
                    'SELECT user_phone FROM post_likes WHERE post_id = ? AND user_phone = ?',
                    [postId, phone]
                );

                if (likeOwner.length > 0) {
                    await pool.query(
                        'DELETE FROM post_likes WHERE post_id = ? AND user_phone = ?',
                        [postId, phone]
                    );
                    // post 테이블의 post_like 수 감소
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
    try {
        const { commentId, like, phone } = req.body;

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
    const { comment_content, post_id, phone, comment_parent_id } = req.body;
    if (!comment_content || !post_id || !phone) {
        return res.status(400).json({ success: false, message: '필수값 누락' });
    }
    try {
        await pool.query(
            `INSERT INTO Comment (comment_content, comment_created_at, post_id, phone, comment_parent_id) VALUES (?, NOW(), ?, ?, ?)`,
            [comment_content, post_id, phone, comment_parent_id || null]
        );
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
                (SELECT COUNT(*) FROM Comment c WHERE c.post_id = p.post_id) as commentCount
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
                (SELECT COUNT(*) FROM Comment c2 WHERE c2.post_id = p.post_id) as commentCount
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
    console.log('인기 게시글 요청 받음');
    const { user_phone } = req.query;
    
    try {
        const categories = ['농사질문', '농사공부', '자유주제'];
        const popularPosts = [];

        for (const category of categories) {
            console.log(`${category} 카테고리 게시글 조회 중...`);
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

            console.log(`${category} 카테고리 조회 결과:`, posts.length > 0 ? '게시글 있음' : '게시글 없음');

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
                    image_urls: imageUrls,
                    createdAt: new Date(post.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    is_liked: post.is_liked === 1,
                    is_bookmarked: post.is_bookmarked === 1
                };
                popularPosts.push(formattedPost);
            }
        }

        console.log('전송할 데이터:', popularPosts);
        res.json(popularPosts);
    } catch (error) {
        console.error('인기 게시글을 가져오는데 실패했습니다:', error);
        res.status(500).json({ 
            error: '서버 오류가 발생했습니다.',
            details: error.message 
        });
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
        console.error('테이블 설정 중 오류 발생:', err);
    }
});
