import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import styles from '../../Components/Css/Homepage/directpaymentpagestyle';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';


const DirectPaymentPage = () => {
    const navigation = useNavigation();
    const [area, setArea] = useState('');
    const [landType, setLandType] = useState('논');
    const [regionType, setRegionType] = useState('진흥지역');
    const { userData, phone, name, region } = useLocalSearchParams();

    console.log('유저이름:', name);
    console.log('지역:', region);

    const isButtonActive = area.trim().length > 0 && !isNaN(Number(area));

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text style={styles.title}>면적 직불금 계산기</Text>
                    </View>

                    <Text style={styles.desc}>
                        농지 정보를 입력하면{'\n'}
                        내가 받을 수 있는{'\n'}
                        <Text style={styles.highlight}>면적 직불금 금액</Text>을 알려드려요.
                    </Text>

                    <Text style={styles.label}>농지 면적</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.inputWithUnit}
                            value={area}
                            onChangeText={setArea}
                            keyboardType="numeric"
                            placeholder="숫자만 입력해 주세요 (예: 5000)"
                        />
                        <Text style={styles.unitInInput}>평</Text>
                    </View>

                    <Text style={styles.label}>농지 구분</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, landType === '논' && styles.toggleBtnActive]}
                            onPress={() => setLandType('논')}
                        >
                            <Text style={[styles.toggleText, landType === '논' && styles.toggleTextActive]}>논</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, landType === '밭' && styles.toggleBtnActive, { marginRight: 0 }]}
                            onPress={() => setLandType('밭')}
                        >
                            <Text style={[styles.toggleText, landType === '밭' && styles.toggleTextActive]}>밭</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>농업 진흥지역 구분</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, regionType === '진흥지역' && styles.toggleBtnActive]}
                            onPress={() => setRegionType('진흥지역')}
                        >
                            <Text style={[styles.toggleText, regionType === '진흥지역' && styles.toggleTextActive]}>진흥지역</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, regionType === '비진흥지역' && styles.toggleBtnActive, { marginRight: 0 }]}
                            onPress={() => setRegionType('비진흥지역')}
                        >
                            <Text style={[styles.toggleText, regionType === '비진흥지역' && styles.toggleTextActive]}>비진흥지역</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.infoText}>
                        농식품부 '직불금 미리 계산' 정보를 토대로 그대로 제공돼요.
                    </Text>

                    <TouchableOpacity
                        style={[styles.calcBtn, { backgroundColor: isButtonActive ? '#22CC6B' : '#D9D9D9' }]}
                        activeOpacity={isButtonActive ? 0.7 : 1}
                        disabled={!isButtonActive}
                        onPress={
                            isButtonActive
                                ? () =>
                                    router.push({
                                        pathname: 'Homepage/directpaymentpage2', params: {
                                            area,
                                            landType,
                                            regionType,
                                            userData,
                                            phone,
                                            name,
                                            region
                                        }
                                    })
                                : undefined
                        }
                    >
                        <Text style={[styles.calcBtnText, { color: isButtonActive ? '#fff' : '#888' }]}>
                            내 직불금 알아보기
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default DirectPaymentPage;
