import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
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
              <Image source={require('../../assets/addphotoicon.png')} style={styles.icon} />
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
            placeholder=""
            placeholderTextColor="#aaa"
          />
        </View>

        {/* 위치 선택 버튼 */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={async () => {
            console.log('=== 작물 위치 표시하기 버튼 클릭 ===');
            try {
              // farm 테이블에서 농장 정보 가져오기
              const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
              const data = await response.json();
              
              if (response.ok && data.length > 0) {
                // 현재 농장 찾기
                const currentFarm = data.find(farm => farm.farm_name === params.farmName);
                
                if (currentFarm && currentFarm.address) {
                  console.log('농장 주소:', currentFarm.address);
                  
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
                    farmAddress: currentFarm.address  // DB에서 가져온 정확한 주소 사용
                  };
                  
                  console.log('Map.js로 전달할 전체 파라미터:', mapParams);

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
              Alert.alert('오류', '농장 정보를 가져오는데 실패했습니다.');
            }
          }}
        >
          <Text style={styles.locationButtonText}>작물 위치 표시하기</Text>
        </TouchableOpacity>

        {/* QR코드 생성 */}
        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>큐알코드 생성하기</Text>
          <View style={styles.qrBox}>
            {showQR && qrValue ? (
              <QRCode value={qrValue} size={100} />
            ) : (
              <TouchableOpacity
                style={styles.qrGenButton}
                onPress={() => {
                  setQrValue(name ? `${name}_${Date.now()}` : `${Date.now()}`);
                  setShowQR(true);
                }}
              >
                <Text style={styles.qrGenText}>큐알코드 생성하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 확인 버튼 */}
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>확인</Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: 160,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  photo: { width: '100%', height: '100%', borderRadius: 16 },
  icon: { width: 60, height: 60, marginBottom: 8 },
  photoText: { fontSize: 16, color: '#444' },
  label: { fontWeight: 'bold', fontSize: 15, marginTop: 8, marginBottom: 4 },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  input: {
    fontSize: 15,
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: '#222',
    backgroundColor: 'transparent',
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
    fontSize: 16,
  },
});
