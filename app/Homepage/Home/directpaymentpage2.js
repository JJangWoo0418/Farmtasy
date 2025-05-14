import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Easing } from 'react-native';
import styles from '../../Components/Css/Homepage/directpaymentpage2style';
import { useNavigation} from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';


const DirectPaymentPage2 = () => {
    const navigation = useNavigation();
    const { area, landType, regionType, userData, phone, name, region } = useLocalSearchParams();

    const areaNum = parseFloat(area.replace(/,/g, ''));

    // 지급 단가 계산
    let unitPrice = 0;
    if (landType === '논') {
        unitPrice = regionType === '진흥지역' ? 710.744 : 567.8;
    } else if (landType === '밭') {
        unitPrice = regionType === '진흥지역' ? 527.9 : 470.3;
    }

    const resultAmount = Math.round(areaNum * unitPrice);

    // Animated 숫자 선언
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayedValue, setDisplayedValue] = useState(0);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: resultAmount,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();

        const listener = animatedValue.addListener(({ value }) => {
            setDisplayedValue(Math.floor(value));
        });

        return () => {
            animatedValue.removeListener(listener);
        };
    }, [resultAmount]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 10 }}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/Homepage/Home/homepage', params: {
                    userData,
                    phone,
                    name,
                    region
                } })}>
                    <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>면적 직불금 계산기</Text>
            </View>

            {/* 내 예상 금액 */}
            <Text style={styles.sectionTitle}>내 예상 금액</Text>
            <Text style={styles.result}>
                {displayedValue.toLocaleString()}원
            </Text>
            <View style={styles.inputSummaryRow}>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{area}평</Text></View>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{landType}</Text></View>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{regionType}</Text></View>
            </View>
            <Text style={styles.resultDesc}>입력된 정보로 계산된 예상 금액으로{'\n'}실제 지급되는 금액과 다를 수 있어요.</Text>
            <View style={styles.line}></View>

            {/* 지급 단가표 */}
            <Text style={styles.tableTitle}>면적 직불금 지급 단가</Text>
            <Image source={require('../../../assets/directpaymenticon.png')} style={styles.tableImage} />
            <Text style={styles.tableTitle2}>출처 | 농림축산식품부 AgriX</Text>
        </ScrollView>
    );
};

export default DirectPaymentPage2;
