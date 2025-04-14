import API_CONFIG from './api.js';

// 인증번호 발송 함수
export async function sendVerificationCode(phone) {
    try {
        console.log('인증번호 발송 요청:', { phone });
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
        });

        console.log('서버 응답 상태:', response.status);
        const data = await response.text();
        console.log('서버 응답 데이터:', data);

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
            return {
                success: false,
                message: '서버 응답을 처리할 수 없습니다.'
            };
        }

        if (response.ok) {
            return {
                success: true,
                message: '인증번호가 발송되었습니다.'
            };
        } else {
            return {
                success: false,
                message: jsonData.message || '인증번호 발송에 실패했습니다.'
            };
        }
    } catch (error) {
        console.error('인증번호 발송 실패:', error);
        return {
            success: false,
            message: '인증번호 발송에 실패했습니다.'
        };
    }
}

// 인증번호 확인 함수
export async function verifyCode(phone, code) {
    try {
        console.log('인증번호 확인 요청:', { phone, code });
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, code }),
        });

        console.log('서버 응답 상태:', response.status);
        const data = await response.text();
        console.log('서버 응답 데이터:', data);

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
            return {
                success: false,
                message: '서버 응답을 처리할 수 없습니다.'
            };
        }

        if (response.ok) {
            return {
                success: true,
                message: '인증이 완료되었습니다.'
            };
        } else {
            return {
                success: false,
                message: jsonData.message || '인증에 실패했습니다.'
            };
        }
    } catch (error) {
        console.error('인증번호 확인 실패:', error);
        return {
            success: false,
            message: '인증번호 확인에 실패했습니다.'
        };
    }
}

// 비밀번호 변경 함수
export async function changePassword(phone, newPassword) {
    try {
        console.log('비밀번호 변경 요청:', { phone });
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, newPassword }),
        });

        console.log('서버 응답 상태:', response.status);
        const data = await response.text();
        console.log('서버 응답 데이터:', data);

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            console.error('JSON 파싱 오류:', e);
            return {
                success: false,
                message: '서버 응답을 처리할 수 없습니다.'
            };
        }

        if (response.ok) {
            return {
                success: true,
                message: '비밀번호가 변경되었습니다.'
            };
        } else {
            return {
                success: false,
                message: jsonData.message || '비밀번호 변경에 실패했습니다.'
            };
        }
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        return {
            success: false,
            message: '비밀번호 변경에 실패했습니다.'
        };
    }
}
