import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Login/registerpwstyle';

const RegisterPw = () => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isValid = password.length >= 8;

    const handleNext = () => {
        if (!isValid) return;
        // TODO: 다음 단계로 이동
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
