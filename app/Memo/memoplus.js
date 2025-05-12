import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function MemoList() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [managedCrops, setManagedCrops] = useState([]);

  // 카드 추가/수정/삭제 처리
  useEffect(() => {
    if (params?.newMemoName && params?.newMemoImage) {
      if (params?.editIndex !== undefined) {
        // 수정
        setManagedCrops(prev =>
          prev.map((crop, idx) =>
            idx === Number(params.editIndex)
              ? { ...crop, name: params.newMemoName, image: params.newMemoImage, qr: params.newMemoQR }
              : crop
          )
        );
      } else {
        // 추가
        setManagedCrops(prev => [
          ...prev,
          { name: params.newMemoName, image: params.newMemoImage, qr: params.newMemoQR }
        ]);
      }
    }
    if (params?.deleteMemo && params?.editIndex !== undefined) {
      setManagedCrops(prev => prev.filter((_, idx) => idx !== Number(params.editIndex)));
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
            onPress={() => {/* 상세 페이지 이동 등 추가 가능 */}}
          >
            <Image source={{ uri: item.image }} style={styles.cropCardImage} />
            <Text style={styles.cropCardText}>{item.name}</Text>
            <Image source={require('../../assets/settingicon.png')} style={styles.settingIcon} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.cropBox} onPress={() => router.push('/Memo/memoplus')}>
            <Image source={require('../../assets/cropicon.png')} style={styles.iconSmall} />
            <Text style={styles.cropText}>관리작물 추가</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ...farmedit.js와 동일하게 카드 스타일 등 정의...
});
