import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import API_CONFIG from '../DB/api';
import defaultImage from '../../assets/cropdetailicon.png';

export default function MemoList() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // 관리작물 리스트 (초기에는 빈 배열)
  const [managedCrops, setManagedCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cropName, setCropName] = useState(''); // 작물 이름 상태 추가

  // 선택한 작물의 이름 가져오기
  useEffect(() => {
    const fetchCropName = async () => {
      if (!params.cropId) return;

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/crop?crop_id=${params.cropId}`);
        const data = await response.json();

        if (response.ok && data.length > 0) {
          setCropName(data[0].crop_name);
        }
      } catch (error) {
        console.error('작물 이름 가져오기 실패:', error);
      }
    };

    fetchCropName();
  }, [params.cropId]);

  // 선택된 작물의 cropdetail 데이터 가져오기
  useEffect(() => {
    console.log('현재 farmId:', params.farmId);
    console.log('현재 phone:', params.phone);
    console.log('현재 cropId:', params.cropId);

    if (!params.farmId || !params.phone || !params.cropId) {
      console.log('필수 파라미터가 없습니다.');
      return;
    }

    const fetchCropDetails = async () => {
      try {
        const url = `${API_CONFIG.BASE_URL}/api/cropdetail?crop_id=${params.cropId}&user_phone=${params.phone}`;
        console.log('CropDetail API 호출 URL:', url);

        const response = await fetch(url);
        const data = await response.json();
        console.log('CropDetail API 응답 데이터:', data);

        if (response.ok) {
          if (Array.isArray(data) && data.length > 0) {
            const filteredData = data.filter(detail => detail.crop_id === parseInt(params.cropId));
            console.log('필터링된 데이터:', filteredData);

            const mappedData = filteredData.map(detail => ({
              name: detail.detail_name || '이름 없음',
              image: detail.detail_image_url || 'https://via.placeholder.com/48',
              qrCode: detail.detail_qr_code,
              cropId: detail.crop_id,
              detailId: detail.cropdetail_id
            }));
            console.log('매핑된 데이터:', mappedData);
            setManagedCrops(mappedData);
          } else {
            console.log('작물 상세 데이터가 없습니다.');
            setManagedCrops([]);
          }
        } else {
          console.log('API 응답 실패:', response.status, data);
          setManagedCrops([]);
        }
      } catch (error) {
        console.error('작물 상세 목록 불러오기 실패:', error);
        setManagedCrops([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCropDetails();
  }, [params.farmId, params.phone, params.cropId]);

  // 새로운 작물 정보가 전달되면 리스트에 추가
  useEffect(() => {
    if (params.newMemoName && params.newMemoImage) {
      const newCrop = {
        name: params.newMemoName,
        image: params.newMemoImage,
        qrCode: params.newMemoQR,
      };

      if (params.editIndex !== undefined) {
        // 수정인 경우
        const newCrops = [...managedCrops];
        newCrops[params.editIndex] = newCrop;
        setManagedCrops(newCrops);
      } else {
        // 새로운 작물 추가인 경우
        setManagedCrops([...managedCrops, newCrop]);
      }
    }
  }, [params]);

  // 작물 삭제 처리
  useEffect(() => {
    if (params.deleteMemo && params.editIndex !== undefined) {
      const newCrops = managedCrops.filter((_, index) => index !== parseInt(params.editIndex));
      setManagedCrops(newCrops);
    }
  }, [params]);

  return (
    <View style={styles.container}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          router.push({
            pathname: '/Memo/farmedit',
            params: {
              farmName: params.farmName,
              userData: params.userData,
              phone: params.phone,
              name: params.name,
              region: params.region,
              introduction: params.introduction,
              farmId: params.farmId,
              detailId: params.detailId,
              image: params.image,
              cropId: params.cropId,
            }
          });
        }}>
          <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>{cropName || '상세 작물'}</Text>
      </View>

      {/* 관리작물 카드 리스트 */}
      <FlatList
        data={managedCrops}
        keyExtractor={(item) => item.detailId?.toString() || Math.random().toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.cropCard}
            onPress={() => {
              console.log('카드 클릭 detailId:', item.detailId);
              router.push({
                pathname: '/Memo/cropdetailmemopage',
                params: {
                  detailId: item.detailId,
                  name: item.name,
                  image: item.image,
                  cropId: item.cropId,
                  phone: params.phone,
                  farmId: params.farmId,
                  farmName: params.farmName,
                  userData: params.userData,
                  region: params.region,
                  introduction: params.introduction,
                  // 필요시 추가 정보 전달
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
                  pathname: '/Memo/memosetting',
                  params: {
                    detailId: item.detailId,
                    name: item.name,
                    image: item.image,
                    cropId: item.cropId,
                    phone: params.phone,
                    farmId: params.farmId,
                    farmName: params.farmName,
                    userData: params.userData,
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
          <TouchableOpacity
            style={styles.cropBox}
            onPress={() => {
              router.push({
                pathname: '/Memo/memoplus',
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
            }}
          >
            <Image source={require('../../assets/cropicon.png')} style={styles.iconSmall} />
            <Text style={styles.cropText}>관리작물 추가</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
    position: 'relative',
    height: 40,
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
    marginRight: 30,
  },
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
  cropBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconSmall: {
    width: 40,
    height: 40,
    marginRight: 8
  },
  cropText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold'
  },
});
