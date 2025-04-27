// writingpage.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Animated, Easing, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from '../Components/Css/Homepage/writingpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import axios from 'axios';
import API_CONFIG from '../DB/api';
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
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

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
            console.log(result);
            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('에러', e.message);
        }
    };

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
            });
            console.log(result);
            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
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
        if (!title.trim() || !content.trim()) {
            Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            // API_CONFIG 확인을 위한 로깅 추가
            console.log('API_CONFIG:', API_CONFIG);
            console.log('BASE_URL:', API_CONFIG.BASE_URL);

            const postData = {
                post_title: title,
                name: name,
                post_content: content,
                post_category: selectedCategory,
                phone: phone,
                region: region
            };

            console.log('전송할 데이터:', postData);

            // 서버 요청
            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/post`, postData, {
                timeout: API_CONFIG.TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('서버 응답:', response.data);

            if (response.status === 200) {
                Alert.alert('성공', '게시글이 등록되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => navigation.goBack()
                    }
                ]);
            }
        } catch (error) {
            console.error('게시글 등록 오류:', error);
            console.log('에러 상세:', error.response?.data);
            console.log('현재 사용 중인 BASE_URL:', API_CONFIG.BASE_URL);
            Alert.alert('오류', '게시글 등록 중 문제가 발생했습니다. 서버 연결을 확인해주세요.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, { marginTop: -60 }]}>
                    {/* dim 처리 */}
                    {(isCategoryModalVisible || isUploadModalVisible) && (
                        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => {
                            isCategoryModalVisible && closeCategorySheet();
                            isUploadModalVisible && closeUploadSheet();
                        }} />
                    )}

                    {/* 카테고리 바텀시트 */}
                    {isCategoryModalVisible && (
                        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}
                        >
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>카테고리 선택</Text>
                                <TouchableOpacity onPress={closeCategorySheet}>
                                    <Text style={styles.sheetClose}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.sheetOptions}>
                                <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('농사질문'); setSelectedIcon(require('../../assets/farmingquestions2.png')); closeCategorySheet(); }}>
                                    <Image source={require('../../assets/FarmingQuestions.png')} style={styles.sheetIcon} />
                                    <Text style={styles.sheetLabel}>농사질문</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('농사공부'); setSelectedIcon(require('../../assets/studyfarming2.png')); closeCategorySheet(); }}>
                                    <Image source={require('../../assets/studyfarming.png')} style={styles.sheetIcon} />
                                    <Text style={styles.sheetLabel}>농사공부</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sheetItem} onPress={() => { setSelectedCategory('자유주제'); setSelectedIcon(require('../../assets/freetopic2.png')); closeCategorySheet(); }}>
                                    <Image source={require('../../assets/freetopic.png')} style={styles.sheetIcon} />
                                    <Text style={styles.sheetLabel}>자유주제</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* 사진 업로드 바텀시트 */}
                    {isUploadModalVisible && (
                        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: uploadTranslateY }] }]}
                        >
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
                    )}

                    {/* 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../assets/gobackicon.png')} />
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

                    {/* 제목 입력 */}
                    <TextInput
                        style={styles.titleInput}
                        placeholder="제목을 입력해 주세요."
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                    />

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
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 10 }} />
                    )}
                    {/* 사진 업로드 */}
                    <TouchableOpacity style={styles.uploadBtn} onPress={openUploadSheet}>
                        <Image source={require('../../assets/cameraicon.png')} style={styles.cameraIcon} />
                        <Text style={styles.uploadText}>사진 올리기</Text>
                    </TouchableOpacity>

                    {/* 등록 버튼 */}
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>등록</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default WritingPage;