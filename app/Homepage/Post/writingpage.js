// writingpage.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Animated, Easing, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import styles from '../../Components/Css/Homepage/writingpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from 'axios';
import API_CONFIG from '../../DB/api';
import * as ImagePicker from 'expo-image-picker';

const WritingPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { category, icon, userData, name, phone, region } = route.params || {};  // 먼저 route.params 구조분해

    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [isUploadModalVisible, setUploadModalVisible] = useState(false);
    // category 값을 받아온 후에 selectedCategory 초기값 설정
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [selectedIcon, setSelectedIcon] = useState(icon);
    const sheetAnim = useRef(new Animated.Value(0)).current;
    const uploadAnim = useRef(new Animated.Value(0)).current;
    const [content, setContent] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);

    // 사진 촬영 함수
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
            if (!result.canceled) {
                // 촬영은 1장만 가능
                setSelectedImages(prev => [...prev, result.assets[0].uri]);
            }
        } catch (e) {
            Alert.alert('에러', e.message);
        }
    };

    // 앨범에서 사진 선택 함수
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
                allowsMultipleSelection: true, // 여러 장 선택 허용
                selectionLimit: 5, // 선택 가능 최대 개수 (원하는 만큼)
            });
            if (!result.canceled) {
                // 여러 장 선택 시 result.assets가 배열로 옴
                setSelectedImages(prev => [
                    ...prev,
                    ...result.assets.map(asset => asset.uri)
                ]);
            }
        } catch (e) {
            Alert.alert('에러', e.message);
        }
    };

    const openCategorySheet = () => {
        setCategoryModalVisible(true);
        Animated.timing(sheetAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const closeCategorySheet = () => {
        Animated.timing(sheetAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start(() => {
            setCategoryModalVisible(false);
        });
    };

    const openUploadSheet = () => {
        setUploadModalVisible(true);
        Animated.timing(uploadAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const closeUploadSheet = () => {
        Animated.timing(uploadAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start(() => {
            setUploadModalVisible(false);
        });
    };

    const sheetTranslateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
    const uploadTranslateY = uploadAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('알림', '내용을 입력해주세요.');
            return;
        }

        try {
            // 1. S3에 이미지 업로드
            let imageUrls = [];
            for (const uri of selectedImages) {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
            
                // 1) presigned URL 요청
                const presignRes = await axios.post(`${API_CONFIG.BASE_URL}/api/s3/presign`, {
                    fileName: filename,
                    fileType: type,
                });
                const presignedUrl = presignRes.data.url;
            
                // 2) 이미지 파일 읽기 (React Native에서는 fetch로 Blob 변환)
                const response = await fetch(uri);
                const blob = await response.blob();
            
                // 3) S3에 직접 업로드
                const uploadRes = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': type },
                    body: blob,
                });
                console.log('S3 upload response:', uploadRes.status, uploadRes.statusText);
            
                if (uploadRes.status !== 200) {
                    // 에러 처리
                    const errorText = await uploadRes.text();
                    console.error('S3 upload error:', errorText);
                    Alert.alert('이미지 업로드 실패', `S3 업로드 실패: ${uploadRes.status}`);
                    return;
                }
            
                // 4) S3 이미지 URL 생성
                const s3ImageUrl = presignedUrl.split('?')[0];
                imageUrls.push(s3ImageUrl);
            }
    
            // 2. 게시글 데이터 전송
            const postData = {
                name: name,
                region: region,
                post_content: content,
                image_urls: imageUrls, // S3 URL 배열
                post_category: selectedCategory,
                phone: phone,
            };
    
            await axios.post(`${API_CONFIG.BASE_URL}/api/post`, postData, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            Alert.alert('성공', '게시글이 등록되었습니다.');
            navigation.goBack();
        } catch (error) {
            console.error('게시글 등록 오류:', error);
            Alert.alert('오류', '게시글 등록 중 문제가 발생했습니다.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            {/* === 바텀시트(모달)와 오버레이를 최상단에 위치 === */}
            {(isCategoryModalVisible || isUploadModalVisible) && (
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => {
                    isCategoryModalVisible && closeCategorySheet();
                    isUploadModalVisible && closeUploadSheet();
                }} />
            )}

            {/* 카테고리 바텀시트 */}
            {isCategoryModalVisible && (
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>카테고리 선택</Text>
                        <TouchableOpacity onPress={closeCategorySheet}>
                            <Text style={styles.sheetClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetOptions}>
                        <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('농사질문'); setSelectedIcon(require('../../../assets/FarmingQuestions.png')); closeCategorySheet(); }}>
                            <Image source={require('../../../assets/FarmingQuestions.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>농사질문</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('농사공부'); setSelectedIcon(require('../../../assets/studyfarming2.png')); closeCategorySheet(); }}>
                            <Image source={require('../../../assets/studyfarming.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>농사공부</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('자유주제'); setSelectedIcon(require('../../../assets/freetopic2.png')); closeCategorySheet(); }}>
                            <Image source={require('../../../assets/freetopic.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>자유주제</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {/* 사진 업로드 바텀시트 */}
            {isUploadModalVisible && (
                <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: uploadTranslateY }] }]}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>사진 올리기 선택</Text>
                        <TouchableOpacity onPress={closeUploadSheet}>
                            <Text style={styles.sheetClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetOptions}>
                        <TouchableOpacity style={styles.sheetItem} onPress={handleTakePhoto}>
                            <Image source={require('../../../assets/cameraicon2.png')} style={styles.sheetIcon3} />
                            <Text style={styles.sheetLabel}>사진 촬영</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sheetItem} onPress={handlePickImage}>
                            <Image source={require('../../../assets/galleryicon.png')} style={styles.sheetIcon} />
                            <Text style={styles.sheetLabel}>앨범 선택</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView style={[styles.container, { marginTop: -60 }]}>
                    {/* dim 처리 */}
                    {(isCategoryModalVisible || isUploadModalVisible) && (
                        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => {
                            isCategoryModalVisible && closeCategorySheet();
                            isUploadModalVisible && closeUploadSheet();
                        }} />
                    )}

                    {/* 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text style={styles.title}>글쓰기</Text>
                    </View>

                    {/* 주제 */}
                    <View style={styles.topicBox}>
                        <Image source={selectedIcon} style={styles.topicIcon} />
                        <Text style={styles.topicText}>{selectedCategory}</Text>
                        <TouchableOpacity style={styles.topicChangeBtn} onPress={openCategorySheet}>
                            <Text style={styles.topicChangeText}>변경</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 본문 입력 */}
                    <TextInput
                        style={styles.contentInput}
                        placeholder={"글쓰기로 자유롭게 소통해보세요.\n고민, 농업 정보 무엇이든 나눌 수 있어요."}
                        placeholderTextColor="#999"
                        multiline
                        value={content}
                        onChangeText={setContent}
                    />
                    {/* 사진 업로드 */}
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 10 }}
                    >
                        {selectedImages.map((uri, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => {
                                    Alert.alert(
                                        "사진 삭제",
                                        "이 사진을 삭제하시겠습니까?",
                                        [
                                            { text: "취소", style: "cancel" },
                                            {
                                                text: "삭제",
                                                style: "destructive",
                                                onPress: () => {
                                                    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                                                }
                                            }
                                        ]
                                    );
                                }}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri }}
                                    style={{ width: 200, height: 200, borderRadius: 10, marginRight: 10, marginLeft: 10 }}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {/* 사진 업로드 */}
                    <TouchableOpacity style={styles.uploadBtn} onPress={openUploadSheet}>
                        <Image source={require('../../../assets/cameraicon.png')} style={styles.cameraIcon} />
                        <Text style={styles.uploadText}>사진 올리기</Text>
                    </TouchableOpacity>

                    {/* 등록 버튼 */}
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>등록</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default WritingPage;