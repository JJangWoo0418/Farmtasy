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
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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

  // 인기 작물 목록 추가
  const popularCrops = [
    { name: '고추', icon: '🌶️' },
    { name: '블루베리', icon: '🫐' },
    { name: '감자', icon: '🥔' },
    { name: '고구마', icon: '🍠' },
    { name: '사과', icon: '🍎' },
    { name: '딸기', icon: '🍓' },
    { name: '마늘', icon: '🧄' },
    { name: '상추', icon: '🥬' },
    { name: '오이', icon: '🥒' },
    { name: '토마토', icon: '🍅' },
    { name: '포도', icon: '🍇' },
    { name: '콩', icon: '🫘' },
  ];

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
  const getCalendarDates = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const dates = [];

    // 이전 달의 날짜들
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth, -i);
      dates.push(date);
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(selectedYear, selectedMonth, i));
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - dates.length; // 6주 x 7일 = 42
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(selectedYear, selectedMonth + 1, i));
    }

    return dates;
  };

  // 선택된 날짜의 주간 날짜들을 계산하는 함수
  const getWeekDates = (selectedDate) => {
    const dates = [];
    const current = new Date(selectedDate);
    const day = current.getDay(); // 0 = 일요일, 6 = 토요일
    
    // 선택된 날짜를 기준으로 해당 주의 일요일로 이동
    current.setDate(current.getDate() - day);
    
    // 일요일부터 토요일까지의 날짜를 배열에 추가
    for (let i = 0; i < 7; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 이전 달로 이동
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedYear(prev => prev - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedYear(prev => prev + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // 작물 추가 모달
  const renderAddCropModal = () => (
    <Modal
      visible={isAddCropModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity 
              onPress={() => {
                setNewCropName('');
                setIsAddCropModalVisible(false);
              }}
              style={{ padding: 5 }}
            >
              <Text style={{ fontSize: 24, color: '#666' }}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>작물 추가</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* 직접 추가하기 버튼 */}
            <TouchableOpacity 
              style={styles.directInputButton}
              onPress={() => {
                if (newCropName.trim()) {
                  handleAddCrop();
                  setIsAddCropModalVisible(false);
                }
              }}
            >
              <Text style={styles.directInputText}>직접 추가하기</Text>
            </TouchableOpacity>

            {/* 작물 이름 입력 필드 */}
            <TextInput
              style={styles.input}
              value={newCropName}
              onChangeText={setNewCropName}
              placeholder="작물 이름을 입력하세요"
              placeholderTextColor="#999"
            />

            {/* 인기작물 TOP 12 */}
            <Text style={styles.popularCropsTitle}>인기작물 TOP 12</Text>
            <View style={styles.popularCropsGrid}>
              {popularCrops.map((crop, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cropItem}
                  onPress={() => {
                    setNewCropName(crop.name);
                    handleAddCrop();
                    setIsAddCropModalVisible(false);
                  }}
                >
                  <Text style={styles.cropIcon}>{crop.icon}</Text>
                  <Text style={styles.cropName}>{crop.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 달력 모달 렌더링
  const renderCalendarModal = () => (
    <Modal
      visible={isCalendarVisible}
      transparent={true}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1} 
        onPress={() => setIsCalendarVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalContent, styles.calendarModalContent]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 달력 헤더 */}
          <View style={styles.calendarModalHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Text style={styles.calendarArrow}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{selectedYear}년 {selectedMonth + 1}월</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text style={styles.calendarArrow}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 */}
          <View style={styles.calendarWeekHeader}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <Text key={index} style={[
                styles.calendarWeekDay,
                index === 0 && styles.sundayText,
                index === 6 && styles.saturdayText,
              ]}>
                {day}
              </Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          <View style={styles.calendarGrid}>
            {getCalendarDates().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  date.getMonth() !== selectedMonth && styles.calendarDayOtherMonth,
                  date.toDateString() === selectedDate.toDateString() && styles.selectedDate
                ]}
                onPress={() => {
                  setSelectedDate(date);
                  setIsCalendarVisible(false);
                  loadPriceData();
                }}
              >
                <Text style={[
                  styles.calendarDayText,
                  date.getDay() === 0 && styles.sundayText,
                  date.getDay() === 6 && styles.saturdayText,
                  date.toDateString() === selectedDate.toDateString() && styles.selectedDateText,
                  date.getMonth() !== selectedMonth && styles.calendarDayOtherMonthText
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton, { marginTop: 10 }]}
            onPress={() => setIsCalendarVisible(false)}
          >
            <Text style={[styles.modalButtonText, { color: '#000' }]}>닫기</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
      {/* 작물 선택 탭 (1/10) */}
      <View style={styles.cropSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      </View>

      {/* 달력 섹션 (2/10) */}
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          {/* 월 선택기 */}
          <TouchableOpacity 
            style={styles.monthSelector}
            onPress={() => {
              setIsCalendarVisible(true);
            }}
          >
            <Text style={styles.monthText}>{selectedDate.getMonth() + 1}월</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>

          {/* 요일과 날짜 컨테이너 */}
          <View style={styles.daysContainer}>
            {/* 요일 행 */}
            <View style={styles.daysRow}>
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <View key={index} style={styles.dayCell}>
                  <Text style={[
                    styles.dayText,
                    index === 0 && styles.sundayText,
                    index === 6 && styles.saturdayText
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* 날짜 행 */}
            <View style={styles.datesRow}>
              {getWeekDates(selectedDate).map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCell,
                    date.toDateString() === selectedDate.toDateString() && styles.selectedDate
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    loadPriceData();
                  }}
                >
                  <Text style={[
                    styles.dateText,
                    index === 0 && styles.sundayText,
                    index === 6 && styles.saturdayText,
                    date.toDateString() === selectedDate.toDateString() && styles.selectedDateText
                  ]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 모달 렌더링 */}
      {renderAddCropModal()}
      {renderCalendarModal()}

      {/* 경매내역/전국시세 섹션 (7/10) */}
      <View style={styles.tabContainer}>
        {/* 탭 버튼 */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
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

        {/* 탭 컨텐츠 */}
        <View style={{ flex: 1 }}>
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
      </View>
    </View>
  );
} 