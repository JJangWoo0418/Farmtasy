import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/registerauthstyle';

const RegisterAuth = () => {
    const navigation = useNavigation();
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

    const showResendAlert = () => {
        Alert.alert(
            '알림',
            '인증번호가 문자로 오지 않나요?\n1644-4372 번호가 차단되어 있다면,\n해제 후 다시 시도해주세요.',
            [
                { text: '닫기', style: 'cancel' },
                { text: '재전송', onPress: () => console.log('재전송 시도') }
            ]
        );
    };

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
