import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import gobackIcon from '../../assets/gobackicon.png';
import API_CONFIG from '../DB/api';

export default function MemoSetting() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [image, setImage] = useState(params.image || null);
    const [name, setName] = useState(params.name || '');
    const [qrValue, setQrValue] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [farmAddress, setFarmAddress] = useState('');
    const [farmId, setFarmId] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteCompleteModal, setShowDeleteCompleteModal] = useState(false);

    // 농장 주소와 farmId 가져오기 (최초 렌더링 시)
    useEffect(() => {
        const fetchFarmInfo = async () => {
            if (params.farmName && params.phone) {
                try {
                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
                    const data = await response.json();
                    if (response.ok && data.length > 0) {
                        const currentFarm = data.find(farm => farm.farm_name === params.farmName);
                        if (currentFarm) {
                            if (currentFarm.address) setFarmAddress(currentFarm.address);
                            if (currentFarm.farm_id) setFarmId(currentFarm.farm_id);
                        }
                    }
                } catch (e) {
                    // 무시
                }
            }
        };
        fetchFarmInfo();
    }, [params.farmName, params.phone]);

    // QR코드 가져오기
    useEffect(() => {
        const fetchQRCode = async () => {
            if (!params.detailId) {
                console.log('=== QR코드 가져오기 실패 ===');
                console.log('detailId가 없습니다:', params.detailId);
                return;
            }
            try {
                console.log('=== QR코드 가져오기 시작 ===');
                console.log('요청 URL:', `${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`);
                
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`);
                const data = await response.json();
                
                console.log('서버 응답:', data);
                
                if (response.ok && data.detail_qr_code) {
                    console.log('QR코드 가져오기 성공:', data.detail_qr_code);
                    setQrValue(data.detail_qr_code);
                    setShowQR(true);
                } else {
                    console.log('QR코드가 없거나 응답이 올바르지 않습니다:', data);
                }
            } catch (error) {
                console.error('=== QR코드 가져오기 실패 ===');
                console.error('에러 내용:', error);
            }
        };
        fetchQRCode();
    }, [params.detailId]);

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

    // 삭제 처리 함수
    const handleDelete = async () => {
        try {
            if (!params.detailId) {
                showWarningModal('삭제할 작물 정보가 없습니다.');
                return;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                setShowDeleteCompleteModal(true);
            } else {
                showWarningModal('삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            showWarningModal('삭제 중 오류가 발생했습니다.');
        }
    };

    // 삭제 확인 모달 닫기 및 삭제 실행
    const handleDeleteConfirm = () => {
        setShowDeleteConfirmModal(false);
        handleDelete();
    };

    // 삭제 완료 모달 닫기 및 목록으로 이동
    const handleDeleteComplete = () => {
        setShowDeleteCompleteModal(false);
        router.replace({
            pathname: '/Memo/memolist',
            params: {
                farmName: params.farmName,
                userData: params.userData,
                phone: params.phone,
                region: params.region,
                introduction: params.introduction,
                farmId: params.farmId,
                cropId: params.cropId
            }
        });
    };

    // QR코드 생성 함수
    const generateQRCode = () => {
        console.log('=== QR코드 생성 시작 ===');
        console.log('현재 작물 이름:', name);
        console.log('현재 detailId:', params.detailId);
        
        const qrValueToSet = name ? `${name}_${Date.now()}` : `${Date.now()}`;
        console.log('생성된 QR값:', qrValueToSet);
        console.log('타임스탬프:', Date.now());
        
        setQrValue(qrValueToSet);
        setShowQR(true);

        // QR코드 DB 업데이트
        if (params.detailId) {
            console.log('=== QR코드 DB 업데이트 시작 ===');
            console.log('업데이트 URL:', `${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`);
            console.log('업데이트할 QR값:', qrValueToSet);
            
            fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ detail_qr_code: qrValueToSet }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('QR코드 DB 업데이트 성공:', data);
            })
            .catch(error => {
                console.error('=== QR코드 DB 업데이트 실패 ===');
                console.error('에러 내용:', error);
            });
        } else {
            console.log('=== QR코드 DB 업데이트 실패 ===');
            console.log('detailId가 없어서 DB 업데이트를 할 수 없습니다.');
        }
    };

    // 수정 완료 처리 함수
    const handleUpdate = async () => {
        if (!params.detailId) {
            console.log('=== 수정 실패 ===');
            console.log('detailId가 없습니다:', params.detailId);
            showWarningModal('수정할 작물 정보가 없습니다.');
            return;
        }

        if (!name.trim()) {
            showWarningModal('작물 이름을 입력해주세요.');
            return;
        }

        try {
            console.log('=== 상세작물 수정 시작 ===');
            console.log('수정할 detailId:', params.detailId);
            console.log('현재 상태:', {
                name: name,
                image: image,
                qrValue: qrValue
            });

            const updateData = {
                name: name,
                detail_image_url: image,
                detail_qr_code: qrValue
            };
            console.log('전송할 데이터:', updateData);

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail/${params.detailId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            console.log('API 응답 상태:', response.status);
            const data = await response.json();
            console.log('API 응답 데이터:', data);

            if (response.ok) {
                console.log('=== 상세작물 수정 성공 ===');
                // 수정 성공 후 목록으로 이동
                router.replace({
                    pathname: '/Memo/memolist',
                    params: {
                        farmName: params.farmName,
                        userData: params.userData,
                        phone: params.phone,
                        region: params.region,
                        introduction: params.introduction,
                        farmId: params.farmId,
                        cropId: params.cropId,
                        refresh: true // 목록 새로고침을 위한 플래그 추가
                    }
                });
            } else {
                console.log('=== 상세작물 수정 실패 ===');
                console.log('실패 응답:', data);
                showWarningModal(data.error || '수정 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('=== 상세작물 수정 실패 ===');
            console.error('에러 내용:', error);
            showWarningModal('수정 중 오류가 발생했습니다.');
        }
    };

    // 모달 표시 함수
    const showWarningModal = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Image source={gobackIcon} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.title}>상세작물설정</Text>
                    <TouchableOpacity onPress={() => setShowDeleteConfirmModal(true)}>
                        <Image source={require('../../assets/deleteicon.png')} style={styles.deleteIcon} />
                    </TouchableOpacity>
                </View>

                {/* 사진 추가 */}
                <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
                    {image && image.startsWith('https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/') ? (
                        <Image 
                            source={{ uri: image }} 
                            style={styles.photo} 
                            resizeMode="cover"
                            onError={() => setImage(null)} 
                        />
                    ) : (
                        <>
                            <Image source={require('../../assets/galleryicon2.png')} style={styles.icon} />
                            <Text style={styles.photoText}>사진 추가</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* 이름 입력 */}
                <Text style={styles.label}>이름</Text>
                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="상세 작물 이름을 입력해주세요"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <Text style={styles.label}>QR코드</Text>
                {/* QR코드 생성 */}
                <View style={styles.qrSection}>
                    <View style={styles.qrBox}>
                        {showQR && qrValue ? (
                            <QRCode value={qrValue} size={100} />
                        ) : (
                            <TouchableOpacity
                                style={styles.qrGenButton}
                                onPress={generateQRCode}
                            >
                                <Text style={styles.qrGenText}>큐알코드 생성하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 수정 완료 버튼 */}
                <TouchableOpacity 
                    style={styles.locationButton}
                    onPress={handleUpdate}
                >
                    <Text style={styles.locationButtonText}>수정 완료</Text>
                </TouchableOpacity>

                {/* 삭제 확인 모달 */}
                <Modal
                    visible={showDeleteConfirmModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDeleteConfirmModal(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>상세 작물 삭제</Text>
                            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>이 상세 작물을 삭제하시겠습니까?</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setShowDeleteConfirmModal(false)}
                                    style={{ backgroundColor: '#E5E7EB', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                                >
                                    <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16 }}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDeleteConfirm}
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
                    visible={showDeleteCompleteModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowDeleteCompleteModal(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', minWidth: 240 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 18 }}>삭제 완료</Text>
                            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>상세 작물이 삭제되었습니다.</Text>
                            <TouchableOpacity
                                onPress={handleDeleteComplete}
                                style={{ backgroundColor: '#22CC6B', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff', padding: 16, flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between', marginTop: -15 },
    backIcon: { width: 24, height: 24, resizeMode: 'contain' },
    title: { fontWeight: 'bold', fontSize: 18, textAlign: 'center', flex: 1, marginRight: 0 },
    deleteIcon: { width: 22, height: 22, resizeMode: 'contain', marginRight: 4 },
    photoBox: {
        width: '100%',
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 3,
        borderColor: 'black',
    },
    photo: { width: '120%', height: '120%', borderRadius: 16 },
    icon: { width: 60, height: 60, marginBottom: 8 },
    photoText: { fontSize: 16, color: '#222', fontWeight: 'bold' },
    label: { fontWeight: 'bold', fontSize: 20, marginTop: 15, marginBottom: 4 },

    input: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 4,
        borderWidth: 3,
        borderColor: '#ABABAB',
        marginTop: 10
    },
    qrSection: {
        backgroundColor: '#bbb',
        borderRadius: 12,
        padding: 8,
        marginBottom: 16,
        marginTop: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    qrLabel: { fontWeight: 'bold', fontSize: 15, marginBottom: 8, color: '#222' },
    qrBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 140,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    qrGenButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrGenText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#22CC6B',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    locationButton: {
        backgroundColor: '#22CC6B',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    locationButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    modalSubText: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    deleteButton: {
        backgroundColor: '#FF4444',
    },
    deleteButtonText: {
        color: '#FFFFFF',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
