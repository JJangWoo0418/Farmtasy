import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/register2style';

const Register2 = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const navigation = useNavigation();

    const isValid = name.trim() !== '' && phone.trim().length === 11;

    const formatPhone = (value) => {
        const cleaned = value.replace(/\D+/g, ''); // 숫자 이외 제거
    
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
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
                    setPhone(onlyNums.slice(0, 11)); // 최대 11자리 제한
                }}
            />

            {/* 다음 버튼 */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid}
                onPress={() => navigation.navigate('Login/registerauth')}
            >
                <Text style={styles.buttonText}>다음</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Register2;

