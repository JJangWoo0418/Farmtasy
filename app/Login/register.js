import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 뒤로가기 아이콘 추가
import styles from '../Components/Css/Login/registerstyle'; // 스타일 파일 분리
import { useNavigation } from '@react-navigation/native';

const Register = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation();

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
                placeholder="휴대전화번호 입력"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
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
            <TouchableOpacity style={styles.loginButton} disabled={phone === '' || password === ''}>
                <Text style={styles.loginText}>로그인</Text>
            </TouchableOpacity>

            {/* 비밀번호 변경 */}
            <TouchableOpacity>
                <Text style={styles.passwordChange}>비밀번호 변경</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>또는</Text>
                <View style={styles.divider} />
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity style={styles.signupButton}>
                <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Register;