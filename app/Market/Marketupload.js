import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from '../Components/Css/Market/marketuploadstyle';

const categories = [
{ label: '농수산물 팔기', icon: require('../../assets/fruit.png') },
{ label: '농자재 팔기', icon: require('../../assets/tool.png') },
{ label: '생활잡화 팔기', icon: require('../../assets/life.png') },
{ label: '농기계 팔기', icon: require('../../assets/tractor.png') },
{ label: '비료/상토 팔기', icon: require('../../assets/fertilizer.png') },
{ label: '제초용품 팔기', icon: require('../../assets/weed.png') },
{ label: '종자/모종 팔기', icon: require('../../assets/seed.png') },
];

const MarketUpload = () => {
const [imageUri, setImageUri] = useState(null);
const [phonePlaceholder, setPhonePlaceholder] = useState('010-1234-5678');
const [namePlaceholder, setNamePlaceholder] = useState('상품명과 중량을 입력해 주세요');
const [pricePlaceholder, setPricePlaceholder] = useState('상품 가격을 입력해 주세요.');
const [descPlaceholder, setDescPlaceholder] = useState('상품의 옵션, 상태, 수확 과정 등 상세하게 작성할수록 더 쉽게 판매할 수 있어요.');
const [showCategory, setShowCategory] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('');

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
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
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
            setImageUri(result.assets[0].uri);
        }
        },
    },
    { text: '취소', style: 'cancel' },
    ]
);
};

return (
<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
        {/* 상단 네비게이션 */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
            <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>글쓰기</Text>
        </View>
        <View style={styles.divider} />

        {/* 사진 업로드 */}
        <TouchableOpacity style={styles.imageUploadBtn} onPress={handleImagePick}>
        {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: 40, height: 40, borderRadius: 8, marginRight: 8 }} />
        ) : (
            <Image source={require('../../assets/cameraicon3.png')} style={styles.cameraIcon} />
        )}
        <Text style={styles.imageUploadText}>사진 올리기</Text>
        </TouchableOpacity>

        {/* 상품명 입력 */}
        <TextInput
        style={styles.input}
        placeholder={namePlaceholder}
        placeholderTextColor="#BDBDBD"
        onFocus={() => setNamePlaceholder('')}
        onBlur={() => setNamePlaceholder('상품명과 중량을 입력해 주세요')}
        />
        <Text style={styles.inputHint}>예) 샤인머스캣 2kg</Text>

        {/* 카테고리 선택 */}
        <View style={styles.dropdownWrap}>
        <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCategory(!showCategory)}
            activeOpacity={0.8}
        >
            <Text style={[styles.dropdownText, { color: selectedCategory ? '#222' : '#BDBDBD' }]}> 
            {selectedCategory || '카테고리 선택'}
            </Text>
            <Image source={require('../../assets/triangle.png')} style={styles.dropdownIcon} />
        </TouchableOpacity>
        </View>
        {showCategory && (
        <View style={styles.categoryList}>
            {categories.map((cat, idx) => (
            <TouchableOpacity
                key={idx}
                style={styles.categoryItem}
                onPress={() => {
                setSelectedCategory(cat.label);
                setShowCategory(false);
                }}
            >
                <Image source={cat.icon} style={styles.categoryIcon} />
                <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
            ))}
        </View>
        )}

        {/* 가격 입력 */}
        <View style={styles.priceRow}>
        <Text style={styles.pricePrefix}>₩</Text>
        <TextInput
            style={styles.priceInput}
            placeholder={pricePlaceholder}
            placeholderTextColor="#BDBDBD"
            keyboardType="numeric"
            onFocus={() => setPricePlaceholder('')}
            onBlur={() => setPricePlaceholder('상품 가격을 입력해 주세요.')}
        />
        <Text style={styles.priceSuffix}>원</Text>
        </View>

        {/* 전화번호 입력 */}
        <TextInput
        style={styles.input}
        placeholder={phonePlaceholder}
        placeholderTextColor="#222"
        keyboardType="phone-pad"
        onFocus={() => setPhonePlaceholder('')}
        onBlur={() => setPhonePlaceholder('010-1234-5678')}
        />

        {/* 상세 설명 */}
        <TextInput
        style={styles.textarea}
        placeholder={descPlaceholder}
        placeholderTextColor="#BDBDBD"
        multiline
        onFocus={() => setDescPlaceholder('')}
        onBlur={() => setDescPlaceholder('상품의 옵션, 상태, 수확 과정 등 상세하게 작성할수록 더 쉽게 판매할 수 있어요.')}
        />

        {/* 등록 버튼 */}
        <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>등록</Text>
        </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
</KeyboardAvoidingView>
);
};

export default MarketUpload;
