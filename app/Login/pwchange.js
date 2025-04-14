import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styles from '../Components/Css/Login/pwchangestyle';
import { sendVerificationCode } from '../DB/pwchangedb';

const PwChange = () => {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const isValid = phone.trim().length === 11;

    const formatPhone = (value) => {
        const cleaned = value.replace(/\D+/g, ''); // 숫자 이외 제거
    
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    const handleNext = async () => {
        if (!isValid) return;

        try {
            setIsLoading(true);
            const result = await sendVerificationCode(phone.replace(/\D+/g, ''));
            
            if (result.success) {
                // 인증번호 발송 성공 시 다음 페이지로 이동
                navigation.navigate('Login/pwchangeauth', { phone: phone.replace(/\D+/g, '') });
            } else {
                Alert.alert('오류', result.message || '인증번호 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('인증번호 발송 오류:', error);
            Alert.alert('오류', '인증번호 발송 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

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
                value={formatPhone(phone)}
                onChangeText={(text) => {
                    const onlyNums = text.replace(/\D+/g, '');
                    setPhone(onlyNums.slice(0, 11)); // 최대 11자리 제한
                }}
            />

            {/* 다음 버튼 */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: isValid && !isLoading ? '#22CC6B' : '#d1d1d1' }]}
                disabled={!isValid || isLoading}
                onPress={handleNext}
            >
                <Text style={styles.buttonText}>{isLoading ? '처리 중...' : '다음'}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PwChange;

