// farmedit.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import gobackIcon from '../../assets/gobackicon.png';
import API_CONFIG from '../DB/api';
import defaultImage from '../../assets/cropdetailicon.png';

export default function FarmEdit() {
  const { farmName } = useLocalSearchParams();
  const router = useRouter();
  const params = useLocalSearchParams();

  // 상태 관리
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [name, setName] = useState(params.name || '');
  const [farmId, setFarmId] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [farmAddress, setFarmAddress] = useState('');

  const editIndex = params.editIndex !== undefined ? Number(params.editIndex) : null;

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

  // farm_image 가져오기
  useEffect(() => {
    const fetchFarmImage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
        const farms = await response.json();

        if (response.ok) {
          const farm = farms.find(f => f.farm_name === farmName);
          if (farm && farm.farm_image) {
            setImage(farm.farm_image);
          }
        }
      } catch (error) {
        console.error('농장 이미지 가져오기 실패:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchFarmImage();
  }, [farmName, params.phone]);

  // farm_id 가져오기
  useEffect(() => {
    const fetchFarmId = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
        const farms = await response.json();

        if (response.ok) {
          const farm = farms.find(f => f.farm_name === farmName);
          if (farm) {
            setFarmId(farm.farm_id);
            console.log('농장 ID 설정됨:', farm.farm_id);
          }
        }
      } catch (error) {
        console.error('농장 ID 가져오기 실패:', error);
      }
    };

    if (params.phone && farmName) {
      fetchFarmId();
    }
  }, [params.phone, farmName]);

  // farm_id로 crop 테이블에서 작물 목록 불러오기
  useEffect(() => {
    if (!farmId) return;
    const fetchCrops = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/crop?farm_id=${farmId}`);
        const data = await response.json();
        if (response.ok) {
          setCrops(data.map(crop => ({
            name: crop.crop_name,
            image: crop.crop_image_url,
            cropId: crop.crop_id,
          })));
        } else {
          setCrops([]);
        }
      } catch (error) {
        console.error('작물 목록 불러오기 실패:', error);
        setCrops([]);
      }
    };
    fetchCrops();
  }, [farmId]);

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

        // farm_id 가져오기
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${params.phone}`);
        const farms = await response.json();

        if (response.ok) {
          const farm = farms.find(f => f.farm_name === farmName);
          if (farm) {
            // farm_image 업데이트
            const updateResponse = await fetch(`${API_CONFIG.BASE_URL}/api/farm/image/${farm.farm_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                farm_image: s3Url
              })
            });

            if (!updateResponse.ok) {
              console.error('농장 이미지 업데이트 실패');
              Alert.alert('오류', '이미지 업데이트에 실패했습니다.');
            }
          }
        }
      }
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      Alert.alert('오류', '이미지 처리 중 오류가 발생했습니다.');
    }
  };

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

  // 작물 추가 버튼 클릭 시
  const handleAddCrop = () => {
    if (!farmId) {
      Alert.alert('오류', '농장 정보를 찾을 수 없습니다.');
      return;
    }

    router.push({
      pathname: '/Memo/cropplus',
      params: {
        phone: params.phone,
        farmName: farmName,
        farmId: farmId
      }
    });
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
        {isLoading ? (
          <View style={[styles.loadingContainer, styles.photoBox]}>
            <ActivityIndicator size="large" color="#22CC6B" />
            <Text style={styles.loadingText}>이미지 로딩 중...</Text>
          </View>
        ) : image ? (
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
            onPress={() => {
              console.log('선택된 작물 ID:', item.cropId);
              router.push({
                pathname: '/Memo/memolist',
                params: {
                  farmName: params.farmName,
                  userData: params.userData,
                  phone: params.phone,
                  name: params.name,
                  region: params.region,
                  introduction: params.introduction,
                  farmId: farmId,
                  cropId: item.cropId
                }
              });
            }}
          >
            <Image
              source={
                item.image && item.image.startsWith('https://farmtasybucket.s3.ap-northeast-2.amazonaws.com/')
                  ? { uri: item.image }
                  : defaultImage
              }
              style={styles.cropCardImage}
            />
            <Text style={styles.cropCardText}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/Memo/cropsetting',
                  params: {
                    cropId: item.cropId,
                    name: item.name,
                    image: item.image,
                    farmId: farmId,
                    farmName: params.farmName,
                    userData: params.userData,
                    phone: params.phone,
                    region: params.region,
                    introduction: params.introduction,
                    // 필요시 추가 정보 전달
                  }
                });
              }}
            >
              <Image source={require('../../assets/settingicon.png')} style={styles.settingIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.cropBox} onPress={handleAddCrop}>
            <Image source={require('../../assets/cropicon.png')} style={styles.iconSmall} />
            <Text style={styles.cropText}>작물 종류 추가</Text>
          </TouchableOpacity>
        }
      />

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
  photoText: { fontSize: 16, color: '#222', fontWeight: 'bold' },
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});