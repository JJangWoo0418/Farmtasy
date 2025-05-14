import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Animated, Alert } from 'react-native';
import styles from '../Components/Css/Login/loginstyle'; // 스타일 파일 분리
import { useNavigation } from '@react-navigation/native'; // ✅ 네비게이션 가져오기
import { executeKakaoLogin } from '../DB/kakaologindb';

const Intro = () => {
    console.log("인트로 창 로드");
    const navigation = useNavigation(); // ✅ 네비게이션 설정
    const [isLoading, setIsLoading] = useState(false);

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

    // 카카오 로그인 처리 함수
    const handleKakaoLogin = async () => {
        try {
            setIsLoading(true);
            const result = await executeKakaoLogin();
            
            if (result.success) {
                // 로그인 성공 시 홈페이지로 이동
                navigation.replace('Homepage/homepage');
            } else {
                Alert.alert('로그인 실패', result.message || '카카오 로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('카카오 로그인 오류:', error);
            Alert.alert('오류', '카카오 로그인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* 상태바 추가 */}
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 앱 타이틀 */}
            <Image source={require('../../assets/IntroLogo3.png')} style={styles.Logo} />

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
                    source={require('../../assets/GreenTalkButton2.png')}
                    style={[styles.GreenTalkButton, { transform: [{ translateY: floatAnim }] }]}
                />

                <TouchableOpacity 
                    onPress={() => {
                        Alert.alert(
                            "서비스 준비중",
                            "현재 서비스 준비중입니다. 조금만 기다려주세요.",
                            [
                                { text: "확인", style: "default" }
                            ]
                        );
                    }}
                    disabled={isLoading}
                >
                    <Image 
                        source={require('../../assets/KakaoTalkButton2.png')} 
                        style={[styles.kakaoIcon, isLoading ? { opacity: 0.7 } : null]} 
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Map/Map')}>
                    <Text style={styles.phoneText}>휴대전화번호로 시작</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Intro;
