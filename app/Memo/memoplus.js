import React, { useState } from 'react';
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

  // 이미지 선택
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
          <Text style={styles.title}>상세작물추가</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Image source={require('../../assets/deleteicon.png')} style={styles.deleteIcon} />
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
          onPress={async () => {
            console.log('=== 작물 위치 표시하기 버튼 클릭 ===');
            
            // 이름과 QR코드 입력 확인
            if (!name.trim()) {
              showWarningModal('작물의 이름을 입력해주세요.');
              return;
            }
            
            if (!qrValue) {
              showWarningModal('QR코드를 먼저 생성해주세요.');
              return;
            }

            try {
              // farm 테이블에서 농장 정보 가져오기
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
              const data = await response.json();
              
              if (response.ok && data.length > 0) {
                // 현재 농장 찾기
                const currentFarm = data.find(farm => farm.farm_name === params.farmName);
                
                if (currentFarm && currentFarm.address) {
                  console.log('농장 주소:', currentFarm.address);
                  console.log('농장 ID:', currentFarm.farm_id);
                  
                  // crop 테이블에서 작물 ID 가져오기
                  const cropUrl = `${API_CONFIG.BASE_URL}/api/crop?farm_id=${currentFarm.farm_id}`;
                  console.log('작물 ID 요청 URL:', cropUrl);
                  
                  const cropResponse = await fetch(cropUrl);
                  const cropData = await cropResponse.json();
                  
                  console.log('작물 정보 응답:', cropData);
                  
                  if (!cropResponse.ok) {
                    console.error('작물 정보 조회 실패:', cropData);
                    throw new Error(cropData.error || '작물 정보를 가져오는데 실패했습니다.');
                  }

                  if (!cropData || cropData.length === 0) {
                    console.error('작물 정보가 없음:', cropData);
                    throw new Error('작물 정보가 없습니다. 먼저 작물을 등록해주세요.');
                  }

                  // 가장 최근에 추가된 작물의 ID 사용
                  const latestCrop = cropData[0];
                  console.log('사용할 작물 ID:', latestCrop.crop_id);

                  // cropdetail 테이블에 저장할 데이터
                  const cropDetailData = {
                    crop_id: latestCrop.crop_id,
                    detail_name: name,
                    detail_qr_code: qrValue,
                    detail_image_url: image,
                    latitude: currentFarm.latitude,  // 농장의 위도
                    longitude: currentFarm.longitude,  // 농장의 경도
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };

                  console.log('저장할 작물 상세 정보:', cropDetailData);

                  // cropdetail 테이블에 데이터 저장
                  const saveResponse = await fetch(`${API_CONFIG.BASE_URL}/api/cropdetail`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cropDetailData)
                  });

                  const saveResult = await saveResponse.json();
                  console.log('저장 응답:', saveResult);

                  if (!saveResponse.ok) {
                    throw new Error(saveResult.error || '작물 상세 정보 저장에 실패했습니다.');
                  }

                  console.log('작물 상세 정보 저장 성공:', cropDetailData);
                  
                  // Map.js로 이동하여 위치 표시
                  const mapParams = {
                    cropName: name,
                    cropImage: image,
                    cropQR: qrValue,
                    editIndex: params.editIndex,
                    farmName: params.farmName,
                    userData: params.userData,
                    phone: params.phone,
                    region: params.region,
                    introduction: params.introduction,
                    farmAddress: currentFarm.address,
                    latitude: currentFarm.latitude,
                    longitude: currentFarm.longitude,
                    showMarker: true,  // 마커 표시 여부
                    markerType: 'crop',  // 마커 타입
                    markerName: name,  // 마커에 표시할 이름
                    markerImage: image,  // 마커에 표시할 이미지
                    markerEmoji: '☘️',  // 마커에 표시할 이모지
                    markerTitle: name,  // 마커 타이틀
                    markerDescription: '작물 위치',  // 마커 설명
                    markerColor: '#22CC6B'  // 마커 색상
                  };

                  console.log('Map.js로 전달할 전체 파라미터:', mapParams);

                  // Map.js로 이동
                  router.push({
                    pathname: '/Map/Map',
                    params: mapParams
                  });
                } else {
                  Alert.alert('오류', '농장 주소를 찾을 수 없습니다.');
                }
              } else {
                Alert.alert('오류', '농장 정보를 가져오는데 실패했습니다.');
              }
            } catch (error) {
              console.error('농장 정보 요청 중 오류:', error);
              showWarningModal('농장 정보를 가져오는데 실패했습니다.');
            }
          }}
        >
          <Text style={styles.locationButtonText}>작물 위치 표시하기</Text>
        </TouchableOpacity>

        {/* 경고 모달 */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>확인</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: { fontWeight: 'bold', fontSize: 18, textAlign: 'center', flex: 1 },
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
