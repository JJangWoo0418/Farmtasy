import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Login/registerauthstyle';
import API_CONFIG from '../DB/api.js';

const RegisterAuth = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const phone = route.params?.phone || '';
    const name = route.params?.name || '';
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(180); // 3분 (초 단위)

    const isValid = code.trim().length === 6;

    // ⏱ 타이머 동작
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    // 인증번호 확인
    const verifyCode = async () => {
        if (!phone) {
            Alert.alert('오류', '전화번호가 없습니다.');
            return;
        }

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
            const data = await response.text(); // 먼저 텍스트로 받아서 확인
            console.log('서버 응답 데이터:', data);

            let jsonData;
            try {
                jsonData = JSON.parse(data);
            } catch (e) {
                console.error('JSON 파싱 오류:', e);
                Alert.alert('오류', '서버 응답을 처리할 수 없습니다.');
                return;
            }

            if (response.ok) {
                Alert.alert('알림', '인증이 완료되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Register', { phone, isVerified: true })
                    }
                ]);
            } else {
                Alert.alert('오류', jsonData.message || '인증에 실패했습니다.');
            }
        } catch (error) {
            console.error('인증번호 확인 실패:', error);
            Alert.alert('오류', '인증번호 확인에 실패했습니다.');
        }
    };

    // 인증번호 재전송
    const resendVerificationCode = async () => {
        if (!phone) {
            Alert.alert('오류', '전화번호가 없습니다.');
            return;
        }

        try {
            console.log('인증번호 발송 요청:', { phone, name });
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, name }),
            });

            console.log('서버 응답 상태:', response.status);
            const data = await response.text(); // 먼저 텍스트로 받아서 확인
            console.log('서버 응답 데이터:', data);

            let jsonData;
            try {
                jsonData = JSON.parse(data);
            } catch (e) {
                console.error('JSON 파싱 오류:', e);
                Alert.alert('오류', '서버 응답을 처리할 수 없습니다.');
                return;
            }

            if (response.ok) {
                setTimeLeft(180); // 타이머 초기화
                Alert.alert('알림', '인증번호가 발송되었습니다.');
            } else {
                Alert.alert('오류', jsonData.message || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('인증번호 발송 실패:', error);
            Alert.alert('오류', '인증번호 발송에 실패했습니다.');
        }
    };

    const showResendAlert = () => {
        Alert.alert(
            '알림',
            '인증번호가 문자로 오지 않나요?',
            [
                { text: '닫기', style: 'cancel' },
                { text: '재전송', onPress: resendVerificationCode }
            ]
        );
    };

    // 컴포넌트 마운트 시 자동으로 인증번호 발송
    useEffect(() => {
        if (phone) {
            resendVerificationCode();
        } else {
            console.log('전화번호가 없어서 자동 발송하지 않음');
        }
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 뒤로가기 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            {/* 제목 */}
            <Text style={styles.title}>지금 문자로 발송된{'\n'}인증번호를 입력해 주세요</Text>

            {/* 인증번호 입력 */}
            <View style={styles.codeInputWrapper}>
                <TextInput
                    style={styles.codeInput}
                    placeholder="6자리 숫자 입력"
                    placeholderTextColor="#aaa"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                />
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            </View>

            {/* 다음 버튼 */}
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid}
                onPress={verifyCode}
            >
                <Text style={styles.buttonText}>다음</Text>
            </TouchableOpacity>

            {/* 인증번호 재전송 */}
            <TouchableOpacity onPress={showResendAlert}>
                <Text style={styles.resendText}>인증번호가 오지 않나요?</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RegisterAuth;
