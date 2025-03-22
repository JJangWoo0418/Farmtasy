// 기존 import에서 CheckBox 제거
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/pwchangeauthstyle'; // 너가 쓰는 스타일 분리 경로로 수정


const PwChangeAuth = () => {
    const [code, setCode] = useState('');
    const [newPw, setNewPw] = useState('');
    const [showPw, setShowPw] = useState(false);

    const navigation = useNavigation();

    const isValid = code.trim().length === 6 && newPw.length >= 8;

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
            <TextInput
                style={styles.input}
                placeholder="인증번호 6자리 숫자 입력"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
            />

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
                style={[styles.submitButton, { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid}
                onPress={() => console.log('비밀번호 변경 시도')}
            >
                <Text style={styles.submitText}>변경하기</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PwChangeAuth;


