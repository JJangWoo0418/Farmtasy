import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Animated, Modal, Easing, Alert } from 'react-native';
import styles from '../Components/Css/Homepage/profilesettingpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_CONFIG from '../DB/api';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

console.log('ImagePicker:', ImagePicker);
console.log('ImagePicker.MediaType:', ImagePicker.MediaType);
console.log('ImagePicker.MediaTypeOptions:', ImagePicker.MediaTypeOptions);

const ProfileSettingPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const phone = route?.params?.phone;

    // 상태 변수: 모두 빈 문자열로 초기화
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [profileLine, setProfileLine] = useState(''); // 한 줄 프로필
    const [aboutMe, setAboutMe] = useState('');         // 내 소개
    const [profileImage, setProfileImage] = useState('');
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [uploadTranslateY] = useState(new Animated.Value(400));

    useEffect(() => {
        console.log('phone:', phone);
        if (!phone) return;
        fetchUserData();
    }, [phone]);

    // 서버에서 사용자 정보 받아오기
    const fetchUserData = async () => {
        console.log('요청 경로:', `${API_CONFIG.BASE_URL}/api/user`, 'params:', { phone });
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/api/user`, {
                params: { phone }
            });
            const data = response.data;
            console.log('서버에서 받아온 데이터:', data);
            setName(data.name || '');
            setRegion(data.region || '');
            setProfileLine(data.introduction || '');
            setAboutMe(data.about_me || '');
            setProfileImage(data.profile_image || '');
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/user/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    name,
                    region,
                    introduction: profileLine,
                    about_me: aboutMe,
                    profile_image: profileImage,
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('프로필이 수정되었습니다.');
                navigation.goBack();
            } else {
                alert(data.message || '수정 실패');
            }
        } catch (e) {
            alert('서버 오류');
        }
    };

    const openUploadSheet = () => {
        setIsUploadModalVisible(true);
        Animated.timing(uploadTranslateY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    };
    const closeUploadSheet = () => {
        Animated.timing(uploadTranslateY, {
            toValue: 400,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => setIsUploadModalVisible(false));
    };

    // S3 업로드 함수
    const uploadImageToS3 = async (uri) => {
        try {
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            
            // 1) presigned URL 요청
            const presignRes = await axios.post(`${API_CONFIG.BASE_URL}/api/s3/presign`, {
                fileName: filename,
                fileType: type,
            });
            const presignedUrl = presignRes.data.url;
            
            // 2) 이미지 파일 읽기
            const response = await fetch(uri);
            const blob = await response.blob();
            
            // 3) S3에 직접 업로드
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': type },
                body: blob,
            });
            
            if (uploadRes.status !== 200) {
                throw new Error(`S3 업로드 실패: ${uploadRes.status}`);
            }
            
            // 4) S3 이미지 URL 생성
            return presignedUrl.split('?')[0];
        } catch (error) {
            console.error('S3 업로드 에러:', error);
            throw new Error(`S3 업로드 중 오류 발생: ${error.message}`);
        }
    };

    // 사진 촬영 함수 (S3 업로드 적용)
    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const s3Url = await uploadImageToS3(result.assets[0].uri);
                setProfileImage(s3Url);
            }
        } catch (e) {
            Alert.alert('에러', e.message);
        }
        closeUploadSheet();
    };

    // 앨범에서 사진 선택 함수 (S3 업로드 적용)
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
                return;
            }
            console.log('앨범 권한 확인 완료:', status);
            
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            console.log('이미지 선택 결과:', result);
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                console.log('선택된 이미지 URI:', result.assets[0].uri);
                const s3Url = await uploadImageToS3(result.assets[0].uri);
                console.log('S3 업로드 완료 URL:', s3Url);
                setProfileImage(s3Url);
            } else {
                console.log('이미지 선택 취소 또는 에러');
            }
        } catch (e) {
            console.error('이미지 선택 에러:', e);
            Alert.alert('에러', '이미지 선택 중 오류가 발생했습니다: ' + e.message);
        }
        closeUploadSheet();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* 상단 바 */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>프로필 수정</Text>
                    <TouchableOpacity style={styles.doneBtn} onPress={handleUpdateProfile}>
                        <Text style={styles.doneBtnText}>완료</Text>
                    </TouchableOpacity>
                </View>

                {/* 프로필 이미지 */}
                <View style={styles.profileImgSection}>
                    <TouchableOpacity style={styles.profileImgWrapper} onPress={openUploadSheet}>
                        <Image source={profileImage ? { uri: profileImage } : require('../../assets/usericon.png')} style={styles.profileImg} />
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
                        value={aboutMe}
                        onChangeText={setAboutMe}
                        placeholder="공유하고 싶은 회원님의 자랑스러운 노하우, 특별한 이력, 관심사를 적어주세요"
                        placeholderTextColor="#bbb"
                        multiline
                        maxLength={100}
                    />
                    <Text style={styles.inputHint}>본문 내용은 최대 100자까지 가능합니다</Text>
                </View>

                {/* 사진 업로드 바텀시트 */}
                <Modal
                    visible={isUploadModalVisible}
                    transparent
                    animationType="none"
                    onRequestClose={closeUploadSheet}
                >
                    <View style={styles.overlay}>
                        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={closeUploadSheet} />
                        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: uploadTranslateY }] }]}>
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>사진 올리기 선택</Text>
                                <TouchableOpacity onPress={closeUploadSheet}>
                                    <Text style={styles.sheetClose}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.sheetOptions}>
                                <TouchableOpacity style={styles.sheetItem} onPress={handleTakePhoto}>
                                    <Image source={require('../../assets/cameraicon2.png')} style={styles.sheetIcon3} />
                                    <Text style={styles.sheetLabel}>사진 촬영</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetItem} onPress={handlePickImage}>
                                    <Image source={require('../../assets/galleryicon.png')} style={styles.sheetIcon} />
                                    <Text style={styles.sheetLabel}>앨범 선택</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ProfileSettingPage;
