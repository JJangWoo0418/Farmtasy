const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();
const coolsms = require('coolsms-node-sdk').default;

// 데이터베이스 연결 설정
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 데이터베이스 초기화 및 테스트
async function initDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('데이터베이스 연결 성공');

        // 테이블 존재 여부 확인
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('user', 'verification')",
            [process.env.DB_NAME]
        );
        console.log('테이블 확인 결과:', tables);

        // user 테이블 생성
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(11) UNIQUE NOT NULL,
                name VARCHAR(30) NOT NULL,
                password VARCHAR(20) NOT NULL,
                region VARCHAR(30),
                profile VARCHAR(30),
                introduction TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('user 테이블 확인 완료');

        // verification 테이블 생성
        await connection.query(`
            CREATE TABLE IF NOT EXISTS verification (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(11) UNIQUE NOT NULL,
                code VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_phone (phone),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('verification 테이블 확인 완료');

        // 현재 데이터 확인
        const [users] = await connection.query('SELECT * FROM user');
        console.log('현재 user 테이블 데이터:', users);

    } catch (error) {
        console.error('데이터베이스 초기화 중 오류:', error);
    } finally {
        if (connection) connection.release();
    }
}

// 서버 시작 시 데이터베이스 초기화 실행
initDatabase();

// CoolSMS 초기화
const messageService = new coolsms(process.env.COOLSMS_API_KEY, process.env.COOLSMS_API_SECRET);

// SMS 발송 함수
async function sendSMS(phone, code) {
    try {
        const result = await messageService.sendOne({
            to: phone,
            from: process.env.SENDER_PHONE,
            text: `[Farmtasy] 인증번호는 [${code}] 입니다.`
        });
        console.log('SMS 발송 결과:', result);
        return true;
    } catch (error) {
        console.error('SMS 발송 실패:', error);
        return false;
    }
}

// 인증번호 저장을 위한 임시 저장소 (실제 프로덕션에서는 Redis 사용 권장)
const verificationStore = new Map();

// 인증번호 생성 함수
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 인증번호 발송 엔드포인트
router.post('/send-verification', async (req, res) => {
    const { phone, name } = req.body;
    console.log('인증번호 발송 요청 받음:', { phone, name });

    try {
        // 임시로 6자리 랜덤 숫자 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        
        // SMS 발송
        const smsSent = await sendSMS(phone, verificationCode);
        if (!smsSent) {
            throw new Error('SMS 발송 실패');
        }
        
        // 인증번호를 데이터베이스에 저장
        const connection = await pool.getConnection();
        try {
            await connection.query(
                'INSERT INTO verification (phone, code, created_at) VALUES (?, ?, NOW()) ' +
                'ON DUPLICATE KEY UPDATE code = ?, created_at = NOW()',
                [phone, verificationCode, verificationCode]
            );
            
            res.json({ 
                success: true, 
                message: '인증번호가 발송되었습니다.'
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('인증번호 발송 중 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '인증번호 발송 중 오류가 발생했습니다.' 
        });
    }
});

// 인증번호 확인
router.post('/verify-code', async (req, res) => {
    console.log('인증번호 확인 요청:', req.body);
    const { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ 
            success: false,
            message: '전화번호와 인증번호가 필요합니다.' 
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 인증번호 확인
        const [verifications] = await connection.query(
            'SELECT * FROM verification WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
            [phone]
        );
        
        console.log('저장된 인증 정보:', verifications[0]);

        if (verifications.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: '인증번호를 먼저 요청해주세요.' 
            });
        }

        const verification = verifications[0];
        
        // 5분(300초) 이내에 생성된 인증번호인지 확인
        const createdAt = new Date(verification.created_at).getTime();
        const now = Date.now();
        if (now - createdAt > 300000) {
            return res.status(400).json({ 
                success: false,
                message: '인증번호가 만료되었습니다.' 
            });
        }
        
        if (verification.code !== code) {
            return res.status(400).json({ 
                success: false,
                message: '잘못된 인증번호입니다.' 
            });
        }
        
        // 인증 성공 후 해당 인증번호 삭제
        await connection.query('DELETE FROM verification WHERE phone = ?', [phone]);
        
        res.json({ 
            success: true,
            message: '인증이 완료되었습니다.' 
        });
    } catch (error) {
        console.error('인증번호 확인 중 오류:', error);
        res.status(500).json({ 
            success: false,
            message: '인증번호 확인 중 오류가 발생했습니다.' 
        });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/register', async (req, res) => {
    const { phone, name, password, region, profile, introduction } = req.body;
    console.log('회원가입 요청 받음:', req.body);

    // 필수 필드 검증
    if (!phone || !name || !password) {
        return res.status(400).json({
            success: false,
            message: '전화번호, 이름, 비밀번호는 필수 항목입니다.'
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. 먼저 전화번호 중복 체크
        const [existingUsers] = await connection.query(
            'SELECT * FROM user WHERE phone = ?',
            [phone]
        );

        if (existingUsers.length > 0) {
            console.log('이미 가입된 전화번호 발견:', phone);
            return res.status(400).json({ 
                success: false, 
                message: '이미 등록된 전화번호입니다.' 
            });
        }

        // 2. 중복이 없으면 새 사용자 등록
        console.log('회원가입 시도:', { phone, name, region });
        const [result] = await connection.query(
            'INSERT INTO user (phone, name, password, region, profile, introduction) VALUES (?, ?, ?, ?, ?, ?)',
            [phone, name, password, region || null, profile || null, introduction || null]
        );

        if (result.affectedRows === 1) {
            console.log('사용자 등록 성공:', result);
            
            // 3. 등록된 사용자 정보 반환
            const [newUser] = await connection.query(
                'SELECT id, phone, name, region, profile, introduction FROM user WHERE id = ?',
                [result.insertId]
            );

            res.json({ 
                success: true, 
                message: '회원가입이 완료되었습니다.',
                user: newUser[0]
            });
        } else {
            throw new Error('사용자 등록 실패');
        }

    } catch (error) {
        console.error('회원가입 처리 중 오류:', error);
        res.status(500).json({ 
            success: false, 
            message: '회원가입 처리 중 오류가 발생했습니다.',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    console.log('로그인 요청 받음:', { phone });

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: '전화번호와 비밀번호를 모두 입력해주세요.'
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 사용자 조회
        const [users] = await connection.query(
            'SELECT * FROM user WHERE phone = ?',
            [phone]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: '등록되지 않은 전화번호입니다.'
            });
        }

        const user = users[0];

        // 비밀번호 확인
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.'
            });
        }

        // 로그인 성공
        res.json({
            success: true,
            message: '로그인 성공',
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                region: user.region,
                profile: user.profile,
                introduction: user.introduction
            }
        });

    } catch (error) {
        console.error('로그인 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.'
        });
    } finally {
        if (connection) connection.release();
    }
});

// 비밀번호 변경 API
router.post('/change-password', async (req, res) => {
    const { phone, newPassword } = req.body;
    console.log('비밀번호 변경 요청 받음:', { phone });

    if (!phone || !newPassword) {
        return res.status(400).json({
            success: false,
            message: '전화번호와 새 비밀번호를 모두 입력해주세요.'
        });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        
        // 사용자 조회
        const [users] = await connection.query(
            'SELECT * FROM user WHERE phone = ?',
            [phone]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: '등록되지 않은 전화번호입니다.'
            });
        }

        // 비밀번호 변경
        await connection.query(
            'UPDATE user SET password = ? WHERE phone = ?',
            [newPassword, phone]
        );

        // 비밀번호 변경 성공
        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다.'
        });

    } catch (error) {
        console.error('비밀번호 변경 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '비밀번호 변경 처리 중 오류가 발생했습니다.'
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router; 