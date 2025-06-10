import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../Components/UI/card';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AiotScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://라즈베리파이_IP:5000/predict')
        .then(res => res.json())
        .then(setData)
        .catch(() => setData(null));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* 헤더 고정 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>과일당도측정하기</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>AIoT 실시간 분석 결과</Text>

        <Card style={styles.card}>
          <Text style={styles.label}>예측 과일</Text>
          <Text style={styles.value}>{data?.fruit || '데이터 수신 중...'}</Text>
          <Text style={styles.label}>신뢰도</Text>
          <Text style={styles.value}>{data?.confidence ? `${(data.confidence * 100).toFixed(1)}%` : '-'}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>측정된 당도</Text>
          <Text style={styles.value}>{data?.brix ? `${data.brix} Brix` : '-'}</Text>
          <Text style={styles.label}>측정된 무게</Text>
          <Text style={styles.value}>{data?.weight ? `${data.weight} g` : '-'}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.label}>촬영 이미지</Text>
          {data?.imageUrl ? (
            <Image source={{ uri: data.imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.value}>이미지 없음</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  card: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8
  }
});