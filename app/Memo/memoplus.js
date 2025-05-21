import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import gobackIcon from '../../assets/gobackicon.png';
import API_CONFIG from '../DB/api';

export default function MemoPlus() {
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

  // 삭제
  const handleDelete = () => {
    Alert.alert(
      "정말 삭제하시겠습니까?",
      "이 작물 정보를 삭제하면 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            router.replace({
              pathname: '/Memo/memolist',
              params: { deleteMemo: true, editIndex: params.editIndex }
            });
          }
        }
      ]
    );
  };

  // 확인(추가/수정)
  const handleConfirm = () => {
    if (!name) {
      Alert.alert('이름을 입력하세요!');
      return;
    }
    router.replace({
      pathname: '/Memo/memolist',
      params: {
        newMemoName: name,
        newMemoImage: image,
        newMemoQR: qrValue,
        editIndex: params.editIndex
      }
    });
  };

  // 모달 표시 함수 제거
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
          <Text style={styles.title}>상세작물추가</Text>
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
                onPress={() => {
                  const qrValueToSet = name ? `${name}_${Date.now()}` : `${Date.now()}`;
                  console.log('=== QR코드 생성 ===');
                  console.log('생성된 QR값:', qrValueToSet);
                  console.log('작물 이름:', name);
                  console.log('타임스탬프:', Date.now());
                  setQrValue(qrValueToSet);
                  setShowQR(true);
                }}
              >
                <Text style={styles.qrGenText}>큐알코드 생성하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 위치 선택 버튼 */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            if (!name.trim()) {
              Alert.alert('오류', '작물의 이름을 입력해주세요.');
              return;
            }
            if (!qrValue) {
              Alert.alert('오류', 'QR코드를 먼저 생성해주세요.');
              return;
            }
            if (!farmId) {
              Alert.alert('오류', '농장 정보를 찾을 수 없습니다.');
              return;
            }
            // cropdetail 저장 없이, 입력값만 Map 페이지로 전달
            console.log('crop_id:', params.cropId);
            router.push({
              pathname: '/Map/Map',
              params: {
                name,
                image,
                qrValue,
                cropId: params.cropId,
                editIndex: params.editIndex,
                farmName: params.farmName,
                userData: params.userData,
                phone: params.phone,
                region: params.region,
                introduction: params.introduction,
                isAddingCropMode: true,
                farmAddress: farmAddress,
                farmId: farmId,
              }
            });
          }}
        >
          <Text style={styles.locationButtonText}>작물 위치 표시하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between', marginTop: -15 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: { fontWeight: 'bold', fontSize: 18, textAlign: 'center', flex: 1 , marginRight: 20},
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
  photo: { width: '100%', height: '100%', borderRadius: 16 },
  icon: { width: 60, height: 60, marginBottom: 8 },
  photoText: {fontSize: 16, color: '#222', fontWeight: 'bold' },
  label: {fontWeight: 'bold', fontSize: 20, marginTop: 15, marginBottom: 4 },
  
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
  modalButton: {
    backgroundColor: '#22CC6B',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
