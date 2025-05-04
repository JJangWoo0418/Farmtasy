import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import styles from '../Components/Css/Homepage/profilesettingpagestyle';
import { useNavigation } from '@react-navigation/native';

const ProfileSettingPage = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('홍길동');
    const [region, setRegion] = useState('');
    const [profileLine, setProfileLine] = useState('');
    const [introduction, setIntroduction] = useState('');

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* 상단 바 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>프로필 수정</Text>
                <TouchableOpacity style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>완료</Text>
                </TouchableOpacity>
            </View>

            {/* 프로필 이미지 */}
            <View style={styles.profileImgSection}>
                <TouchableOpacity style={styles.profileImgWrapper}>
                    <Image source={require('../../assets/usericon.png')} style={styles.profileImg} />
                    <View style={styles.cameraBtn}>
                        <Image source={require('../../assets/cameraicon3.png')} style={styles.cameraIcon} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* 입력 폼 */}
            <View style={styles.formSection}>
                <Text style={styles.inputLabel}>이름(또는 별명)</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="이름이나 별명을 입력해 주세요"
                    placeholderTextColor="#bbb"
                />

                <Text style={styles.inputLabel}>지역</Text>
                <TouchableOpacity style={styles.regionSelectBox} activeOpacity={0.8}>
                    <Text style={region ? styles.regionText : styles.regionPlaceholder}>
                        {region || '지역을 선택해 주세요'}
                    </Text>
                    <Image source={require('../../assets/arrowupdownicon.png')} style={styles.regionIcon} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>한 줄 프로필</Text>
                <TextInput
                    style={styles.input}
                    value={profileLine}
                    onChangeText={setProfileLine}
                    placeholder="나를 대표하는 한 줄을 작성해 주세요"
                    placeholderTextColor="#bbb"
                    maxLength={12}
                />
                <Text style={styles.inputHint}>ex. 귀농 4년차 딸기 농부 (최대 12자까지 가능)</Text>

                <Text style={styles.inputLabel}>내 소개</Text>
                <TextInput
                    style={[styles.input2, styles.inputMultiline]}
                    value={introduction}
                    onChangeText={setIntroduction}
                    placeholder="공유하고 싶은 회원님의 자랑스러운 노하우, 특별한 이력, 관심사를 적어주세요"
                    placeholderTextColor="#bbb"
                    multiline
                    maxLength={100}
                />
                <Text style={styles.inputHint}>본문 내용은 최대 100자까지 가능합니다</Text>
            </View>
        </ScrollView>
    );
};

export default ProfileSettingPage;
