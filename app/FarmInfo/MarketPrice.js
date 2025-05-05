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
      } else {
        // 저장된 작물이 없을 경우 빈 배열로 초기화
        setCrops([]);
      }
    } catch (error) {
      console.error('저장된 작물 목록 로드 오류:', error);
      // 오류 발생 시 빈 배열로 초기화
      setCrops([]);
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
    { name: '쌀', icon: '🌾' },
    { name: '배추', icon: '🥬' },
    { name: '양파', icon: '🧅' },
    { name: '감자', icon: '🥔' },
    { name: '사과', icon: '🍎' },
    { name: '고추', icon: '🌶️' },
    { name: '마늘', icon: '🧄' },
    { name: '배', icon: '🍐' },
    { name: '고구마', icon: '🍠' },
    { name: '수박', icon: '🍉' },
    { name: '포도', icon: '🍇' },
    { name: '옥수수', icon: '🌽' },
    { name: '토마토', icon: '🍅' },
    { name: '오이', icon: '🥒' },
    { name: '가지', icon: '🍆' },
    { name: '복숭아', icon: '🍑' },
    { name: '딸기', icon: '🍓' },
    { name: '땅콩', icon: '🥜' },
    { name: '버섯', icon: '🍄' },
    { name: '당근', icon: '🥕' },
    { name: '망고', icon: '🥭' },
  ];

  // 작물 추가
  const handleAddCrop = async (cropName) => {
    if (cropName.trim()) {
      try {
        // 해당 작물의 품목 코드 검색
        const searchResults = await MarketPriceService.getItemCodes(cropName.trim());
        console.log('검색 결과:', searchResults);
        
        if (searchResults && searchResults.length > 0) {
          // 같은 대분류(LARGENAME)와 중분류(MIDNAME)를 가진 모든 품종을 찾음
          const mainCategory = searchResults[0].LARGENAME;
          const subCategory = searchResults[0].MIDNAME;
          const allVarieties = searchResults.filter(
            item => item.LARGENAME === mainCategory && item.MIDNAME === subCategory
          );

          console.log('찾은 품종들:', allVarieties);

          // 작물 정보를 저장할 때 모든 품종 정보를 포함
          const cropInfo = {
            name: subCategory,
            category: mainCategory,
            varieties: allVarieties.map(item => ({
              name: item.GOODNAME,
              code: `${item.LARGE}${item.MID}${item.SMALL}`
            }))
          };

          // 이미 존재하는 작물인지 확인
          const existingCropIndex = crops.findIndex(crop => crop.name === cropInfo.name);
          let updatedCrops;
          
          if (existingCropIndex >= 0) {
            // 이미 존재하는 작물이면 업데이트
            updatedCrops = [...crops];
            updatedCrops[existingCropIndex] = cropInfo;
          } else {
            // 새로운 작물이면 추가
            updatedCrops = [...crops, cropInfo];
          }

          setCrops(updatedCrops);
          await saveCrops(updatedCrops);
          setSelectedCrop(cropInfo);
          setSelectedItemCode(cropInfo.varieties[0].code);
          setNewCropName('');
          setIsAddCropModalVisible(false);
          
          // 작물 선택 후 데이터 로드
          loadPriceData();
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
    const updatedCrops = crops.filter(crop => crop.name !== cropToRemove.name);
    setCrops(updatedCrops);
    saveCrops(updatedCrops);
    if (selectedCrop?.name === cropToRemove.name) {
      setSelectedCrop(updatedCrops[0] || null);
      setSelectedItemCode(updatedCrops[0]?.varieties[0]?.code || '');
    }
  };

  // 작물 선택
  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    if (crop.varieties && crop.varieties.length > 0) {
      setSelectedItemCode(crop.varieties[0].code);
      loadPriceData();
    }
  };

  // 인기 작물 선택
  const handleSelectPopularCrop = async (cropName) => {
    try {
      const searchResults = await MarketPriceService.getItemCodes(cropName);
      if (searchResults && searchResults.length > 0) {
        const mainCategory = searchResults[0].LARGENAME;
        const subCategory = searchResults[0].MIDNAME;
        const allVarieties = searchResults.filter(
          item => item.LARGENAME === mainCategory && item.MIDNAME === subCategory
        );

        const cropInfo = {
          name: subCategory,
          category: mainCategory,
          varieties: allVarieties.map(item => ({
            name: item.GOODNAME,
            code: `${item.LARGE}${item.MID}${item.SMALL}`
          }))
        };

        const existingCropIndex = crops.findIndex(crop => crop.name === cropInfo.name);
        let updatedCrops;
        
        if (existingCropIndex >= 0) {
          updatedCrops = [...crops];
          updatedCrops[existingCropIndex] = cropInfo;
        } else {
          updatedCrops = [...crops, cropInfo];
        }

        setCrops(updatedCrops);
        await saveCrops(updatedCrops);
        setSelectedCrop(cropInfo);
        setSelectedItemCode(cropInfo.varieties[0].code);
        loadPriceData();
      }
    } catch (error) {
      console.error('인기 작물 선택 중 오류:', error);
      alert('인기 작물 선택 중 오류가 발생했습니다.');
    }
  };

  // 품종 선택
  const handleSelectVariety = (variety) => {
    setSelectedItemCode(variety.code);
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
        const data = await MarketPriceService.getDailyPrice(selectedItemCode, selectedDate);
        if (data && data.length > 0) {
          // 데이터를 날짜순으로 정렬
          const sortedData = data.sort((a, b) => {
            const dateA = new Date(a.AUCNGDE);
            const dateB = new Date(b.AUCNGDE);
            return dateB - dateA;
          });
          setDailyPrices(sortedData);
          console.log('일일 시세 데이터:', sortedData);
        } else {
          setDailyPrices([]);
        }
      } else {
        const marketPricesData = [];
        for (const market of marketCodes) {
          const data = await MarketPriceService.getRegionalPrices(selectedItemCode, market.CODEID, selectedDate);
          if (data && data.length > 0) {
            marketPricesData.push({
              marketName: market.MRKTNM,
              prices: data
            });
          }
        }
        setMarketPrices(marketPricesData);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
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
            {/* 작물 이름 입력 필드 */}
            <TextInput
              style={styles.input}
              value={newCropName}
              onChangeText={setNewCropName}
              placeholder="작물 이름을 입력하세요"
              placeholderTextColor="#999"
            />

            {/* 직접 추가하기 버튼 */}
            <TouchableOpacity
              style={styles.directInputButton}
              onPress={() => {
                if (newCropName.trim()) {
                  handleAddCrop(newCropName);
                }
              }}
            >
              <Text style={styles.directInputText}>직접 추가하기</Text>
            </TouchableOpacity>

            {/* 인기작물 TOP 20 */}
            <Text style={styles.popularCropsTitle}>인기작물 TOP 20</Text>
            <View style={styles.popularCropsGrid}>
              {popularCrops.map((crop, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cropItem}
                  onPress={() => handleSelectPopularCrop(crop.name)}
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

  // 경매내역 탭 렌더링
  const renderAuctionHistory = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : dailyPrices.length > 0 ? (
        <ScrollView>
          {dailyPrices.map((price, index) => (
            <View key={index} style={styles.priceItem}>
              <View style={styles.priceHeader}>
                <Text style={styles.dateText}>
                  {new Date(price.AUCNGDE).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.marketText}>{price.MRKTNM}</Text>
              </View>
              <View style={styles.priceDetails}>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>최고가</Text>
                  <Text style={styles.highPrice}>{price.MAXPRC}원</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>최저가</Text>
                  <Text style={styles.lowPrice}>{price.MINPRC}원</Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>평균가</Text>
                  <Text style={styles.avgPrice}>{price.AVGPRI}원</Text>
                </View>
              </View>
              <View style={styles.volumeInfo}>
                <Text style={styles.volumeText}>거래량: {price.AUCTQY}kg</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noDataText}>해당 기간의 경매 내역이 없습니다.</Text>
      )}
    </View>
  );

  // 작물 선택 탭 렌더링
  const renderCropSelector = () => {
    if (!crops || crops.length === 0) {
      return (
        <View style={styles.cropSelector}>
          <TouchableOpacity
            style={styles.addCropButton}
            onPress={() => setIsAddCropModalVisible(true)}
          >
            <Text style={styles.addCropText}>+ 작물 추가</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
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
              {crop.name}
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
    );
  };

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
      {renderCropSelector()}

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
        renderAuctionHistory()
      ) : (
        <View style={styles.nationalPriceContainer}>
          <ScrollView>
            {marketPrices.map((market, index) => (
              <View key={index} style={styles.marketSection}>
                <View style={styles.marketHeader}>
                  <Text style={styles.marketName}>{market.marketName}</Text>
                  {market.prices && market.prices[0] && (
                    <>
                      <Text style={styles.totalVolume}>
                        총 {market.prices[0].VOLUME || '0'}kg
                      </Text>
                      <View style={styles.priceChange}>
                        <Text style={styles.changeLabel}>전일대비</Text>
                        <Text style={market.prices[0].DIFF_PRICE > 0 ? styles.increaseText : styles.decreaseText}>
                          {market.prices[0].DIFF_PRICE || '0'}원
                          ({market.prices[0].DIFF_RATE || '0'}%)
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                {market.prices && market.prices[0] && (
                  <View style={styles.priceDetails}>
                    <Text>{market.prices[0].GRADE || '등급없음'} / {market.prices[0].UNIT || '단위없음'}</Text>
                    <Text>{market.prices[0].VOLUME || '0'}kg</Text>
                    <Text>{market.prices[0].ITEM_NAME || '품목없음'}</Text>
                    <View style={styles.priceRange}>
                      <Text>{market.prices[0].AVG_PRICE || '0'}원/kg</Text>
                      <Text style={styles.highPrice}>최고 {market.prices[0].MAX_PRICE || '0'}원</Text>
                      <Text style={styles.lowPrice}>최저 {market.prices[0].MIN_PRICE || '0'}원</Text>
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