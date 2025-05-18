import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from '../Components/Css/Memo/cropdetailmemopagestyle';
import * as ImagePicker from 'expo-image-picker';
import API_CONFIG from '../DB/api';
import QRCode from 'react-native-qrcode-svg';

export default function CropDetailMemoPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [image, setImage] = useState(params.detail_image_url || params.image || null);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [location, setLocation] = useState(null);

    // 예시 데이터 (실제 데이터는 props나 API로 받아오세요)
    const cropName = params.name || '나의 소중한 감자밭 1호';
    const cropImage = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc';
    const memoTitle = '3월 11일 나의 첫 메모';
    const memoContent = '몇개들은 태풍맞아 감자들이 피해받았다\n기스가 심하게 생긴 감자들은 거르고\n상태 좋은 감자들은 계속 지켜봐야 겠다';

    useEffect(() => {
        const fetchDetail = async () => {
            if (!params.detailId) return;
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`);
                const data = await res.json();
                setQrCode(data.detail_qr_code || '');
                if (data.latitude && data.longitude) {
                    setLocation({
                        latitude: data.latitude,
                        longitude: data.longitude
                    });
                }
            } catch (e) {
                setQrCode('');
                setLocation(null);
            }
        };
        fetchDetail();
    }, [params.detailId]);

    // 이미지 변경 시 DB 업데이트 함수
    const updateDetailImage = async (newImageUrl) => {
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ detail_image_url: newImageUrl }),
            });
        } catch (e) {
            alert('이미지 변경 DB 반영 실패');
        }
    };

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

            // detailId 체크 및 PUT 요청
            if (!params.detailId) {
                alert('상세작물 ID가 없습니다. (detailId)');
                console.log('params.detailId 없음:', params);
                return;
            }
            const putUrl = `${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`;
            console.log('PUT 요청 URL:', putUrl);
            try {
                const res = await fetch(putUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ detail_image_url: s3Url }),
                });
                const data = await res.json();
                console.log('이미지 변경 응답:', data);
                if (!res.ok) {
                    alert('DB 반영 실패: ' + (data?.error || ''));
                }
            } catch (e) {
                alert('이미지 변경 DB 반영 실패');
                console.log('이미지 변경 에러:', e);
            }
        }
    };

    // QR코드에서 숫자만 추출하는 함수
    const onlyNumber = (qr) => (qr ? qr.replace(/[^0-9]/g, '') : '');

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
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => {
                        if (!location) {
                            alert('작물 위치 정보가 없습니다.');
                            return;
                        }
                        router.push({
                            pathname: '/Map/Map',
                            params: {
                                highlightDetailId: params.detailId,
                                latitude: location.latitude,
                                longitude: location.longitude,
                                // 사용자 데이터
                                userData: params.userData,
                                phone: params.phone,
                                name: params.name,
                                region: params.region,
                                introduction: params.introduction,
                                // 작물 데이터
                                farmId: params.farmId,
                                cropId: params.cropId,
                                detailId: params.detailId,
                                detailName: params.name,
                                detailImage: params.detail_image_url,
                                detailQrCode: params.detail_qr_code
                            }
                        });
                    }}
                >
                    <Image source={require('../../assets/planticon.png')} style={styles.actionIcon} />
                    <Text style={styles.actionText}>작물 위치</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => {
                    console.log('QR코드 값:', params.detail_qr_code);
                    setQrModalVisible(true);
                }}>
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

            {/* QR코드 모달 */}
            <Modal
                visible={qrModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setQrModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>QR 코드</Text>
                        {qrCode ? (
                            <QRCode value={qrCode} size={120} />
                        ) : (
                            <Text style={{ fontSize: 16, marginBottom: 20 }}>QR코드 정보 없음</Text>
                        )}
                        <TouchableOpacity onPress={() => setQrModalVisible(false)} style={{ backgroundColor: '#22C55E', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24, marginTop: 20 }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
