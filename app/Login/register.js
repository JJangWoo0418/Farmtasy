import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/register2style.js';
import { validatePhone, validateName } from '../DB/register2db.js';
import API_CONFIG from '../DB/api.js';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const isValid = name.trim() !== '' && phone.trim().length === 11;

    const formatPhone = (value) => {
        const cleaned = value.replace(/\D+/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleNext = async () => {
        if (!isValid) return;

        if (!validateName(name)) {
            Alert.alert('알림', '이름을 2자 이상 입력해주세요.');
            return;
        }

        if (!validatePhone(phone)) {
            Alert.alert('알림', '올바른 전화번호를 입력해주세요.');
            return;
        }

        // 인증 페이지로 이동
        navigation.navigate('Login/registerauth', {
            phone: phone.replace(/\D+/g, ''),
            name: name
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
            <Text style={styles.title}>실명과 휴대전화번호를{'\n'}입력해 주세요</Text>

            {/* 실명 입력 */}
            <TextInput
                style={styles.input}
                placeholder="ex) 홍길동"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
            />

            {/* 전화번호 입력 */}
            <TextInput
                style={styles.input}
                placeholder="-없이 숫자로만 입력"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                value={formatPhone(phone)}
                onChangeText={(text) => {
                    const onlyNums = text.replace(/\D+/g, '');
                    setPhone(onlyNums.slice(0, 11));
                }}
            />

            {/* 다음 버튼 */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' },
                    isLoading && { opacity: 0.7 }
                ]}
                disabled={!isValid || isLoading}
                onPress={handleNext}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? '처리중...' : '다음'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Register;

