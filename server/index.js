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

// 게시글 생성 API 추가
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

        const { post_title, name, post_content, post_category, phone, region, image_urls } = req.body;

        const [result] = await pool.query(
            `INSERT INTO post (post_title, name, post_content, post_category, phone, region, image_urls) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [post_title, name, post_content, post_category, phone, region, JSON.stringify(image_urls)]
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