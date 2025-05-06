import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import styles from '../Components/Css/Homepage/directpaymentpage2style';
import { useNavigation } from '@react-navigation/native';

const DirectPaymentPage2 = () => {
    const navigation = useNavigation();
    // 예시 데이터 (실제 계산 결과와 props로 받을 수도 있음)
    const area = '5,000';
    const landType = '논';
    const regionType = '진흥지역';
    const result = '3,553,720원';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 10}}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Homepage/homepage')}>
                    <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>면적 직불금 계산기</Text>
            </View>

            {/* 내 예상 금액 */}
            <Text style={styles.sectionTitle}>내 예상 금액</Text>
            <Text style={styles.result}>{result}</Text>
            <View style={styles.inputSummaryRow}>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{area}평</Text></View>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{landType}</Text></View>
                <View style={styles.inputSummaryBox}><Text style={styles.inputSummaryText}>{regionType}</Text></View>
            </View>
            <Text style={styles.resultDesc}>입력된 정보로 계산된 예상 금액으로{'\n'}실제 지급되는 금액과 다를 수 있어요.</Text>
            <View style={styles.line}></View>

            {/* 지급 단가표 */}
            <Text style={styles.tableTitle}>면적 직불금 지급 단가</Text>
            <Image source={require('../../assets/directpaymenticon.png')} style={styles.tableImage} />
            <Text style={styles.tableTitle2}>출처 | 농림축산식품부 AgriX</Text>
        </ScrollView>
    );
};

export default DirectPaymentPage2;
