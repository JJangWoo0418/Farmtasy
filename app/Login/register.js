import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 뒤로가기 아이콘 추가
import styles from '../Components/Css/Login/registerstyle'; // 스타일 파일 분리
import { useNavigation } from '@react-navigation/native';

const Register = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

    const isValid = phone.trim().length === 11 && password.length >= 8;

    const formatPhone = (value) => {
        const cleaned = value.replace(/\D+/g, ''); // 숫자 이외 제거
    
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
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
                disabled={!isValid}
            >
                <Text style={styles.loginText}>로그인</Text>
            </TouchableOpacity>

            {/* 비밀번호 변경 */}
            <TouchableOpacity onPress={() => navigation.navigate('Login/pwchange')}>
                <Text style={styles.passwordChange}>비밀번호 변경</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>또는</Text>
                <View style={styles.divider} />
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('Login/register2')}>
                <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Register;