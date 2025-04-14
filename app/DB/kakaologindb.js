import API_CONFIG from './api.js';

// 카카오 로그인 함수
export async function kakaoLogin(kakaoUserData) {
    try {
        console.log('카카오 로그인 요청:', kakaoUserData);
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/kakao-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.KAKAO_REST_API_KEY}`
            },
            body: JSON.stringify(kakaoUserData),
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
                message: '카카오 로그인이 완료되었습니다.',
                user: jsonData.user
            };
        } else {
            return {
                success: false,
                message: jsonData.message || '카카오 로그인에 실패했습니다.'
            };
        }
    } catch (error) {
        console.error('카카오 로그인 실패:', error);
        return {
            success: false,
            message: '카카오 로그인에 실패했습니다.'
        };
    }
}

// 카카오 사용자 정보 가져오기 함수
export async function getKakaoUserInfo() {
    try {
        // 카카오 SDK를 통해 사용자 정보 가져오기
        const userInfo = await new Promise((resolve, reject) => {
            // 카카오 SDK의 getUserInfo 함수 호출
            window.Kakao.API.request({
                url: '/v2/user/me',
                success: function(response) {
                    resolve(response);
                },
                fail: function(error) {
                    reject(error);
                }
            });
        });

        return {
            success: true,
            userInfo: userInfo
        };
    } catch (error) {
        console.error('카카오 사용자 정보 가져오기 실패:', error);
        return {
            success: false,
            message: '카카오 사용자 정보를 가져오는데 실패했습니다.'
        };
    }
}

// 카카오 로그인 초기화 함수
export function initKakaoLogin() {
    try {
        // 카카오 SDK 초기화
        window.Kakao.init(API_CONFIG.KAKAO_REST_API_KEY);
        return {
            success: true,
            message: '카카오 SDK가 초기화되었습니다.'
        };
    } catch (error) {
        console.error('카카오 SDK 초기화 실패:', error);
        return {
            success: false,
            message: '카카오 SDK 초기화에 실패했습니다.'
        };
    }
}

// 카카오 로그인 실행 함수
export async function executeKakaoLogin() {
    try {
        // 카카오 로그인 실행
        const authResponse = await new Promise((resolve, reject) => {
            window.Kakao.Auth.login({
                success: function(authObj) {
                    resolve(authObj);
                },
                fail: function(error) {
                    reject(error);
                }
            });
        });

        // 사용자 정보 가져오기
        const userInfoResponse = await getKakaoUserInfo();
        if (!userInfoResponse.success) {
            throw new Error(userInfoResponse.message);
        }

        // 서버에 카카오 로그인 요청
        const loginResponse = await kakaoLogin({
            kakaoId: userInfoResponse.userInfo.id,
            email: userInfoResponse.userInfo.kakao_account?.email,
            nickname: userInfoResponse.userInfo.kakao_account?.profile?.nickname,
            profileImage: userInfoResponse.userInfo.kakao_account?.profile?.profile_image_url,
            accessToken: authResponse.access_token
        });

        return loginResponse;
    } catch (error) {
        console.error('카카오 로그인 실행 실패:', error);
        return {
            success: false,
            message: '카카오 로그인에 실패했습니다.'
        };
    }
}
