import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../Components/Css/Memo/cropdetailmemopagestyle';
import * as ImagePicker from 'expo-image-picker';

export default function CropDetailMemoPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [image, setImage] = useState(params.image || null);

    // 예시 데이터 (실제 데이터는 props나 API로 받아오세요)
    const cropName = params.name || '나의 소중한 감자밭 1호';
    const cropImage = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc';
    const memoTitle = '3월 11일 나의 첫 메모';
    const memoContent = '몇개들은 태풍맞아 감자들이 피해받았다\n기스가 심하게 생긴 감자들은 거르고\n상태 좋은 감자들은 계속 지켜봐야 겠다';

    // 이미지 선택
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const fileName = localUri.split('/').pop();

            // S3 presigned URL 요청
            const presignRes = await fetch(`${API_CONFIG.BASE_URL}/api/s3/presign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName,
                    fileType: 'image/jpeg', // 실제 타입 필요시 동적으로 변경
                }),
            });
            const { url: presignedUrl } = await presignRes.json();

            // S3에 이미지 업로드
            const img = await fetch(localUri);
            const blob = await img.blob();
            await fetch(presignedUrl, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': 'image/jpeg' },
            });

            // S3 URL 생성
            const s3Url = `https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/${fileName}`;
            setImage(s3Url);
        }
    };

    return (
        <View style={styles.container}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <Image source={require('../../assets/gobackicon.png')} style={styles.headerIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{cropName}</Text>
                <TouchableOpacity style={styles.headerIconBtn}>
                    <Image source={require('../../assets/deleteicon.png')} style={styles.headerIcon} />
                </TouchableOpacity>
            </View>

            {/* 사진 추가 */}
            <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.photo} resizeMode="cover" />
                ) : (
                    <>
                        <Image source={require('../../assets/galleryicon2.png')} style={styles.icon} />
                        <Text style={styles.photoText}>사진 추가</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* 버튼 영역 */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Image source={require('../../assets/planticon.png')} style={styles.actionIcon} />
                    <Text style={styles.actionText}>작물 위치</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Image source={require('../../assets/qricon.png')} style={styles.actionIcon} />
                    <Text style={styles.actionText}>QR코드</Text>
                </TouchableOpacity>
            </View>

            {/* 버튼 아래 구분선 */}
            <View style={styles.divider} />

            {/* 메모 카드 */}
            <ScrollView style={styles.memoCardWrapper} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.memoCard}>
                    <View style={styles.memoHeader}>
                        <Text style={styles.memoTitle}>{memoTitle}</Text>
                        <TouchableOpacity>
                            <Text style={styles.dotsText}>⋯</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.memoContent}>{memoContent}</Text>
                </View>
            </ScrollView>
        </View>
    );
}
