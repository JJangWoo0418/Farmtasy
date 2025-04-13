const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

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

        // User 테이블 존재 여부 확인
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'User'",
            [process.env.DB_NAME]
        );
        console.log('테이블 확인 결과:', tables);

        if (tables.length === 0) {
            // User 테이블이 없으면 생성
            await connection.query(`
                CREATE TABLE IF NOT EXISTS User (
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
            console.log('User 테이블 생성 완료');
        } else {
            // 현재 데이터 확인
            const [users] = await connection.query('SELECT * FROM User');
            console.log('현재 User 테이블 데이터:', users);
        }
    } catch (error) {
        console.error('데이터베이스 초기화 중 오류:', error);
    } finally {
        if (connection) connection.release();
    }
}

// 서버 시작 시 데이터베이스 초기화 실행
initDatabase();

// SMS 발송 함수 (테스트용 더미 함수)
async function sendSMS(phone, verificationCode) {
    console.log('SMS 발송 (테스트용):', {
        to: phone,
        message: `[Farmtasy] 인증번호: ${verificationCode}`
    });
    return true;
}

// 인증번호 저장을 위한 임시 저장소 (실제 프로덕션에서는 Redis 사용 권장)
const verificationStore = new Map();

// 인증번호 생성 함수
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// SMS 인증번호 발송
router.post('/send-verification', async (req, res) => {
    console.log('인증번호 발송 요청:', req.body);
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ 
            success: false,
            message: '전화번호가 필요합니다.' 
        });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        
        // 현재 모든 사용자 데이터 확인
        const [allUsers] = await connection.query('SELECT * FROM User');
        console.log('현재 모든 사용자 데이터:', allUsers);
        
        // 특정 전화번호로 사용자 조회
        const [users] = await connection.query(
            'SELECT * FROM User WHERE phone = ?', 
            [phone]
        );
        console.log(`전화번호 ${phone}로 조회한 결과:`, users);
        
        if (users.length > 0) {
            console.log('이미 가입된 전화번호 발견:', phone);
            console.log('기존 사용자 정보:', users[0]);
            return res.status(400).json({ 
                success: false,
                message: '이미 가입된 전화번호입니다.' 
            });
        }

        // 인증번호 생성
        const verificationCode = generateVerificationCode();
        console.log('생성된 인증번호:', verificationCode);
        
        // 테스트용 SMS 발송
        await sendSMS(phone, verificationCode);
        
        // 인증번호 저장 (5분 후 만료)
        verificationStore.set(phone, {
            code: verificationCode,
            expiresAt: Date.now() + 5 * 60 * 1000
        });
        
        console.log('인증번호 저장됨:', { phone, verificationCode });
        res.json({ 
            success: true,
            message: '인증번호가 발송되었습니다.' 
        });
    } catch (error) {
        console.error('인증번호 발송 실패:', error);
        res.status(500).json({ 
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// 인증번호 확인
router.post('/verify-code', (req, res) => {
    console.log('인증번호 확인 요청:', req.body);
    const { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ 
            success: false,
            message: '전화번호와 인증번호가 필요합니다.' 
        });
    }
    
    const verification = verificationStore.get(phone);
    console.log('저장된 인증 정보:', { phone, verification });

    if (!verification) {
        return res.status(400).json({ 
            success: false,
            message: '인증번호를 먼저 요청해주세요.' 
        });
    }
    
    if (Date.now() > verification.expiresAt) {
        verificationStore.delete(phone);
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
    
    // 인증 성공
    verificationStore.delete(phone);
    res.json({ 
        success: true,
        message: '인증이 완료되었습니다.' 
    });
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
            'SELECT * FROM User WHERE phone = ?',
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
            'INSERT INTO User (phone, name, password, region, profile, introduction) VALUES (?, ?, ?, ?, ?, ?)',
            [phone, name, password, region || null, profile || null, introduction || null]
        );

        if (result.affectedRows === 1) {
            console.log('사용자 등록 성공:', result);
            
            // 3. 등록된 사용자 정보 반환
            const [newUser] = await connection.query(
                'SELECT id, phone, name, region, profile, introduction FROM User WHERE id = ?',
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

module.exports = router; 