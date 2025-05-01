import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { MarketPriceService } from './MarketPriceService';

const CropSelectionScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handleSearch = async () => {
    try {
      const result = await MarketPriceService.getItemCodes(searchText);
      
      const hasFruits = result.fruits && result.fruits.length > 0;
      const hasVegetables = result.vegetables && result.vegetables.length > 0;
      
      if (hasFruits || hasVegetables) {
        setDisplayText(searchText); // 검색 성공시 입력한 텍스트를 그대로 표시
      } else {
        setDisplayText(''); // 검색 실패시 표시 텍스트 제거
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setDisplayText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>작물 추가</Text>
        
        {/* 검색 입력 영역 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="작물명을 입력하세요"
          />
          <Button title="직접 추가하기" onPress={handleSearch} />
        </View>

        {/* 선택된 작물 표시 영역 */}
        {displayText && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedText}>
              선택된 작물: {displayText}
            </Text>
          </View>
        )}
        
        {/* 인기작물 TOP 12 영역 */}
        <Text style={styles.subtitle}>인기작물 TOP 12</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  contentContainer: {
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedText: {
    fontSize: 16,
    color: '#212529',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default CropSelectionScreen; 