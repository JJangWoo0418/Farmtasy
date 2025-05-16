// farmedit.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, TextInput, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import gobackIcon from '../../assets/gobackicon.png';
import API_CONFIG from '../DB/api';

export default function FarmEdit() {
  const { farmName } = useLocalSearchParams();
  const router = useRouter();
  const params = useLocalSearchParams();

  // 작물 카드 리스트 상태
  const [crops, setCrops] = useState([]);

  // cropplus에서 돌아올 때 params로 값이 오면 추가
  useEffect(() => {
    if (params?.newCropName && params?.newCropImage) {
      if (params?.editIndex !== undefined) {
        // 수정
        setCrops(prev => prev.map((crop, idx) =>
          idx === Number(params.editIndex)
            ? { ...crop, name: params.newCropName, image: params.newCropImage }
            : crop
        ));
      } else {
        // 추가
        setCrops(prev => [
          ...prev,
          {
            name: params.newCropName,
            image: params.newCropImage,
          }
        ]);
      }
    }
  }, [params?.newCropName, params?.newCropImage, params?.editIndex]);

  useEffect(() => {
    if (params?.deleteCrop && params?.editIndex !== undefined) {
      setCrops(prev => prev.filter((_, idx) => idx !== Number(params.editIndex)));
    }
  }, [params?.deleteCrop, params?.editIndex]);

  const [image, setImage] = useState(params.image || null);
  const [name, setName] = useState(params.name || '');
  const editIndex = params.editIndex !== undefined ? Number(params.editIndex) : null;

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

  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [farmAddress, setFarmAddress] = useState('');

  // 농장 주소 가져오기
  const fetchFarmAddress = async () => {
    try {
      // 먼저 farm_id를 가져오기 위해 모든 농장 정보 조회
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
      const farms = await response.json();
      
      if (response.ok) {
        const farm = farms.find(f => f.farm_name === farmName);
        if (farm) {
          // farm_id로 주소 정보 조회
          const addressResponse = await fetch(`${API_CONFIG.BASE_URL}/api/farm/address/${farm.farm_id}`);
          const addressData = await addressResponse.json();
          
          if (addressResponse.ok) {
            setFarmAddress(addressData.address);
          } else {
            setFarmAddress('주소 정보를 가져오는데 실패했습니다.');
          }
        } else {
          setFarmAddress('농장을 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('농장 주소 가져오기 실패:', error);
      setFarmAddress('주소 정보를 가져오는데 실패했습니다.');
    }
  };

  // 모달 열 때 주소 가져오기
  const handleOpenAddressModal = () => {
    fetchFarmAddress();
    setIsAddressModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* 상단 주소(농장 이름) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push({
          pathname: '/Map/Map',
          params: {
            userData: params.userData,
            phone: params.phone,
            name: params.name,
            region: params.region,
            introduction: params.introduction
          }
        })}>
          <Image source={gobackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>{farmName}</Text>
        <TouchableOpacity onPress={handleOpenAddressModal}>
          <Image source={require('../../assets/mappingicon.png')} style={styles.mappingIcon} />
        </TouchableOpacity>
      </View>

      {/* 사진 추가 카드 */}
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
      <View style={styles.divider} />

      {/* 작물 카드 리스트 */}
      <FlatList
        data={crops}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.cropCard}
            onPress={() => router.push({
              pathname: '/Memo/memolist',
              params: {
                cropName: item.name,
                cropImage: item.image,
                cropIndex: index,
              }
            })}
          >
            <Image source={{ uri: item.image }} style={styles.cropCardImage} />
            <Text style={styles.cropCardText}>{item.name}</Text>
            <Image source={require('../../assets/settingicon.png')} style={styles.settingIcon} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.cropBox} onPress={() => router.push('/Memo/cropplus')}>
            <Image source={require('../../assets/cropicon.png')} style={styles.iconSmall} />
            <Text style={styles.cropText}>작물 추가</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          router.replace({
            pathname: '/Memo/farmedit',
            params: {
              newCropName: name,
              newCropImage: image,
              editIndex: editIndex,
            }
          });
        }}
      >
        <Text style={styles.confirmButtonText}>확인</Text>
      </TouchableOpacity>

      {/* 주소 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isAddressModalVisible}
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>농장 주소</Text>
            <Text style={styles.addressText}>{farmAddress}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsAddressModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
    position: 'relative',
    height: 40, // 높이 고정(필요시 조정)
    marginTop: -15,
  },
  backIcon: {
    width: 24,
    height: 24,
    zIndex: 1,
    resizeMode: 'contain',
    marginLeft: 5,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginRight: -10,
  },
  photoBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    height: 220,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: { width: 60, height: 60, marginBottom: 8 },
  photoText: { fontSize: 16, color: '#222', fontWeight: 'bold'},
  cropBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconSmall: { width: 40, height: 40, marginBottom: 8 },
  cropText: { fontSize: 16, color: '#222', fontWeight: 'bold' },
  cropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cropCardImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  cropCardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingIcon: {
    width: 24,
    height: 24,
    tintColor: '#888',
  },
  confirmButton: {
    backgroundColor: '#22CC6B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  confirmButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    height: 4,
    backgroundColor: '#e9ecef',
    marginBottom: 16,
    width: '150%',
    marginLeft: -20,
  },
  mappingIcon: {
    width: 28,
    height: 25, 
    marginBottom: 2,
    marginRight: 3,
    resizeMode: 'contain',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2ECC71',
  },
  addressText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});