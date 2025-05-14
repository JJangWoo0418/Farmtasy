import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function MemoList() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // 관리작물 리스트 (초기에는 빈 배열)
  const [managedCrops, setManagedCrops] = useState([]);

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
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>상세 작물</Text>
      </View>

      {/* 관리작물 카드 리스트 */}
      <FlatList
        data={managedCrops}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.cropCard}
            onPress={() => router.push({
              pathname: '/Memo/memoplus',
              params: {
                name: item.name,
                image: item.image,
                qrValue: item.qrCode,
                editIndex: index
              }
            })}
          >
            <Image source={{ uri: item.image }} style={styles.cropCardImage} />
            <Text style={styles.cropCardText}>{item.name}</Text>
            <Image source={require('../../assets/settingicon.png')} style={styles.settingIcon} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.cropBox}
            onPress={() => router.push('/Memo/memoplus')}
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: { fontWeight: 'bold', fontSize: 20, flex: 1, textAlign: 'center' },
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
    tintColor: '#888',
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
  iconSmall: { width: 40, height: 40, marginRight: 8 },
  cropText: { fontSize: 16, color: '#222', fontWeight: 'bold' },
});
