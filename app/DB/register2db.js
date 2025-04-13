import API_CONFIG from './api.js';

// 회원가입 함수
async function registerUser(userData) {
    try {
        console.log('요청 URL:', `${API_CONFIG.BASE_URL}/api/register`);
        console.log('요청 데이터:', userData);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('서버 응답:', response);

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '회원가입 중 오류가 발생했습니다.');
        }

        return {
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: result
        };

    } catch (error) {
        console.error('API 호출 오류:', error);
        
        if (error.name === 'AbortError') {
            return {
                success: false,
                message: '서버 연결 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
                error: error
            };
        }
        
        return {
            success: false,
            message: error.message || '회원가입 중 오류가 발생했습니다.',
            error: error
        };
    }
}

// 전화번호 유효성 검사 함수
function validatePhone(phone) {
    // 숫자만 포함하고 11자리인지 확인
    return /^[0-9]{11}$/.test(phone);
}

// 이름 유효성 검사 함수
function validateName(name) {
    // 이름이 비어있지 않고 2자 이상인지 확인
    return name && name.length >= 2;
}

export {
    registerUser,
    validatePhone,
    validateName
};
