import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar } from 'react-native';
import styles from '../Components/Css/Login/loginstyle'; // 스타일 파일 분리

const Login = () => {
    console.log("Login Screen Loaded");

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
                
                <Image source={require('../../assets/GreenTalkButton.png')} style={styles.GreenTalkButton} />

                <TouchableOpacity>
                    <Image source={require('../../assets/KakaoTalkButton.png')} style={styles.kakaoIcon} />
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.phoneText}>휴대전화번호로 시작</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;
