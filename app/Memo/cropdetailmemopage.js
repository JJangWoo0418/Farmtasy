import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
    const [newMemo, setNewMemo] = useState('');
    const [memoContent, setMemoContent] = useState('');
    const [memoTitle, setMemoTitle] = useState('');
    const [memos, setMemos] = useState([
        { title: '', content: '' }
    ]);

    // 예시 데이터 (실제 데이터는 props나 API로 받아오세요)
    const cropName = params.name || '나의 소중한 감자밭 1호';
    const cropImage = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc';

    useEffect(() => {
        const fetchDetail = async () => {
            if (!params.detailId) return;
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`);
                const data = await res.json();
                if (data.memo) {
                    setMemos(Array.isArray(data.memo)
                        ? data.memo.map(memo => ({
                            ...memo,
                            title: memo.title ? memo.title.trimEnd() : '',
                            content: memo.content ? memo.content.trimEnd() : '',
                        }))
                        : [{ title: '', content: (data.memo || '').trimEnd() }]
                    );
                }
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

    useEffect(() => {
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
            saveMemosToDB();
        });
        return () => {
            keyboardHideListener.remove();
        };
    }, [memos]);

    // 이미지 변경 시 DB 업데이트 함수
    const updateDetailImage = async (newImageUrl) => {
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ detail_image_url: newImageUrl }),
            });
            setImage(newImageUrl); // DB 반영 후 setImage
            // params.detail_image_url 동기화 필요시 추가
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

    const handleSaveMemo = () => {
        if (!newMemo.trim()) return;
        setMemoContent(newMemo);
        setNewMemo('');
        // (옵션) 서버 저장 필요시 이곳에 API 호출 추가
    };

    // 메모 DB 저장 함수
    const saveMemosToDB = async (memosToSave = memos) => {
        if (!params.detailId) return;
        try {
            // 각 메모의 title, content 마지막 글자가 공백이 아니면 공백 추가
            const memosWithSpace = memosToSave.map(memo => ({
                ...memo,
                title: memo.title && !memo.title.endsWith(' ') ? memo.title + ' ' : memo.title,
                content: memo.content && !memo.content.endsWith(' ') ? memo.content + ' ' : memo.content,
            }));
            await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memo: memosWithSpace }),
            });
        } catch (e) {
            // 에러 처리
        }
    };

    // 메모 추가 버튼 클릭 시 저장도 함께 수행
    const handleAddMemoCard = () => {
        setMemos(prev => {
            const next = [...prev, { title: '', content: '' }];
            setTimeout(saveMemosToDB, 0); // 비동기 반영 후 저장
            return next;
        });
    };

    // 메모 수정 시 저장
    const handleUpdateMemo = (idx, key, value) => {
        setMemos(prev => {
            const next = prev.map((memo, i) => i === idx ? { ...memo, [key]: value } : memo);
            setTimeout(saveMemosToDB, 0);
            return next;
        });
    };

    // 메모 카드 삭제 함수
    const handleDeleteMemoCard = (idx) => {
        setMemos(prev => {
            const next = prev.filter((_, i) => i !== idx);
            saveMemosToDB(next); // 삭제된 배열을 바로 저장
            return next;
        });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
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
                        onPress={async () => {
                            if (!location || !params.detailId) {
                                alert('작물 위치 정보가 없습니다.');
                                return;
                            }
                            router.push({
                                pathname: '/Map/Map',
                                params: {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    detailId: params.detailId,
                                    userData: params.userData,
                                    phone: params.phone,
                                    name: params.name,
                                    region: params.region,
                                    introduction: params.introduction,
                                }
                            });
                            // 이미지 변경(setImage)은 이 버튼에서는 제거
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

                {/* 여러 개의 메모 카드 */}
                <View style={styles.memoCardWrapper}>
                    {memos.map((memo, idx) => (
                        <View key={idx} style={styles.memoCard}>
                            <View style={styles.memoHeader}>
                                <TextInput
                                    style={styles.memoTitle}
                                    value={memo.title}
                                    onChangeText={text => handleUpdateMemo(idx, 'title', text)}
                                    placeholder="제목을 입력하세요"
                                    placeholderTextColor="#aaa"
                                />
                                <TouchableOpacity onPress={() => handleDeleteMemoCard(idx)}>
                                    <Text style={styles.dotsText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.memoContent}
                                value={memo.content}
                                onChangeText={text => handleUpdateMemo(idx, 'content', text)}
                                placeholder="메모를 입력하세요"
                                placeholderTextColor="#aaa"
                                multiline
                            />
                        </View>
                    ))}
                </View>
                {/* 일반 버튼 */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#22CC6B',
                        borderRadius: 8,
                        padding: 16,
                        alignItems: 'center',
                        width: '100%',
                        alignSelf: 'center',
                        marginHorizontal: 0,
                        marginTop: 16,
                        marginBottom: 24,
                        elevation: 6,
                    }}
                    onPress={handleAddMemoCard}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>메모 추가</Text>
                </TouchableOpacity>

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
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}
