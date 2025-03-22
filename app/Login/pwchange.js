import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/pwchangestyle';

const PwChange = () => {
    const [phone, setPhone] = useState('');
    const navigation = useNavigation();

    const isValid = phone.trim().length === 11;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 뒤로가기 아이콘 */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>

            {/* 제목 */}
            <Text style={styles.title}>휴대전화번호를{'\n'}입력해 주세요</Text>

            {/* 전화번호 입력 */}
            <TextInput
                style={styles.input}
                placeholder="-없이 숫자로만 입력"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={11}
            />

            {/* 다음 버튼 */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: isValid ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid}
                onPress={() => navigation.navigate('Login/pwchangeauth')}
            >
                <Text style={styles.buttonText}>다음</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PwChange;

