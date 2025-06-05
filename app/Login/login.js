import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 뒤로가기 아이콘 추가
import styles from '../Components/Css/Login/registerstyle'; // 스타일 파일 분리
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_CONFIG from '../DB/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 설정
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    }
});

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();

    const isValid = phone.trim().length === 11 && password.length >= 8;

    const formatPhone = (value) => {
        const cleaned = value.replace(/\D+/g, ''); // 숫자 이외 제거
    
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleLogin = async () => {
        if (!isValid) return;

        try {
            setIsLoading(true);
            const response = await api.post('/api/auth/login', {
                phone: phone.replace(/\D+/g, ''),
                password: password
            });

            if (response.data.success) {
                console.log('사용자 정보:', response.data.user);
                // AsyncStorage에 user 정보 저장
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                //여기까지
                router.push({
                    pathname: "/Homepage/Home/homepage",
                    params: {
                        userData: JSON.stringify(response.data.user),
                        phone: response.data.user.phone,
                        name: response.data.user.name,
                        region: response.data.user.region || '지역 미설정',
                        profile_image: response.data.user.profile_image,
                        about_me: response.data.user.about_me,
                        introduction: response.data.user.introduction,
                    }
                });
                Alert.alert('성공', '로그인이 완료되었습니다.');
            } else {
                Alert.alert('로그인 실패', '휴대폰 번호 또는 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                Alert.alert('시간 초과', '서버 응답 시간이 초과되었습니다. 다시 시도해주세요.');
            } else if (!error.response) {
                Alert.alert('네트워크 오류', '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
            } else if (error.response.status === 401) {
                Alert.alert('로그인 실패', '휴대폰 번호 또는 비밀번호가 올바르지 않습니다.');
            } else {
                Alert.alert('오류', '로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* 상태바 설정 */}
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 뒤로가기 버튼 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />                    
                <View style={styles.divider} />
            </View>

            {/* 로그인 타이틀 */}
            <Text style={styles.title}> 팜타지 로그인</Text>

            {/* 입력 필드 */}
            <TextInput
                style={styles.input}
                placeholder="-없이 숫자로만 입력"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                value={formatPhone(phone)}
                onChangeText={(text) => {
                    const onlyNums = text.replace(/\D+/g, '');
                    setPhone(onlyNums.slice(0, 11)); // 최대 11자리 제한
                }}
            />
            <TextInput
                style={styles.input}
                placeholder="비밀번호 입력"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* 로그인 버튼 */}
            <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid || isLoading}
                onPress={handleLogin}
            >
                <Text style={styles.loginText}>{isLoading ? '로그인 중...' : '로그인'}</Text>
            </TouchableOpacity>

            {/* 비밀번호 변경 */}
            <TouchableOpacity onPress={() => navigation.navigate('Homepage/tutorial/tutorial')}>
                <Text style={styles.passwordChange}>비밀번호 변경</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>또는</Text>
                <View style={styles.divider} />
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Homepage/tutorial/tutorial')}>
                <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Login;