import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Login/registerpwstyle';
import { registerUser } from '../DB/register2db';

const RegisterPw = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { phone = '', name = '' } = route.params || {};
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isValid = password.length >= 8;

    const handleNext = () => {
        if (!isValid) return;
        
        // 회원가입 요청
        registerUser({
            phone,
            name,
            password,
            region: null,
            profile: null,
            introduction: null
        }).then(result => {
            if (result.success) {
                Alert.alert('성공', '회원가입이 완료되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => navigation.navigate('Homepage/homepage', {
                            phone: phone,
                            name: name
                        })
                    }
                ]);
            } else {
                Alert.alert('오류', result.message || '회원가입 중 오류가 발생했습니다.');
            }
        }).catch(error => {
            console.error('회원가입 오류:', error);
            Alert.alert('오류', '서버와의 통신 중 오류가 발생했습니다.');
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 뒤로가기 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            {/* 제목 */}
            <Text style={styles.title}>비밀번호를{'\n'}입력해 주세요</Text>

            {/* 비밀번호 입력 */}
            <TextInput
                style={styles.input}
                placeholder="8자 이상 입력"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
            />

            {/* 비밀번호 표시 체크박스 */}
            <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setShowPassword(!showPassword)}
            >
                <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                    {showPassword && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>비밀번호 표시</Text>
            </TouchableOpacity>

            {/* 다음 버튼 */}
            <TouchableOpacity
                style={[styles.button, isValid && styles.buttonActive]}
                disabled={!isValid}
                onPress={handleNext}
            >
                <Text style={styles.buttonText}>시작하기</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RegisterPw;
