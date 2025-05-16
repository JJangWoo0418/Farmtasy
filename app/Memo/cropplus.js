import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // 캘린더용
import { useRouter, useLocalSearchParams } from 'expo-router';
import API_CONFIG from '../DB/api';

export default function CropPlus() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editIndex = params.editIndex !== undefined ? Number(params.editIndex) : null;

  // 입력값 상태
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [plantDate, setPlantDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(params.crop || '');
  const [selectedCropEmoji, setSelectedCropEmoji] = useState(params.cropEmoji || '');
  const [farmId, setFarmId] = useState(null);

  // 캘린더 상태
  const [isPlantDatePickerVisible, setPlantDatePickerVisible] = useState(false);
  const [isHarvestDatePickerVisible, setHarvestDatePickerVisible] = useState(false);

  // cropedit에서 돌아올 때 params로 값이 오면 반영
  useEffect(() => {
    if (params?.crop) setSelectedCrop(params.crop);
    if (params?.cropEmoji) setSelectedCropEmoji(params.cropEmoji);
  }, [params?.crop, params?.cropEmoji]);

  // farm_id 가져오기
  useEffect(() => {
    if (!params.farmId) {
      console.error('farm_id가 전달되지 않았습니다.');
      Alert.alert('오류', '농장 정보를 찾을 수 없습니다.');
      router.back();
      return;
    }

    setFarmId(params.farmId);
    console.log('농장 ID 설정됨:', params.farmId);
  }, [params.farmId]);

  // 이미지 선택 및 S3 업로드
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);

        // UUID 형식의 파일명 생성
        const fileName = `${Date.now().toString(16).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}-${Math.random().toString(16).substring(2, 14).toUpperCase()}.jpg`;

        // S3 presigned URL 요청
        const presignResponse = await fetch(`${API_CONFIG.BASE_URL}/api/s3/presign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: fileName,
            fileType: 'image/jpeg'
          })
        });

        if (!presignResponse.ok) {
          throw new Error('S3 presigned URL을 가져오는데 실패했습니다.');
        }

        const { url } = await presignResponse.json();

        // 이미지를 S3에 업로드
        const imageResponse = await fetch(selectedImage);
        const blob = await imageResponse.blob();

        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('이미지 업로드에 실패했습니다.');
        }

        // S3 URL 생성
        const s3Url = `https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/${fileName}`;
        setImage(s3Url);
      }
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷 함수
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (params?.deleteCrop && params?.editIndex !== undefined) {
      setCrops(prev => prev.filter((_, idx) => idx !== Number(params.editIndex)));
    }
    // ...기존 추가/수정 처리...
  }, [params?.deleteCrop, params?.editIndex]);

  // 확인 버튼 클릭 시
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = async () => {
    if (!farmId) {
      setErrorMessage('농장 정보를 찾을 수 없습니다.');
      setErrorModalVisible(true);
      return;
    }
    if (!name) {
      setErrorMessage('이름을 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (!selectedCrop) {
      setErrorMessage('작물을 선택해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (!area) {
      setErrorMessage('재배 면적을 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (parseFloat(area) >= 100000) {
      setErrorMessage('재배 면적은 99,999 이하로 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (!plantDate) {
      setErrorMessage('정식 시기를 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (!harvestDate) {
      setErrorMessage('수확 시기를 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (!amount) {
      setErrorMessage('수확량을 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }
    if (parseFloat(amount) >= 10000000) {
      setErrorMessage('수확량은 9,999,999Kg 이하로 입력해주세요.');
      setErrorModalVisible(true);
      return;
    }

    try {
      const cropData = {
        farm_id: farmId,
        crop_name: name,
        crop_type: selectedCrop,
        crop_image_url: image,
        crop_area_m2: parseFloat(area),
        crop_planting_date: formatDate(new Date(plantDate)),
        crop_harvest_date: formatDate(new Date(harvestDate)),
        crop_yield_kg: parseFloat(amount)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/crop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData)
      });

      if (!response.ok) {
        throw new Error('작물 정보 저장에 실패했습니다.');
      }

      Alert.alert('성공', '작물 정보가 저장되었습니다.');
      router.replace({
        pathname: '/Memo/farmedit',
        params: {
          phone: params.phone,
          farmName: params.farmName,
          farmId: farmId,
          newCropName: name,
          newCropImage: image,
        }
      });
    } catch (error) {
      setErrorMessage('작물 정보 저장 중 오류가 발생했습니다.');
      setErrorModalVisible(true);
    }
  };

  const [isCropModalVisible, setIsCropModalVisible] = useState(false);

  // 인기작물 리스트 (이모지+이름)
  const popularCrops = [
    { emoji: '🌶️', name: '고추' }, { emoji: '🌾', name: '벼' }, { emoji: '🥔', name: '감자' },
    { emoji: '🍠', name: '고구마' }, { emoji: '🍎', name: '사과' }, { emoji: '🍓', name: '딸기' },
    { emoji: '🧄', name: '마늘' }, { emoji: '🥬', name: '상추' }, { emoji: '🍄', name: '표고버섯' },
    { emoji: '🍅', name: '토마토' }, { emoji: '🍇', name: '포도' }, { emoji: '🫘', name: '콩' },
    { emoji: '🍊', name: '감귤' }, { emoji: '🍑', name: '복숭아' }, { emoji: '🧅', name: '양파' },
    { emoji: '🍂', name: '감' }, { emoji: '🌿', name: '파' }, { emoji: '🌱', name: '들깨' },
    { emoji: '🌽', name: '옥수수' }, { emoji: '🌳', name: '낙엽교목류' }, { emoji: '🥒', name: '오이' },
    { emoji: '🌿', name: '두릅' }, { emoji: '🥜', name: '참깨' }, { emoji: '🟢', name: '매실' },
    { emoji: '🍃', name: '시금치' }, { emoji: '🟣', name: '자두' }, { emoji: '🎃', name: '호박' },
    { emoji: '🥬', name: '양배추' }, { emoji: '🫐', name: '블루베리' }, { emoji: '🥬', name: '배추' },

  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>작물 종류 추가</Text>
          <TouchableOpacity
            onPress={() => {
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
                        pathname: '/Memo/farmedit',
                        params: { deleteCrop: true, editIndex: editIndex }
                      });
                    }
                  }
                ]
              );
            }}
          >
            <Image source={require('../../assets/deleteicon.png')} style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>

        {/* 이미지 추가 */}
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <>
              <Image source={require('../../assets/galleryicon2.png')} style={styles.icon} />
              <Text style={styles.photoText}>사진 추가</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 이름 */}
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="작물 이름을 입력하세요"
          placeholderTextColor="#888888"
        />

        {/* 작물 선택 버튼 */}
        <Text style={styles.label}>작물</Text>
        <TouchableOpacity
          onPress={() => setIsCropModalVisible(true)}
          activeOpacity={0.7}
        >
          {selectedCrop ? (
            <View style={styles.selectedCropBox}>
              <View style={styles.cropEmojiCircle}>
                <Text style={styles.cropEmoji}>{selectedCropEmoji}</Text>
              </View>
              <Text style={styles.selectedCropText}>{selectedCrop}</Text>
            </View>
          ) : (
            <View style={styles.cropSelectButton}>
              <Text style={styles.cropSelectButtonText}>작물 선택하기</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 재배 면적 */}
        <Text style={styles.label}>재배 면적</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={area}
            onChangeText={setArea}
            placeholder="예: 10000"
            keyboardType="numeric"
            placeholderTextColor="#888888"
          />
          <Text style={styles.unit}>평</Text>
        </View>
        <Text style={styles.subText}>최대 99,999평까지 입력이 가능해요</Text>

        {/* 정식 시기 */}
        <Text style={styles.label}>정식 시기</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={plantDate}
            placeholder="YYYY.MM.DD"
            editable={false}
            placeholderTextColor="#888888"
          />
          <TouchableOpacity onPress={() => setPlantDatePickerVisible(true)}>
            <Image source={require('../../assets/calendaricon.png')} style={styles.calendarIcon} />
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={isPlantDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setPlantDate(formatDate(date));
            setPlantDatePickerVisible(false);
          }}
          onCancel={() => setPlantDatePickerVisible(false)}
        />

        {/* 수확 시기 */}
        <Text style={styles.label}>수확 시기</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={harvestDate}
            placeholder="YYYY.MM.DD"
            editable={false}
            placeholderTextColor="#888888"
          />
          <TouchableOpacity onPress={() => setHarvestDatePickerVisible(true)}>
            <Image source={require('../../assets/calendaricon.png')} style={styles.calendarIcon} />
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={isHarvestDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setHarvestDate(formatDate(date));
            setHarvestDatePickerVisible(false);
          }}
          onCancel={() => setHarvestDatePickerVisible(false)}
        />

        {/* 수확량 */}
        <Text style={styles.label}>수확량</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="예: 10,000"
            keyboardType="numeric"
            placeholderTextColor="#888888"
          />
          <Text style={styles.unit}>Kg</Text>
        </View>
        <Text style={styles.subText}>최대 9,999,999Kg까지 입력이 가능해요</Text>

        {/* 확인 버튼 */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>확인</Text>
        </TouchableOpacity>

        {/* 작물 선택 모달 */}
        <Modal
          visible={isCropModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsCropModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cropModalContent}>
              <Text style={styles.cropModalTitle}>어떤 작물을 추가하시겠어요?</Text>
              <TouchableOpacity
                style={styles.directAddButton}
                onPress={() => {
                  setIsCropModalVisible(false);
                }}
              >
                <Text style={styles.directAddButtonText}>직접 추가하기</Text>
              </TouchableOpacity>
              <Text style={styles.popularTitle}>인기작물 TOP 30</Text>
              <FlatList
                data={popularCrops}
                keyExtractor={item => item.name}
                numColumns={3}
                contentContainerStyle={{ alignItems: 'center' }}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cropGridItem}
                    onPress={() => {
                      setSelectedCrop(item.name);
                      setSelectedCropEmoji(item.emoji);
                      setIsCropModalVisible(false);
                    }}
                  >
                    <View style={styles.cropGridCircle}>
                      <Text style={styles.cropGridEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={styles.cropGridName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.cropModalCloseButton}
                onPress={() => setIsCropModalVisible(false)}
              >
                <Text style={styles.cropModalCloseText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 입력 오류 모달 */}
        <Modal
          visible={errorModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalContent}>
              <Text style={styles.errorModalText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.errorModalButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: -15 },
  headerTitle: { fontWeight: 'bold', fontSize: 18, textAlign: 'center', flex: 1 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  deleteIcon: { width: 25, height: 25, resizeMode: 'contain', marginRight: 4 },
  imageBox: {
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
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#aaa', fontSize: 16 },
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
  subText: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  calendarIcon: { width: 28, height: 28, marginLeft: 8, resizeMode: 'contain', marginTop: 3 },
  unit: { fontSize: 15, color: '#888', marginLeft: 8 },
  confirmButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  confirmButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  cropSelectButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  cropSelectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedCropBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  cropEmojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cropEmoji: {
    fontSize: 22,
  },
  selectedCropText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  icon: { width: 60, height: 60, marginBottom: 8 },
  photoText: { fontSize: 16, color: '#222', fontWeight: 'bold' },
  cropModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 80,
    elevation: 10,
  },
  cropModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  directAddButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  directAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  popularTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  cropGridItem: {
    alignItems: 'center',
    margin: 10,
    width: 80,
  },
  cropGridCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropGridEmoji: {
    fontSize: 32,
  },
  cropGridName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  cropModalCloseButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cropModalCloseText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: 260,
    alignSelf: 'center',
    elevation: 10,
  },
  errorModalText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  errorModalButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  errorModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
