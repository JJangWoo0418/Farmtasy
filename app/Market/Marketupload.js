import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Keyboard, TouchableWithoutFeedback, Animated, Easing, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from '../Components/Css/Market/marketuploadstyle';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import axios from 'axios';
import API_CONFIG from '../DB/api';

const categories = [
    { label: '농수산물', icon: require('../../assets/fruit.png') },
    { label: '농자재', icon: require('../../assets/tool.png') },
    { label: '생활잡화', icon: require('../../assets/life.png') },
    { label: '농기계', icon: require('../../assets/tractor.png') },
    { label: '비료/상토', icon: require('../../assets/fertilizer.png') },
    { label: '제초용품', icon: require('../../assets/weed.png') },
    { label: '종자/모종', icon: require('../../assets/seed.png') },
    { label: '기타', icon: require('../../assets/etc.png') },
];

const MarketUpload = () => {
    const params = useLocalSearchParams();
    const [imageUris, setImageUris] = useState([]);
    const [namePlaceholder, setNamePlaceholder] = useState('상품명과 중량을 입력해 주세요');
    const [pricePlaceholder, setPricePlaceholder] = useState('상품 가격을 입력해 주세요.');
    const [descPlaceholder, setDescPlaceholder] = useState('상품의 옵션, 상태, 수확 과정 등 상세하게 작성할수록 더 쉽게 판매할 수 있어요.');
    const [showCategory, setShowCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(params.category || '');
    const sheetAnim = useRef(new Animated.Value(0)).current;
    const [price, setPrice] = useState('');
    const [phone, setPhone] = useState(params.phone || '010-1234-5678');
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState(params.name || '');

    const openCategorySheet = () => {
        setShowCategory(true);
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
            setShowCategory(false);
        });
    };

    const sheetTranslateY = sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0]
    });

    const handlePriceChange = (text) => {
        const numeric = text.replace(/[^0-9]/g, '');
        const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        setPrice(formatted);
    };

    // 사진 선택/촬영 함수
    const handleImagePick = async () => {
        Alert.alert(
            '사진 업로드',
            '사진을 선택하거나 촬영할 수 있습니다.',
            [
                {
                    text: '갤러리에서 선택',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('권한 필요', '사진을 업로드하려면 갤러리 접근 권한이 필요합니다.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 1,
                            allowsMultipleSelection: true,
                            selectionLimit: 10,
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            setImageUris(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
                        }
                    },
                },
                {
                    text: '카메라로 촬영',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 1,
                        });
                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            setImageUris(prev => [...prev, result.assets[0].uri]);
                        }
                    },
                },
                { text: '취소', style: 'cancel' },
            ]
        );
    };

    const handleRemoveImage = (idx) => {
        Alert.alert(
            '사진 삭제',
            '이 사진을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        setImageUris(prev => prev.filter((_, i) => i !== idx));
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!productName || !selectedCategory || !price || !description || imageUris.length === 0) {
            Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            // 1. S3에 이미지 업로드
            const uploadedImageUrls = [];
            for (const uri of imageUris) {
                const fileName = `market/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
                const response = await fetch(uri);
                const blob = await response.blob();

                // Presigned URL 요청
                const presignResponse = await axios.post(`${API_CONFIG.BASE_URL}/api/s3/presign`, {
                    fileName,
                    fileType: 'image/jpeg'
                });

                if (!presignResponse.data.url) {
                    throw new Error('Presigned URL을 받지 못했습니다.');
                }

                // S3에 업로드
                const uploadResponse = await fetch(presignResponse.data.url, {
                    method: 'PUT',
                    body: blob,
                    headers: {
                        'Content-Type': 'image/jpeg'
                    }
                });

                if (!uploadResponse.ok) {
                    throw new Error('이미지 업로드에 실패했습니다.');
                }

                // 실제 이미지 URL 저장
                const imageUrl = `https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/${fileName}`;
                uploadedImageUrls.push(imageUrl);
            }

            // 2. 상품 정보 등록
            const marketData = {
                name: userName,
                market_name: productName,
                market_category: selectedCategory,
                market_price: parseInt(price.replace(/,/g, '')),
                market_image_url: JSON.stringify(uploadedImageUrls),
                market_content: description,
                phone: phone
            };

            console.log('상품 등록 요청 데이터:', marketData);

            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/market`, marketData);

            if (response.data.success) {
                Alert.alert('성공', '상품이 등록되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => router.push('/Market/market')
                    }
                ]);
            } else {
                throw new Error(response.data.message || '상품 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 등록 실패:', error);
            let errorMessage = '상품 등록에 실패했습니다.';
            
            if (error.response) {
                // 서버에서 응답이 왔지만 에러인 경우
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.request) {
                // 요청은 보냈지만 응답이 없는 경우
                errorMessage = '서버에 연결할 수 없습니다.';
            }
            
            Alert.alert('오류', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
            {/* 카테고리 모달 (Modal 컴포넌트 사용) */}
            <Modal
                visible={showCategory}
                transparent
                animationType="fade"
                onRequestClose={closeCategorySheet}
            >
                <TouchableOpacity
                    style={styles.dim}
                    activeOpacity={1}
                    onPress={closeCategorySheet}
                />
                <Animated.View
                    style={[
                        styles.categoryModal,
                        { transform: [{ translateY: sheetTranslateY }] }
                    ]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>카테고리 선택</Text>
                        <TouchableOpacity onPress={closeCategorySheet}>
                            <Text style={styles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoryList}>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.categoryItem}
                                onPress={() => {
                                    setSelectedCategory(cat.label);
                                    closeCategorySheet();
                                }}
                            >
                                <Image source={cat.icon} style={styles.categoryIcon} />
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </Modal>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    {/* 상단 네비게이션 */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>글쓰기</Text>
                    </View>

                    {/* 사진 업로드 미리보기 */}
                    {imageUris.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, marginTop: 20 }}>
                            {imageUris.map((uri, idx) => (
                                <TouchableOpacity key={idx} onPress={() => handleRemoveImage(idx)} activeOpacity={0.8}>
                                    <Image
                                        source={{ uri }}
                                        style={{ width: 120, height: 120, borderRadius: 8, marginRight: 8 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* 사진 업로드 버튼 */}
                    <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImagePick}>
                        <Image source={require('../../assets/cameraicon.png')} style={styles.cameraIcon} />
                        <Text style={styles.imageUploadText}>사진 올리기</Text>
                    </TouchableOpacity>

                    {/* 상품명 입력 */}
                    <TextInput
                        style={styles.input}
                        placeholder={namePlaceholder}
                        placeholderTextColor="#BDBDBD"
                        value={productName}
                        onChangeText={setProductName}
                        onFocus={() => setNamePlaceholder('')}
                        onBlur={() => setNamePlaceholder('상품명과 중량을 입력해 주세요')}
                    />
                    <Text style={styles.inputHint}>예) 샤인머스캣 2kg</Text>

                    {/* 카테고리 선택 */}
                    <View style={styles.dropdownWrap}>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={openCategorySheet}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.dropdownText, { color: selectedCategory ? '#222' : '#BDBDBD' }]}>
                                {selectedCategory || '카테고리 선택'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/* 가격 입력 */}
                    <View style={styles.priceRow}>
                        <Text style={styles.pricePrefix}>₩</Text>
                        <TextInput
                            style={styles.priceInput}
                            placeholder={pricePlaceholder}
                            placeholderTextColor="#BDBDBD"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={handlePriceChange}
                            onFocus={() => setPricePlaceholder('')}
                            onBlur={() => setPricePlaceholder('상품 가격을 입력해 주세요.')}
                        />
                        <Text style={styles.priceSuffix}>원</Text>
                    </View>

                    {/* 전화번호 입력 */}
                    <TextInput
                        style={styles.input}
                        placeholder={'010-1234-5678'}
                        placeholderTextColor="#222"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        editable={false}
                    />

                    {/* 상세 설명 */}
                    <TextInput
                        style={styles.textarea}
                        placeholder={descPlaceholder}
                        placeholderTextColor="#BDBDBD"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                        onFocus={() => setDescPlaceholder('')}
                        onBlur={() => setDescPlaceholder('상품의 옵션, 상태, 수확 과정 등 상세하게 작성할수록 더 쉽게 판매할 수 있어요.')}
                    />

                    {/* 등록 버튼 */}
                    <TouchableOpacity
                        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitBtnText}>
                            {isLoading ? '등록 중...' : '등록'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
};

export default MarketUpload;
