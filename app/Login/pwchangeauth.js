import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Login/pwchangeauthstyle';
import { verifyCode, changePassword, sendVerificationCode } from '../DB/pwchangedb';

const PwChangeAuth = () => {
    const [code, setCode] = useState('');
    const [newPw, setNewPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180); // 3분 (초 단위)

    const navigation = useNavigation();
    const route = useRoute();
    const phone = route.params?.phone || '';

    const isValid = code.trim().length === 6 && newPw.length >= 8;

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

    // 인증번호 재전송
    const resendVerificationCode = async () => {
        if (!phone) {
            Alert.alert('오류', '전화번호가 없습니다.');
            return;
        }

        try {
            setIsLoading(true);
            const result = await sendVerificationCode(phone);
            
            if (result.success) {
                setTimeLeft(180); // 타이머 초기화
                Alert.alert('알림', '인증번호가 발송되었습니다.');
            } else {
                Alert.alert('오류', result.message || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('인증번호 발송 실패:', error);
            Alert.alert('오류', '인증번호 발송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 비밀번호 변경 처리
    const handleChangePassword = async () => {
        if (!isValid) return;

        try {
            setIsLoading(true);
            
            // 1. 인증번호 확인
            const verifyResult = await verifyCode(phone, code);
            if (!verifyResult.success) {
                Alert.alert('오류', verifyResult.message || '인증에 실패했습니다.');
                return;
            }
            
            // 2. 비밀번호 변경
            const changeResult = await changePassword(phone, newPw);
            if (changeResult.success) {
                Alert.alert('성공', '비밀번호가 변경되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Login/register')
                    }
                ]);
            } else {
                Alert.alert('오류', changeResult.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('비밀번호 변경 오류:', error);
            Alert.alert('오류', '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 인증번호 재전송 알림
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
        // 이미 pwchange.js에서 인증번호를 발송했으므로 여기서는 발송하지 않음
        // 대신 타이머만 시작
        if (phone) {
            console.log('전화번호 확인됨, 타이머 시작');
            // 타이머는 이미 시작됨
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

            {/* 타이틀 */}
            <Text style={styles.title}>문자로 발송된 인증번호와{'\n'}새로운 비밀번호를 입력해 주세요</Text>

            {/* 인증번호 입력 */}
            <Text style={styles.label}>인증번호</Text>
            <View style={styles.codeInputWrapper}>
                <TextInput
                    style={styles.input2}
                    placeholder="인증번호 6자리 숫자 입력"
                    placeholderTextColor="#aaa"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                />
                <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            </View>

            {/* 새로운 비밀번호 입력 */}
            <Text style={[styles.label, { marginTop: 24 }]}>새로운 비밀번호</Text>
            <TextInput
                style={styles.input}
                placeholder="8자 이상 입력"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPw}
                value={newPw}
                onChangeText={setNewPw}
            />

            {/* 커스텀 체크박스 */}
            <View style={styles.checkboxContainer}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setShowPw(!showPw)}
                >
                    {showPw && <View style={styles.checkboxChecked} />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>비밀번호 표시</Text>
            </View>

            {/* 변경하기 버튼 */}
            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: isValid && !isLoading ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid || isLoading}
                onPress={handleChangePassword}
            >
                <Text style={styles.submitText}>{isLoading ? '처리 중...' : '변경하기'}</Text>
            </TouchableOpacity>

            {/* 인증번호 재전송 */}
            <TouchableOpacity onPress={showResendAlert}>
                <Text style={styles.resendText}>인증번호가 오지 않나요?</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PwChangeAuth;


