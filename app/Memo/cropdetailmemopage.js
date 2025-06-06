import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Keyboard, TouchableWithoutFeedback, Alert, Platform } from 'react-native';
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
    const [memos, setMemos] = useState([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteSuccessModalVisible, setDeleteSuccessModalVisible] = useState(false);


    // 예시 데이터 (실제 데이터는 props나 API로 받아오세요)
    const cropName = params.name || '나의 소중한 감자밭 1호';
    const cropImage = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc';

    // ScrollView에 ref 추가
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (params.memo && params.memo !== '[]') {
            try {
                setMemos(JSON.parse(params.memo));
            } catch (e) {
                setMemos([]);
            }
        } else if (params.detailId) {
            fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.memo) {
                        setMemos(typeof data.memo === 'string' ? JSON.parse(data.memo) : data.memo);
                    } else {
                        setMemos([]);
                    }
                })
                .catch(() => setMemos([]));
        } else {
            setMemos([]);
        }
    }, [params.memo, params.detailId]);

    useEffect(() => {
        const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
            saveMemosToDB();
        });
        return () => {
            keyboardHideListener.remove();
        };
    }, [memos]);

    useEffect(() => {
        if (params.detail_qr_code) {
            setQrCode(params.detail_qr_code);
        } else if (params.detailId) {
            fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`)
                .then(res => res.json())
                .then(data => {
                    setQrCode(data.detail_qr_code || '');
                })
                .catch(() => setQrCode(''));
        } else {
            setQrCode('');
        }
    }, [params.detail_qr_code, params.detailId]);

    useEffect(() => {
        if (params.detailId) {
            fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.latitude && data.longitude) {
                        setLocation({
                            latitude: Number(data.latitude),
                            longitude: Number(data.longitude)
                        });
                    } else {
                        setLocation(null);
                    }
                })
                .catch(() => setLocation(null));
        }
    }, [params.detailId]);

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

    const handleUpdateMemo = async (idx, key, value) => {
        const updatedMemos = memos.map((memo, i) =>
            i === idx ? { ...memo, [key]: value } : memo
        );
        setMemos(updatedMemos);

        // 디버깅 로그 추가
        console.log('메모 저장 요청:', {
            detailId: params.detailId,
            memo: updatedMemos
        });

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memo: updatedMemos }),
            });
            const data = await res.json();
            console.log('메모 저장 응답:', data);
        } catch (e) {
            console.error('메모 저장 실패:', e);
            Alert.alert('오류', '메모 저장에 실패했습니다.');
        }
    };

    // handleAddMemoCard 함수 수정
    const handleAddMemoCard = async () => {
        // 새로운 메모를 배열의 맨 앞에 추가
        const newMemos = [{ title: '', content: '' }, ...memos];
        setMemos(newMemos);

        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memo: newMemos }),
            });
            // 메모 추가 후 스크롤을 맨 위로 올림
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } catch (e) {
            console.error('메모 추가 실패:', e);
            Alert.alert('오류', '메모 추가에 실패했습니다.');
        }
    };

    // 메모 카드 삭제 함수
    const handleDeleteMemoCard = async (idx) => {
        const newMemos = memos.filter((_, i) => i !== idx);
        setMemos(newMemos);

        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memo: newMemos }),
            });
        } catch (e) {
            console.error('메모 삭제 실패:', e);
            Alert.alert('오류', '메모 삭제에 실패했습니다.');
        }
    };

    // 상세 작물 삭제 함수 (cropdetail_id 또는 detailId 사용)
    const handleDeleteCropDetail = async () => {
        const cropdetail_id = params.cropdetail_id || params.detailId;
        if (!cropdetail_id) {
            Alert.alert('오류', '상세작물 ID가 없습니다.');
            return;
        }
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${cropdetail_id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                setDeleteSuccessModalVisible(true);
            } else {
                Alert.alert('삭제 실패', data.error || '삭제에 실패했습니다.');
            }
        } catch (e) {
            Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
        }
    };

    const isValidS3Image = image && typeof image === 'string' && image.startsWith('https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/');

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('전달할 params:', params);
                            const navigationParams = {
                                detailId: params.detailId,
                                name: params.name,
                                image: params.image,
                                cropId: params.cropId,
                                phone: params.phone,
                                farmId: params.farmId,
                                farmName: params.farmName,
                                userData: params.userData,
                                region: params.region,
                                introduction: params.introduction,
                            };
                            console.log('전달할 navigationParams:', navigationParams);
                            router.replace({
                                pathname: '/Memo/memolist',
                                params: navigationParams
                            });
                        }}
                        style={styles.headerIconBtn}
                    >
                        <Image source={require('../../assets/gobackicon.png')} style={styles.headerIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{cropName}</Text>
                    <TouchableOpacity
                        style={styles.headerIconBtn}
                        onPress={() => setDeleteModalVisible(true)}
                    >
                        <Image source={require('../../assets/deleteicon.png')} style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>

                {/* 사진 추가 */}
                <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
                    {isValidS3Image ? (
                        <Image source={{ uri: image }} style={styles.photo} resizeMode="cover" />
                    ) : (
                        <>
                            <Image source={require('../../assets/galleryicon2.png')} style={styles.icon} resizeMode="cover" />
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
                            const navigationParams = {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                detailId: params.detailId,
                                name: params.name,
                                userData: params.userData,
                                phone: params.phone,
                                region: params.region,
                                introduction: params.introduction,
                                shouldHighlight: true,
                            };
                            console.log('작물 위치 이동 params:', navigationParams);
                            try {
                                router.push({
                                    pathname: '/Map/Map',
                                    params: navigationParams
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    >
                        <Image source={require('../../assets/planticon.png')} style={styles.actionIcon} />
                        <Text style={styles.actionText}>작물 위치</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => {
                        console.log('QR코드 값:', qrCode); // params.detail_qr_code 대신 qrCode 사용
                        setQrModalVisible(true);
                    }}>
                        <Image source={require('../../assets/qricon.png')} style={styles.actionIcon} />
                        <Text style={styles.actionText}>QR코드</Text>
                    </TouchableOpacity>
                </View>

                {/* 버튼 아래 구분선 */}
                <View style={styles.divider} />

                {/* 메모 카드만 스크롤 */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.memoCardWrapper}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
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
                </ScrollView>

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
                                <>
                                    <QRCode value={qrCode} size={120} style={{ marginTop: 30 }} />
                                    <View style={{
                                        padding: 8,
                                        borderRadius: 8,
                                        marginTop: 12,
                                        width: '100%',
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            color: '#333',
                                            textAlign: 'center',
                                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                                            fontWeight: 'bold',
                                        }}>
                                            {qrCode}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={{ fontSize: 16, marginBottom: 20 }}>QR코드 정보 없음</Text>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('현재 qrCode 값:', qrCode); // 여기로 콘솔 로그 이동
                                    setQrModalVisible(false);
                                }}
                                style={{
                                    backgroundColor: '#22C55E',
                                    borderRadius: 8,
                                    paddingVertical: 8,
                                    paddingHorizontal: 24,
                                    marginTop: 20
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* 삭제 확인 모달 */}
                <Modal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>상세 작물 삭제</Text>
                            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>이 상세 작물을 삭제하시겠습니까?</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setDeleteModalVisible(false)}
                                    style={{ backgroundColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                                >
                                    <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16 }}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteModalVisible(false);
                                        handleDeleteCropDetail();
                                    }}
                                    style={{ backgroundColor: '#EF4444', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* 삭제 완료 모달 */}
                <Modal
                    visible={deleteSuccessModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteSuccessModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>삭제 완료</Text>
                            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>상세 작물이 삭제되었습니다.</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setDeleteSuccessModalVisible(false);
                                    router.back();
                                }}
                                style={{ backgroundColor: '#22CC6B', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}
