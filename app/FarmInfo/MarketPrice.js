import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketPriceService } from './MarketPriceService';
import { MARKET_API_KEY } from '../Components/API/apikey';
import { styles } from '../Components/Css/FarmInfo/MarketPriceStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketPrice() {
  const [selectedTab, setSelectedTab] = useState('경매내역');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCrop, setSelectedCrop] = useState('');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dailyPrices, setDailyPrices] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [error, setError] = useState(null);
  const [itemCodes, setItemCodes] = useState([]);
  const [marketCodes, setMarketCodes] = useState([]);
  const [isAddCropModalVisible, setIsAddCropModalVisible] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  // 저장된 작물 목록 로드
  useEffect(() => {
    loadSavedCrops();
  }, []);

  // 작물 목록 저장
  const saveCrops = async (updatedCrops) => {
    try {
      await AsyncStorage.setItem('savedCrops', JSON.stringify(updatedCrops));
    } catch (error) {
      console.error('작물 목록 저장 오류:', error);
    }
  };

  // 저장된 작물 목록 로드
  const loadSavedCrops = async () => {
    try {
      const savedCrops = await AsyncStorage.getItem('savedCrops');
      if (savedCrops) {
        const parsedCrops = JSON.parse(savedCrops);
        setCrops(parsedCrops);
        if (parsedCrops.length > 0) {
          setSelectedCrop(parsedCrops[0]);
          findAndSetItemCode(parsedCrops[0]);
        }
      }
    } catch (error) {
      console.error('저장된 작물 목록 로드 오류:', error);
    }
  };

  // 카테고리 데이터 로드
  const loadCategories = async () => {
    try {
      const response = await MarketPriceService.getItemCodes();
      if (response && response.length > 0) {
        // 중복 제거된 대분류 목록 생성
        const categories = [...new Set(response.map(item => item.LARGENAME))];
        setAvailableCategories(categories.filter(category => category));
      }
    } catch (error) {
      console.error('카테고리 로드 오류:', error);
    }
  };

  // 선택된 카테고리에 따른 작물 목록 로드
  const loadSubCategories = async (category) => {
    try {
      const response = await MarketPriceService.getItemCodes();
      if (response && response.length > 0) {
        // 선택된 대분류에 해당하는 작물 목록 필터링
        const subCategories = [...new Set(
          response
            .filter(item => item.LARGENAME === category)
            .map(item => item.MIDNAME)
        )];
        setAvailableSubCategories(subCategories.filter(subCategory => subCategory));
      }
    } catch (error) {
      console.error('작물 목록 로드 오류:', error);
    }
  };

  // 선택된 작물에 따른 품종 목록 로드
  const loadItems = async (category, subCategory) => {
    try {
      const response = await MarketPriceService.getItemCodes();
      if (response && response.length > 0) {
        // 선택된 작물의 품종 목록 필터링
        const items = response.filter(
          item => item.LARGENAME === category && item.MIDNAME === subCategory
        );
        setAvailableItems(items);
      }
    } catch (error) {
      console.error('품종 목록 로드 오류:', error);
    }
  };

  // 작물 추가
  const handleAddCrop = async () => {
    if (newCropName.trim()) {
      try {
        // 먼저 해당 작물의 품목 코드를 검색
        const searchResults = await MarketPriceService.getItemCodes(newCropName.trim());
        
        if (searchResults && searchResults.length > 0) {
          const updatedCrops = [...crops, newCropName.trim()];
          setCrops(updatedCrops);
          saveCrops(updatedCrops);
          setNewCropName('');
          setIsAddCropModalVisible(false);
          
          if (updatedCrops.length === 1) {
            setSelectedCrop(newCropName.trim());
            // 검색된 첫 번째 결과의 코드를 사용
            const foundItem = searchResults[0];
            setSelectedItemCode(foundItem.LARGE + foundItem.MID + foundItem.SMALL);
            console.log('선택된 품목 코드:', foundItem.LARGE + foundItem.MID + foundItem.SMALL);
          }
        } else {
          alert('해당 작물의 품목 코드를 찾을 수 없습니다. 다른 이름으로 시도해주세요.');
        }
      } catch (error) {
        console.error('작물 추가 중 오류:', error);
        alert('작물 추가 중 오류가 발생했습니다.');
      }
    }
  };

  // 작물명으로 품목 코드 찾기
  const findAndSetItemCode = async (cropName) => {
    try {
      const searchResults = await MarketPriceService.getItemCodes(cropName);
      
      if (searchResults && searchResults.length > 0) {
        const foundItem = searchResults[0];
        setSelectedItemCode(foundItem.LARGE + foundItem.MID + foundItem.SMALL);
        console.log('선택된 품목 코드:', foundItem.LARGE + foundItem.MID + foundItem.SMALL);
      } else {
        console.log('해당 작물의 품목 코드를 찾을 수 없습니다:', cropName);
        setSelectedItemCode('');
      }
    } catch (error) {
      console.error('품목 코드 검색 중 오류:', error);
      setSelectedItemCode('');
    }
  };

  // 작물 삭제
  const handleRemoveCrop = (cropToRemove) => {
    const updatedCrops = crops.filter(crop => crop !== cropToRemove);
    setCrops(updatedCrops);
    saveCrops(updatedCrops);
    if (selectedCrop === cropToRemove) {
      setSelectedCrop(updatedCrops[0] || '');
    }
  };

  // 작물 선택
  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    findAndSetItemCode(crop);
  };

  // 품목 코드 로드
  useEffect(() => {
    const loadItemCodes = async () => {
      try {
        const response = await MarketPriceService.getItemCodes();
        console.log('API 응답:', response);
        if (response && response.row) {
          setItemCodes(response.row);
          console.log('품목 코드 로드 성공:', response.row);
        }
      } catch (err) {
        console.error('품목 코드 로드 오류:', err);
        setError('품목 코드를 불러오는 중 오류가 발생했습니다.');
      }
    };
    loadItemCodes();
  }, []);

  // 도매시장 코드 로드
  useEffect(() => {
    const loadMarketCodes = async () => {
      try {
        const response = await MarketPriceService.getMarketCodes();
        if (response && response.row) {
          setMarketCodes(response.row);
          console.log('도매시장 코드 로드 성공:', response.row);
        }
      } catch (err) {
        console.error('도매시장 코드 로드 오류:', err);
        setError('도매시장 코드를 불러오는 중 오류가 발생했습니다.');
      }
    };
    loadMarketCodes();
  }, []);

  // 데이터 로드 함수
  const loadPriceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedItemCode) {
        console.log('품목 코드가 선택되지 않았습니다.');
        return;
      }

      if (selectedTab === '경매내역') {
        const data = await MarketPriceService.getDailyPrice(selectedItemCode);
        if (data && data.row) {
          setDailyPrices(data.row);
          console.log('일일 시세 데이터:', data.row);
        }
      } else {
        const marketPricesData = [];
        for (const market of marketCodes) {
          const data = await MarketPriceService.getRegionalPrices(selectedItemCode, market.CODEID);
          if (data && data.row) {
            marketPricesData.push({
              marketCode: market.CODEID,
              marketName: market.CODENAME,
              data: data.row
            });
          }
        }
        setMarketPrices(marketPricesData);
        console.log('지역별 시세 데이터:', marketPricesData);
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 작물이나 탭이 변경될 때 데이터 다시 로드
  useEffect(() => {
    if (selectedItemCode) {
      loadPriceData();
    }
  }, [selectedItemCode, selectedTab]);

  // 달력에 표시할 날짜들 생성
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 카테고리 선택 시
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
    setNewCropName('');
    loadSubCategories(category);
  };

  // 작물 선택 시
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setNewCropName('');
    loadItems(selectedCategory, subCategory);
  };

  // 모달 열릴 때 카테고리 로드
  useEffect(() => {
    if (isAddCropModalVisible) {
      loadCategories();
    }
  }, [isAddCropModalVisible]);

  // 작물 추가 모달
  const renderAddCropModal = () => (
    <Modal
      visible={isAddCropModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>작물 추가</Text>
          
          {/* 대분류 선택 */}
          <Text style={styles.modalSubTitle}>대분류 선택</Text>
          <ScrollView style={styles.categoryList}>
            {availableCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategory === category && styles.selectedCategoryItem
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 작물 선택 */}
          {selectedCategory && (
            <>
              <Text style={styles.modalSubTitle}>작물 선택</Text>
              <ScrollView style={styles.categoryList}>
                {availableSubCategories.map((subCategory, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryItem,
                      selectedSubCategory === subCategory && styles.selectedCategoryItem
                    ]}
                    onPress={() => handleSubCategorySelect(subCategory)}
                  >
                    <Text style={styles.categoryText}>{subCategory}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* 품종 선택 */}
          {selectedSubCategory && (
            <>
              <Text style={styles.modalSubTitle}>품종 선택</Text>
              <ScrollView style={styles.categoryList}>
                {availableItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.categoryItem,
                      newCropName === item.GOODNAME && styles.selectedCategoryItem
                    ]}
                    onPress={() => setNewCropName(item.GOODNAME)}
                  >
                    <Text style={styles.categoryText}>{item.GOODNAME}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setSelectedCategory('');
                setSelectedSubCategory('');
                setNewCropName('');
                setIsAddCropModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.confirmButton,
                !newCropName && styles.disabledButton
              ]}
              onPress={handleAddCrop}
              disabled={!newCropName}
            >
              <Text style={styles.modalButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPriceData}>
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>시세</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 작물 선택 탭 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelector}>
        {crops.map((crop, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cropTab,
              selectedCrop === crop && styles.selectedCropTab
            ]}
            onPress={() => handleSelectCrop(crop)}
          >
            <Text style={[
              styles.cropText,
              selectedCrop === crop && styles.selectedCropText
            ]}>
              {crop}
            </Text>
            <TouchableOpacity
              style={styles.removeCropButton}
              onPress={() => handleRemoveCrop(crop)}
            >
              <Ionicons name="close-circle" size={16} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addCropButton}
          onPress={() => setIsAddCropModalVisible(true)}
        >
          <Text style={styles.addCropText}>+ 작물 추가</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 작물 추가 모달 */}
      {renderAddCropModal()}

      {/* 달력 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendar}>
        {getDates().map((date, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.dateButton,
              date.toDateString() === selectedDate.toDateString() && styles.selectedDate
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={styles.dayText}>
              {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
            </Text>
            <Text style={[
              styles.dateText,
              date.getDay() === 0 && styles.sundayText,
              date.toDateString() === selectedDate.toDateString() && styles.selectedDateText
            ]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 탭 선택 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '경매내역' && styles.selectedTab]}
          onPress={() => setSelectedTab('경매내역')}
        >
          <Text style={[styles.tabText, selectedTab === '경매내역' && styles.selectedTabText]}>
            경매내역
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === '전국시세' && styles.selectedTab]}
          onPress={() => setSelectedTab('전국시세')}
        >
          <Text style={[styles.tabText, selectedTab === '전국시세' && styles.selectedTabText]}>
            전국시세
          </Text>
        </TouchableOpacity>
      </View>

      {/* 시세 정보 */}
      {selectedTab === '경매내역' ? (
        <View style={styles.priceContainer}>
          <View style={styles.priceHeader}>
            <Text style={styles.columnTitle}>품목명</Text>
            <Text style={styles.columnTitle}>대분류</Text>
            <Text style={styles.columnTitle}>중분류</Text>
            <Text style={styles.columnTitle}>소분류</Text>
          </View>
          <ScrollView>
            {itemCodes.map((item, index) => (
              <View key={index} style={styles.priceRow}>
                <Text style={styles.priceText}>{item.GOODNAME}</Text>
                <Text style={styles.priceText}>{item.LARGENAME}</Text>
                <Text style={styles.priceText}>{item.MIDNAME}</Text>
                <Text style={styles.priceText}>{item.SMALL}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.nationalPriceContainer}>
          <ScrollView>
            {marketPrices.map((market, index) => (
              <View key={index} style={styles.marketSection}>
                <View style={styles.marketHeader}>
                  <Text style={styles.marketName}>{market.marketName}</Text>
                  {market.data && market.data[0] && (
                    <>
                      <Text style={styles.totalVolume}>
                        총 {market.data[0].VOLUME || '0'}kg
                      </Text>
                      <View style={styles.priceChange}>
                        <Text style={styles.changeLabel}>전일대비</Text>
                        <Text style={market.data[0].DIFF_PRICE > 0 ? styles.increaseText : styles.decreaseText}>
                          {market.data[0].DIFF_PRICE || '0'}원
                          ({market.data[0].DIFF_RATE || '0'}%)
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                {market.data && market.data[0] && (
                  <View style={styles.priceDetails}>
                    <Text>{market.data[0].GRADE || '등급없음'} / {market.data[0].UNIT || '단위없음'}</Text>
                    <Text>{market.data[0].VOLUME || '0'}kg</Text>
                    <Text>{market.data[0].ITEM_NAME || '품목없음'}</Text>
                    <View style={styles.priceRange}>
                      <Text>{market.data[0].AVG_PRICE || '0'}원/kg</Text>
                      <Text style={styles.highPrice}>최고 {market.data[0].MAX_PRICE || '0'}원</Text>
                      <Text style={styles.lowPrice}>최저 {market.data[0].MIN_PRICE || '0'}원</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
} 