import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MarketPriceService from './MarketPriceService';
import { MARKET_API_KEY } from '../Components/API/apikey';
import { styles } from '../Components/Css/FarmInfo/MarketPriceStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import itemCodeData from '../Components/Utils/item_code_data.json';

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
  const [showPopularCrops, setShowPopularCrops] = useState(true);
  const [varietyList, setVarietyList] = useState([]);
  const [varietySearchText, setVarietySearchText] = useState('');
  const [selectedLarge, setSelectedLarge] = useState('');
  const [selectedMid, setSelectedMid] = useState('');
  const [selectedSmall, setSelectedSmall] = useState('');
  const [selectedCmpcd, setSelectedCmpcd] = useState('');
  const [showCropSelector, setShowCropSelector] = useState(false);

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
    { name: '벼', icon: '🌾' },
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
  const handleAddCrop = async (cropOrItem) => {
    if (typeof cropOrItem === 'object' && cropOrItem.itemName && cropOrItem.varietyName) {
      try {
        // code 생성: LARGE+MID+SMALL 우선, 없으면 itemCode+varietyCode
        let code = '';
        if (cropOrItem.LARGE && cropOrItem.MID && cropOrItem.SMALL) {
          code = `${cropOrItem.LARGE}${cropOrItem.MID}${cropOrItem.SMALL}`;
        } else if (cropOrItem.itemCode && cropOrItem.varietyCode) {
          code = cropOrItem.itemCode + cropOrItem.varietyCode;
        } else if (cropOrItem.itemCode) {
          code = cropOrItem.itemCode;
        } else {
          alert('해당 품종의 코드 정보를 찾을 수 없습니다.');
          return;
        }
        const cropInfo = {
          name: cropOrItem.itemName,
          category: cropOrItem.categoryName,
          varieties: [{
            name: cropOrItem.varietyName,
            code: code
          }]
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
        setSelectedItemCode(code);
        setNewCropName('');
        setIsAddCropModalVisible(false);
        setShowPopularCrops(true);
        setVarietyList([]);
        setVarietySearchText('');
        loadPriceData();
      } catch (error) {
        alert('작물 추가 중 오류가 발생했습니다.');
      }
      return;
    }
    // 기존 string(직접입력) 로직
    if (typeof cropOrItem === 'string' && cropOrItem.trim()) {
      try {
        const searchResults = await MarketPriceService.getItemCodes(cropOrItem.trim());
        if (searchResults && ((searchResults.fruits && searchResults.fruits.length > 0) || (searchResults.vegetables && searchResults.vegetables.length > 0))) {
          // 기존 로직 유지
          // ... (생략: 기존 string 처리)
        } else {
          alert('해당 작물의 품목 코드를 찾을 수 없습니다. 다른 이름으로 시도해주세요.');
        }
      } catch (error) {
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
    console.log('선택된 작물:', crop);
    
    setSelectedCrop(crop);
    
    if (!crop) {
      console.log('작물 정보가 없습니다.');
      return;
    }

    // 1. code가 있는 경우
    if (crop.code) {
      const found = itemCodeData.find(item => 
        (item.itemCode + item.varietyCode) === crop.code ||
        item.itemCode === crop.code
      );
      
      if (found) {
        setSelectedLarge(found.categoryCode?.toString() || '');
        setSelectedMid(found.itemCode?.toString() || '');
        setSelectedSmall(found.varietyCode?.toString() || '');
        setSelectedCmpcd(found.CMPCD || '');
        setSelectedItemCode(crop.code);
        loadPriceData(); // 작물 선택 시 즉시 시세 조회
      } else {
        console.log('code로 정보를 찾을 수 없습니다:', crop.code);
        setSelectedLarge('');
        setSelectedMid('');
        setSelectedSmall('');
        setSelectedCmpcd('');
        setSelectedItemCode('');
      }
      return;
    }

    // 2. varieties가 있는 경우
    if (crop.varieties && crop.varieties.length > 0) {
      handleSelectVariety(crop.varieties[0]);
      return;
    }

    // 3. itemName과 varietyName이 있는 경우
    if (crop.itemName && crop.varietyName) {
      const found = itemCodeData.find(item =>
        item.itemName === crop.itemName && item.varietyName === crop.varietyName
      );
      
      if (found) {
        setSelectedLarge(found.categoryCode?.toString() || '');
        setSelectedMid(found.itemCode?.toString() || '');
        setSelectedSmall(found.varietyCode?.toString() || '');
        setSelectedCmpcd(found.CMPCD || '');
        setSelectedItemCode((found.itemCode || '') + (found.varietyCode || ''));
        loadPriceData(); // 작물 선택 시 즉시 시세 조회
      } else {
        console.log('이름으로 정보를 찾을 수 없습니다:', crop.itemName, crop.varietyName);
        setSelectedLarge('');
        setSelectedMid('');
        setSelectedSmall('');
        setSelectedCmpcd('');
        setSelectedItemCode('');
      }
      return;
    }
  };

  // 인기 작물 선택
  const handleSelectPopularCrop = async (cropName) => {
    try {
      setNewCropName(cropName);
      setShowPopularCrops(false);
      setVarietySearchText('');
      let varieties = [];
      const norm = s => (s || '').replace(/\s/g, '').toLowerCase();
      const match = (item, keyword) =>
        norm(item.categoryName).includes(norm(keyword)) ||
        norm(item.itemName).includes(norm(keyword)) ||
        norm(item.varietyName).includes(norm(keyword));
      if (cropName === '벼') {
        varieties = itemCodeData.filter(item => norm(item.categoryName) === '미곡류');
      } else if (cropName === '감자') {
        varieties = itemCodeData.filter(item => match(item, '감자'));
      } else if (cropName === '옥수수') {
        varieties = itemCodeData.filter(item => match(item, '옥수수'));
      } else if (cropName === '땅콩') {
        varieties = itemCodeData.filter(item => match(item, '콩'));
      } else if (cropName === '버섯') {
        varieties = itemCodeData.filter(item => norm(item.categoryName) === '버섯류');
      } else {
        varieties = itemCodeData.filter(item => match(item, cropName));
      }
      // 중복 제거 (itemName+varietyName 기준)
      varieties = varieties.filter((item, idx, arr) =>
        arr.findIndex(x => x.itemName === item.itemName && x.varietyName === item.varietyName) === idx
      );
      setVarietyList(varieties);
    } catch (error) {
      setVarietyList([]);
      setShowPopularCrops(true);
      alert('인기 작물 선택 중 오류가 발생했습니다.');
    }
  };

  // 품종 선택
  const handleSelectVariety = (variety) => {
    console.log('선택된 품종:', variety); // 디버깅용 로그
    
    if (!variety) {
      console.log('품종 정보가 없습니다.');
      return;
    }

    // 1. code가 있는 경우
    if (variety.code) {
      console.log('code로 검색:', variety.code);
      const found = itemCodeData.find(item => 
        (item.itemCode + item.varietyCode) === variety.code ||
        item.itemCode === variety.code
      );
      
      if (found) {
        console.log('찾은 정보:', found);
        setSelectedLarge(found.categoryCode?.toString() || '');
        setSelectedMid(found.itemCode?.toString() || '');
        setSelectedSmall(found.varietyCode?.toString() || '');
        setSelectedCmpcd(found.CMPCD || '');
        setSelectedItemCode(variety.code);
        setTimeout(() => loadPriceData(), 0);
      } else {
        console.log('code로 정보를 찾을 수 없습니다:', variety.code);
        setSelectedLarge('');
        setSelectedMid('');
        setSelectedSmall('');
        setSelectedCmpcd('');
        setSelectedItemCode('');
      }
      return;
    }

    // 2. itemName과 varietyName이 있는 경우
    if (variety.itemName && variety.varietyName) {
      console.log('이름으로 검색:', variety.itemName, variety.varietyName);
      const found = itemCodeData.find(item =>
        item.itemName === variety.itemName && item.varietyName === variety.varietyName
      );
      
      if (found) {
        console.log('찾은 정보:', found);
        setSelectedLarge(found.categoryCode?.toString() || '');
        setSelectedMid(found.itemCode?.toString() || '');
        setSelectedSmall(found.varietyCode?.toString() || '');
        setSelectedCmpcd(found.CMPCD || '');
        setSelectedItemCode((found.itemCode || '') + (found.varietyCode || ''));
        setTimeout(() => loadPriceData(), 0);
      } else {
        console.log('이름으로 정보를 찾을 수 없습니다:', variety.itemName, variety.varietyName);
        setSelectedLarge('');
        setSelectedMid('');
        setSelectedSmall('');
        setSelectedCmpcd('');
        setSelectedItemCode('');
      }
      return;
    }

    // 3. 그 외의 경우
    console.log('지원하지 않는 형식의 품종 정보입니다:', variety);
    setSelectedLarge('');
    setSelectedMid('');
    setSelectedSmall('');
    setSelectedCmpcd('');
    setSelectedItemCode('');
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
  const loadMarketCodes = async () => {
    try {
      const codes = await MarketPriceService.getMarketCodes();
      if (codes && codes.length > 0) {
        setMarketCodes(codes);
        console.log('도매시장 코드 로드 완료:', codes);
        return codes;
      } else {
        console.log('도매시장 코드를 찾을 수 없습니다.');
        return [];
      }
    } catch (error) {
      console.error('도매시장 코드 로드 실패:', error);
      return [];
    }
  };

  // 시세 데이터 로드
  const loadPriceData = async () => {
    // 필수 파라미터 체크
    if (!selectedLarge || !selectedMid) {
      console.log('품목 코드가 선택되지 않았습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDate(selectedDate);
      console.log('시세 조회 시작:', {
        날짜: formattedDate,
        품목: {
          대분류: selectedLarge,
          중분류: selectedMid,
          소분류: selectedSmall
        }
      });

      // 도매시장 코드 로드
      let codesToUse = marketCodes;
      if (marketCodes.length === 0) {
        codesToUse = await loadMarketCodes();
        if (!codesToUse || codesToUse.length === 0) {
          throw new Error('도매시장 코드를 불러올 수 없습니다.');
        }
      }

      // 모든 도매시장에 대해 시세 조회
      const pricePromises = codesToUse.map(market => 
        MarketPriceService.getDailyPrice({
          whsalcd: market.CODEID,
          saledate: formattedDate,
          large: selectedLarge,
          mid: selectedMid,
          small: selectedSmall || ''
        })
      );

      const results = await Promise.all(pricePromises);
      const allPrices = results.flat().filter(price => price && price.AUCNGDE); // 유효한 데이터만 필터링

      if (allPrices.length === 0) {
        throw new Error(`${formattedDate} 날짜의 시세 데이터를 찾을 수 없습니다.`);
      }

      console.log('시세 조회 완료:', {
        조회된데이터수: allPrices.length,
        첫번째데이터: allPrices[0]
      });

      setDailyPrices(allPrices);
      setMarketPrices(allPrices);
      setLoading(false);
    } catch (err) {
      console.error('시세 데이터 로드 실패:', err.message);
      setError(err.message || '시세 데이터 로드 실패');
      setLoading(false);
    }
  };

  // 작물이나 탭이 변경될 때 데이터 다시 로드
  useEffect(() => {
    if (selectedItemCode) {
      loadPriceData();
    }
  }, [selectedItemCode, selectedTab]);

  // 달력에서 날짜 선택
  const handleDateSelect = (date) => {
    console.log('달력에서 선택된 날짜:', formatDate(date));
    setSelectedDate(date);
    setIsCalendarVisible(false);
    if (selectedLarge && selectedMid) { // 필수 파라미터가 있는 경우에만 시세 조회
      loadPriceData();
    }
  };

  // 달력에 표시할 날짜들 생성
  const getCalendarDates = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const dates = [];

    // 이번 달의 첫째 날이 무슨 요일인지(0:일~6:토)
    const startDay = firstDay.getDay();
    // 이번 달의 마지막 날짜
    const endDate = lastDay.getDate();

    // 이전 달의 마지막 날짜
    const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    // 이전 달 날짜 채우기 (실제 날짜 객체)
    for (let i = startDay - 1; i >= 0; i--) {
      dates.push(new Date(selectedYear, selectedMonth - 1, prevMonthLastDay - i));
    }
    // 이번 달 날짜 채우기
    for (let i = 1; i <= endDate; i++) {
      dates.push(new Date(selectedYear, selectedMonth, i));
    }
    // 다음 달 날짜 채우기 (실제 날짜 객체)
    let nextMonthDay = 1;
    while (dates.length % 7 !== 0) {
      dates.push(new Date(selectedYear, selectedMonth + 1, nextMonthDay++));
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
            {/* 인기작물/직접입력 단계 */}
            {showPopularCrops ? (
              <>
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
                  onPress={async () => {
                    if (newCropName.trim()) {
                      setShowPopularCrops(false);
                      setVarietySearchText('');
                      let varieties = [];
                      const norm = s => (s || '').replace(/\s/g, '').toLowerCase();
                      const match = (item, keyword) =>
                        norm(item.categoryName).includes(norm(keyword)) ||
                        norm(item.itemName).includes(norm(keyword)) ||
                        norm(item.varietyName).includes(norm(keyword));
                      if (newCropName.trim() === '벼') {
                        varieties = itemCodeData.filter(item => norm(item.categoryName) === '미곡류');
                      } else if (newCropName.trim() === '감자') {
                        varieties = itemCodeData.filter(item => match(item, '감자'));
                      } else if (newCropName.trim() === '옥수수') {
                        varieties = itemCodeData.filter(item => match(item, '옥수수'));
                      } else if (newCropName.trim() === '땅콩') {
                        varieties = itemCodeData.filter(item => match(item, '콩'));
                      } else if (newCropName.trim() === '버섯') {
                        varieties = itemCodeData.filter(item => norm(item.categoryName) === '버섯류');
                      } else {
                        varieties = itemCodeData.filter(item => match(item, newCropName.trim()));
                      }
                      // 중복 제거 (itemName+varietyName 기준)
                      varieties = varieties.filter((item, idx, arr) =>
                        arr.findIndex(x => x.itemName === item.itemName && x.varietyName === item.varietyName) === idx
                      );
                      setVarietyList(varieties);
                    }
                  }}
                >
                  <Text style={styles.directInputText}>직접 추가하기</Text>
                </TouchableOpacity>
                {/* 인기작물/품종 리스트 분기 */}
                <Text style={styles.popularCropsTitle}>인기작물 TOP 21</Text>
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
              </>
            ) : (
              <>
                {/* 뒤로가기 버튼 */}
                <TouchableOpacity onPress={() => { setShowPopularCrops(true); setVarietyList([]); setVarietySearchText(''); }} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 18 }}>← 인기작물로 돌아가기</Text>
                </TouchableOpacity>
                <Text style={styles.popularCropsTitle}>품종 선택</Text>
                {/* 품종 검색창 */}
                <TextInput
                  style={[styles.input, { marginBottom: 10 }]}
                  value={varietySearchText}
                  onChangeText={setVarietySearchText}
                  placeholder="품종명을 입력하세요"
                  placeholderTextColor="#999"
                />
                {(() => {
                  // 품종명 필터링
                  const norm = s => (s || '').replace(/\s/g, '').toLowerCase();
                  const filtered = varietyList.filter(item =>
                    norm(item.varietyName).includes(norm(varietySearchText))
                  );
                  if (filtered.length === 0) {
                    return <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>해당 작물의 품종 정보가 없습니다.</Text>;
                  }
                  return filtered.map((item, idx) => (
                    <TouchableOpacity key={idx} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => handleAddCrop(item)}>
                      <Text style={{ fontSize: 16, color: '#009944', fontWeight: 'bold' }}>{item.itemName}</Text>
                      <Text style={{ fontSize: 15, color: '#222', marginLeft: 10 }}>{item.varietyName}</Text>
                    </TouchableOpacity>
                  ));
                })()}
              </>
            )}
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
            {/* 7일씩 끊어서 한 주씩 렌더링 */}
            {(() => {
              const weeks = [];
              const calendarDates = getCalendarDates();
              for (let i = 0; i < calendarDates.length; i += 7) {
                const week = calendarDates.slice(i, i + 7);
                weeks.push(
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    {week.map((date, idx) => (
                      date ? (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.calendarDay,
                            date.getMonth() !== selectedMonth && styles.calendarDayOtherMonth,
                            date.toDateString() === selectedDate.toDateString() && styles.selectedDate
                          ]}
                          onPress={() => handleDateSelect(date)}
                        >
                          <Text style={[
                            styles.calendarDayText,
                            date.getDay() === 0 && { color: '#FF0000' }, // 일요일 빨간색
                            date.getDay() === 6 && { color: '#0000FF' }, // 토요일 파란색
                            date.toDateString() === selectedDate.toDateString() && styles.selectedDateText,
                            date.getMonth() !== selectedMonth && { color: '#999' } // 이전/다음 달 날짜 회색
                          ]}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View key={idx} style={[styles.calendarDay, { backgroundColor: 'transparent' }]} />
                      )
                    ))}
                  </View>
                );
              }
              return weeks;
            })()}
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
      ) : !selectedItemCode ? (
        <Text style={styles.noDataText}>품종을 선택해주세요.</Text>
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

  // 날짜 YYYYMMDD 포맷 함수
  function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }

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