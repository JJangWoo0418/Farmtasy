import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Animated } from 'react-native';
import styles from '../Components/Css/Login/loginstyle'; // 스타일 파일 분리
import { useNavigation } from '@react-navigation/native'; // ✅ 네비게이션 가져오기

const Login = () => {
    console.log("Login Screen Loaded");
    const navigation = useNavigation(); // ✅ 네비게이션 설정

    // ✅ 애니메이션 값 설정
    const floatAnim = useRef(new Animated.Value(0)).current;

    // ✅ 애니메이션 효과 정의 (위아래로 반복)
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>

            {/* 상태바 추가 */}
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 앱 타이틀 */}
            <Image source={require('../../assets/IntroLogo.png')} style={styles.Logo} />

            {/* 기관 로고 및 텍스트 */}
            <View style={styles.orgContainer}>
                <View style={styles.orgRow}>
                    <Image source={require('../../assets/IntroLogo2.png')} style={styles.Logo2} />
                </View>
            </View>

            {/* 버튼 컨테이너 */}
            <View style={styles.buttonContainer}>
                
                {/* ✅ 애니메이션 적용 */}
                <Animated.Image
                    source={require('../../assets/GreenTalkButton.png')}
                    style={[styles.GreenTalkButton, { transform: [{ translateY: floatAnim }] }]}
                />

                <TouchableOpacity>
                    <Image source={require('../../assets/KakaoTalkButton.png')} style={styles.kakaoIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login/register')}>
                    <Text style={styles.phoneText}>휴대전화번호로 시작</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;
