const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
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
    const { postId, like, phone } = req.body;
    console.log('좋아요 요청 받음:', { postId, like, phone });
    
    try {
        // 게시글 정보 조회
        const [postCheck] = await pool.query(
            'SELECT post_id, post_liked_users FROM post WHERE post_id = ?',
            [postId]
        );
        
        if (postCheck.length === 0) {
            return res.status(404).json({ success: false, message: '존재하지 않는 게시글입니다.' });
        }

        // 기존 좋아요 유저 목록 파싱
        let likedUsers = [];
        if (postCheck[0].post_liked_users) {
            try {
                likedUsers = JSON.parse(postCheck[0].post_liked_users);
            } catch (e) {
                likedUsers = [];
            }
        }

        if (like) {
            // 좋아요 추가
            if (!likedUsers.includes(phone)) likedUsers.push(phone);
        } else {
            // 좋아요 취소
            likedUsers = likedUsers.filter(userPhone => userPhone !== phone);
        }

        // DB 업데이트
        const [updateResult] = await pool.query(
            'UPDATE post SET post_like = ?, post_liked_users = ? WHERE post_id = ?',
            [likedUsers.length, JSON.stringify(likedUsers), postId]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: '좋아요 저장 실패' });
    }
});

// 게시글 목록 조회 API 추가
app.get('/api/post', async (req, res) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM post';
        let params = [];

        if (category) {
            query += ' WHERE post_category = ?';
            params.push(category);
        }

        // 1. DB에서 rows 받아오기
        const [rows] = await pool.query(`
            SELECT p.post_id, p.name, p.phone, p.post_content, p.post_category, p.post_created_at, p.post_like, p.image_urls, u.introduction, u.region
            FROM post p
            LEFT JOIN user u ON p.phone = u.phone
            ${category ? 'WHERE p.post_category = ?' : ''}
        `, params);

        // 2. ★★★ 여기에서 image_urls 안전하게 파싱 ★★★
        const posts = rows.map(row => {
            let image_urls = [];
            if (row.image_urls) {
                try {
                    image_urls = JSON.parse(row.image_urls);
                    // 2중 배열일 때만 평탄화
                    while (Array.isArray(image_urls) && Array.isArray(image_urls[0])) {
                        image_urls = image_urls[0];
                    }
                    if (!Array.isArray(image_urls)) {
                        image_urls = [row.image_urls];
                    }
                } catch (e) {
                    image_urls = [row.image_urls];
                }
            }
            console.log('서버에서 최종 image_urls:', image_urls);
            return {
                id: row.post_id,
                user: row.name,
                phone: row.phone,
                time: row.post_created_at,
                text: row.post_content,
                image_urls,
                category: row.post_category,
                likes: row.post_like || 0,
                introduction: row.introduction,
                region: row.region
            };
        });

        // 3. 프론트로 posts 배열 반환
        res.json(posts);
    } catch (error) {
        console.error('게시글 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '게시글을 불러오지 못했습니다.'
        });
    }
});

app.post('/api/s3/presign', (req, res) => {
    const { fileName, fileType } = req.body;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        // ACL: 'public-read',
    };
    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ url });
    });
});

// 게시글 생성 API 수정: post_title 관련 부분 제거
app.post('/api/post', async (req, res) => {
    console.log('게시글 작성 요청 받음:', req.body);

    try {
        // 테이블 존재 여부 확인 방식 수정
        const [tables] = await pool.query("SHOW TABLES");
        const postTableExists = tables.some(table => table.Tables_in_farmtasy_db === 'post');

        if (postTableExists) {
            console.log('post 테이블 확인 완료');
        } else {
            console.error('post 테이블이 존재하지 않습니다');
            return res.status(500).json({
                success: false,
                message: '서버 설정 오류가 발생했습니다.'
            });
        }

        // post_title 제거
        const { name, post_content, post_category, phone, region, image_urls } = req.body;

        const [result] = await pool.query(
            `INSERT INTO post (name, post_content, post_category, phone, region, image_urls) 
    VALUES (?, ?, ?, ?, ?, ?)`,
            [name, post_content, post_category, phone, region, JSON.stringify(image_urls)]
        );

        console.log('게시글 등록 성공:', result);

        res.json({
            success: true,
            message: '게시글이 등록되었습니다.',
            postId: result.insertId
        });

    } catch (error) {
        console.error('게시글 등록 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 댓글 목록 조회 API
app.get('/api/comment', async (req, res) => {
    const { post_id } = req.query;
    if (!post_id) return res.status(400).json({ success: false, message: 'post_id 필요' });

    try {
        const [rows] = await pool.query(`
            SELECT c.comment_id, c.comment_content, c.comment_created_at, c.comment_parent_id, c.phone, u.name, u.profile, u.region, u.introduction
            FROM Comment c
            LEFT JOIN user u ON c.phone = u.phone
            WHERE c.post_id = ?
            ORDER BY c.comment_created_at ASC
        `, [post_id]);

        const comments = rows.map(row => ({
            id: row.comment_id,
            user: row.region ? `[${row.region}] ${row.name}` : `[지역 미설정] ${row.name}`,
            profile: row.profile,
            time: row.comment_created_at,
            text: row.comment_content,
            likes: row.comment_like || 0,
            introduction: row.introduction,
            comment_parent_id: row.comment_parent_id,
            phone: row.phone,
            isAuthor: false,
            isLiked: false
        }));

        res.json(comments);
    } catch (e) {
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

// 404 에러 핸들러
app.use((req, res) => {
    res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);

    // 서버 시작 시 테이블 확인
    pool.query("SHOW TABLES")
        .then(([tables]) => {
            console.log('테이블 확인 결과:', tables);
            tables.forEach(table => {
                console.log(`${table.Tables_in_farmtasy_db} 테이블 확인 완료`);  // TABLE_NAME을 Tables_in_farmtasy_db로 수정
            });
        })
        .catch(err => {
            console.error('테이블 확인 중 오류 발생:', err);
        });
}); 