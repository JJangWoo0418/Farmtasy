import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../Components/Css/Login/loginstyle'; // 스타일 파일 분리

const Login = () => {
    console.log("Login Screen Loaded");

    return (
        <View style={styles.container}>
            {/* 앱 타이틀 */}
            <Text style={styles.title}>Farmtasy</Text>
            <Text style={styles.subtitle}>환상적인 농장 관리를 실현하다</Text>

            {/* 기관 로고 및 텍스트 */}
            <View style={styles.orgContainer}>
                <View style={styles.orgRow}>
                    <Image source={require('../../assets/IntroLogo.png')} style={styles.orgLogo} />
                    <Text style={styles.orgText}>농림축산식품부</Text>
                </View>
            </View>

            {/* 버튼 컨테이너 */}
            <View style={styles.buttonContainer}>
                <Text style={styles.startText}>농장 관리를 시작해 보세요!</Text>

                <TouchableOpacity style={styles.kakaoButton}>
                    <Image source={require('../../assets/IntroLogo2.png')} style={styles.kakaoIcon} />
                    <Text style={styles.kakaoText}>카카오톡으로 시작</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.phoneText}>휴대전화번호로 시작</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;
