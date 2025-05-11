import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { styles } from '../Components/Css/FarmInfo/MarketPriceStyle';
import itemCodeData from '../Components/Utils/item_code_data.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MARKET_API_KEY } from '../Components/API/apikey';
import { XMLParser } from 'fast-xml-parser';

// 인기작물 TOP21 (이모지 포함)
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

// 요일 한글
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// AsyncStorage 키
const STORAGE_KEY = 'selectedList';

// fast-xml-parser 설정
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => name === 'row',
});

// API 엔드포인트
const API_BASE = 'http://211.237.50.150:7080/openapi';
const ITEM_CODE_BASE = `${API_BASE}/${MARKET_API_KEY}/xml/Grid_20240626000000000668`;
const MARKET_CODE_URL = `${API_BASE}/${MARKET_API_KEY}/xml/Grid_20240625000000000661_1`;
const SETTLEMENT_URL = `${API_BASE}/${MARKET_API_KEY}/xml/Grid_20240625000000000653_1`;
const AUCTION_URL = `${API_BASE}/${MARKET_API_KEY}/xml/Grid_20240625000000000654_1`;

// 도매시장 코드 조회 (최대 1000건씩 반복 요청)
async function fetchMarketCodes() {
  const allRows = [];
  let start = 1;
  const pageSize = 1000;
  while (true) {
    const end = start + pageSize - 1;
    const url = `${MARKET_CODE_URL}/${start}/${end}`;
    try {
      const response = await axios.get(url);
      console.log(`[API] 도매시장 코드 원본 (${start}~${end}):`, response.data);
      const parsed = parser.parse(response.data);
      console.log(`[API] 도매시장 코드 파싱 (${start}~${end}):`, parsed);
      const rows = parsed.Grid_20240625000000000661_1?.row || [];
      if (rows.length === 0) break;
      allRows.push(...rows);
      if (rows.length < pageSize) break;
      start += pageSize;
    } catch (error) {
      console.error('[API] 도매시장 코드 조회 실패:', error);
      break;
    }
  }
  return allRows;
}

// 도매시장 실시간 경락 정보 (최대 1000건씩 반복 요청)
async function fetchAuctionPrice({ date, marketCode, large, mid, small }) {
  const allRows = [];
  let start = 1;
  const pageSize = 1000;
  while (true) {
    const end = start + pageSize - 1;
    const url = `${AUCTION_URL}/${start}/${end}`;
    // API 명세에 맞는 파라미터명으로 수정
    const params = {
      SALEDATE: date, // YYYYMMDD
      WHSALCD: marketCode,
      LARGE: large.toString().padStart(2, '0'),
      MID: mid.toString().padStart(2, '0'),
      SMALL: small.toString().padStart(2, '0'),
      // cmpcd는 제거
    };
    try {
      const response = await axios.get(url, { params });
      console.log(`[API] 실시간 경락 정보 원본 (${start}~${end}):`, response.data);
      const parsed = parser.parse(response.data);
      console.log(`[API] 실시간 경락 정보 파싱 (${start}~${end}):`, parsed);
      const rows = parsed.Grid_20240625000000000654_1?.row || [];
      if (rows.length === 0) break;
      allRows.push(...rows);
      if (rows.length < pageSize) break;
      start += pageSize;
    } catch (error) {
      console.error('[API] 실시간 경락 정보 조회 실패:', error);
      break;
    }
  }
  return allRows;
}

// 도매시장 정산 가격 정보 (최대 1000건씩 반복 요청)
async function fetchSettlementPrice({ date, marketCode, large, mid, small }) {
  const allRows = [];
  let start = 1;
  const pageSize = 1000;
  while (true) {
    const end = start + pageSize - 1;
    const url = `${SETTLEMENT_URL}/${start}/${end}`;
    // API 명세에 맞는 파라미터명으로 수정
    const params = {
      SALEDATE: date, // YYYYMMDD
      WHSALCD: marketCode,
      LARGE: large.toString().padStart(2, '0'),
      MID: mid.toString().padStart(2, '0'),
      SMALL: small.toString().padStart(2, '0'),
      // cmpcd는 제거
    };
    try {
      const response = await axios.get(url, { params });
      console.log(`[API] 정산 가격 정보 원본 (${start}~${end}):`, response.data);
      const parsed = parser.parse(response.data);
      console.log(`[API] 정산 가격 정보 파싱 (${start}~${end}):`, parsed);
      const rows = parsed.Grid_20240625000000000653_1?.row || [];
      if (rows.length === 0) break;
      allRows.push(...rows);
      if (rows.length < pageSize) break;
      start += pageSize;
    } catch (error) {
      console.error('[API] 정산 가격 정보 조회 실패:', error);
      break;
    }
  }
  return allRows;
}

export default function MarketPriceScreen() {
  // 모달, 검색, 선택 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarModal, setCalendarModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null); // 현재 모달에서 선택 중인 작물
  const [selectedVariety, setSelectedVariety] = useState(null); // 현재 모달에서 선택 중인 품종
  const [varietyList, setVarietyList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // 달력 날짜
  const [tab, setTab] = useState('경매내역'); // 탭 상태
  const [selectedList, setSelectedList] = useState([]); // 여러 작물/품종 저장
  const [selectedIndex, setSelectedIndex] = useState(null); // 메인화면에서 선택된 작물 인덱스
  const [marketCodes, setMarketCodes] = useState([]); // 도매시장 코드 목록
  const [itemCode, setItemCode] = useState(null); // 선택 품목코드
  const [auctionData, setAuctionData] = useState([]); // 실시간 경락 정보
  const [settlementData, setSettlementData] = useState([]); // 정산 가격 정보
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [loadingDots, setLoadingDots] = useState(''); // 로딩 점 상태 추가

  // 로딩 점 애니메이션 효과
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500); // 0.5초마다 점 추가
    } else {
      setLoadingDots('');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // AsyncStorage에서 선택된 품종/작물 복원
  useEffect(() => {
    const loadSelectedList = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setSelectedList(JSON.parse(saved));
      } catch (e) {
        console.error('AsyncStorage 복원 실패:', e);
      }
    };
    loadSelectedList();
  }, []);

  // 선택된 품종/작물 AsyncStorage에 저장
  useEffect(() => {
    const saveSelectedList = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedList));
      } catch (e) {
        console.error('AsyncStorage 저장 실패:', e);
      }
    };
    saveSelectedList();
  }, [selectedList]);

  // 페이지 진입 시 도매시장 코드 API 호출
  useEffect(() => {
    const loadMarketCodes = async () => {
      const codes = await fetchMarketCodes();
      setMarketCodes(codes || []);
    };
    loadMarketCodes();
  }, []);

  // 사용자가 작물/품종을 추가하거나, 선택된 작물을 변경할 때 API 호출
  useEffect(() => {
    // 선택된 작물/품종이 없으면 중단
    if (!selectedList.length || selectedIndex === null) return;
    const { crop, variety } = selectedList[selectedIndex];
    if (!crop || !variety) return;

    // item_code_data.json에서 해당 crop, variety의 코드 추출
    const itemInfo = itemCodeData.find(
      (item) => item.itemName === crop && item.varietyName === variety
    );
    if (!itemInfo) {
      console.log('[API] item_code_data.json에서 코드 정보 없음');
      setAuctionData([]);
      setSettlementData([]);
      setLoading(false);
      return;
    }
    // categoryCode, itemCode, varietyCode를 두 자리 문자열로 변환
    const large = itemInfo.categoryCode.toString().padStart(2, '0');
    const mid = itemInfo.itemCode.toString().padStart(2, '0');
    const small = itemInfo.varietyCode.toString().padStart(2, '0');

    const fetchAll = async () => {
      setLoading(true);
      setAuctionData([]);
      setSettlementData([]);
      try {
        // 실시간 경락 정보 (모든 도매시장 코드 반복)
        let auctionAll = [];
        for (const market of marketCodes) {
          const auctionRows = await fetchAuctionPrice({
            date: formatDate(selectedDate),
            marketCode: market.CODEID,
            large,
            mid,
            small,
          });
          auctionAll = auctionAll.concat(auctionRows);
        }
        setAuctionData(auctionAll);
        // 정산 가격 정보 (모든 도매시장 코드 반복)
        let settlementAll = [];
        for (const market of marketCodes) {
          const settlementRows = await fetchSettlementPrice({
            date: formatDate(selectedDate),
            marketCode: market.CODEID,
            large,
            mid,
            small,
          });
          settlementAll = settlementAll.concat(settlementRows);
        }
        setSettlementData(settlementAll);
      } catch (e) {
        console.error('[API] 전체 연동 실패:', e);
      }
      setLoading(false);
    };
    fetchAll();
  }, [selectedList, selectedIndex, selectedDate, marketCodes]);

  // 날짜 YYYYMMDD 포맷 함수
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // 모달 오픈 시 초기화
  const openModal = () => {
    setModalVisible(true);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };
  // 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };

  // 인기작물 클릭 시 해당 작물의 모든 품종(중복 없이) 완전 추출
  const handlePopularCropSelect = (crop) => {
    setSearchText(crop.name);
    setSelectedCrop(crop.name);
    // itemName이 정확히 일치하는 모든 varietyName 추출(중복 없이)
    const filtered = itemCodeData.filter(item => item.itemName === crop.name);
    const uniqueVarieties = Array.from(new Set(filtered.map(item => item.varietyName)));
    setVarietyList(uniqueVarieties.map(v => `${crop.name} | ${v}`));
  };

  // 검색창 입력 시 실시간 필터링
  useEffect(() => {
    if (searchText === '') {
      setVarietyList([]);
      setSelectedCrop(null);
      return;
    }
    // itemName(작물명) 또는 varietyName(품종명)에 검색어가 포함된 항목 필터링
    const filtered = itemCodeData.filter(
      (item) => (item.itemName && item.itemName.includes(searchText)) || (item.varietyName && item.varietyName.includes(searchText))
    );
    // 검색 결과를 '작물 | 품종' 형식으로 모두 표시(동일 품종명에 여러 작물일 때 모두)
    const uniquePairs = Array.from(new Set(filtered.map(item => `${item.itemName} | ${item.varietyName}`)));
    setVarietyList(uniquePairs);
    // 검색어가 작물명에 해당하면 selectedCrop 설정, 아니면 null
    const cropMatch = filtered.find(item => item.itemName && item.itemName.includes(searchText));
    setSelectedCrop(cropMatch ? cropMatch.itemName : null);
  }, [searchText]);

  // 품종 선택 시 여러 개 저장
  const handleVarietySelect = (varietyPair) => {
    let [crop, variety] = varietyPair.split(' | ');
    // 이미 선택된 조합은 추가하지 않음
    if (!selectedList.some(item => item.crop === crop && item.variety === variety)) {
      setSelectedList([...selectedList, { crop, variety }]);
    }
    setModalVisible(false);
  };

  // 메인화면에서 작물/품종 선택 시 인덱스 저장
  const handleSelectCrop = (idx) => {
    setSelectedIndex(idx);
  };

  // 작물/품종 삭제
  const handleDeleteCrop = (idx) => {
    setSelectedList(selectedList.filter((_, i) => i !== idx));
    if (selectedIndex === idx) setSelectedIndex(null);
  };

  // 선택된 작물/품종 리스트 렌더링 (여러 개, 간격/선택 효과, x버튼)
  const renderSelectedCrops = () => {
    if (!selectedList.length) return null;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {selectedList.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.cropTab,
              {
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: selectedIndex === idx ? '#000' : '#f0f0f0',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
            onPress={() => handleSelectCrop(idx)}
            activeOpacity={0.8}
          >
            <Text>
              <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 18 }}>{item.crop}</Text>
              <Text style={[styles.cropText, { color: selectedIndex === idx ? '#fff' : '#222', fontSize: 18 }]}> | {item.variety}</Text>
            </Text>
            {/* x버튼 */}
            <TouchableOpacity onPress={() => handleDeleteCrop(idx)} style={{ marginLeft: 8, padding: 2 }}>
              <Text style={{ color: selectedIndex === idx ? '#fff' : '#888', fontSize: 18, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 오늘이 포함된 한 주(일~토)만 정확히 7일만 표시, 한 주의 시작은 일요일, 양옆 여백
  const renderCalendar = () => {
    const today = new Date();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const date = selectedDate.getDate();
    const dayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(date - dayOfWeek);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 16 }}>
        <View style={{ width: 10 }} />
        <TouchableOpacity onPress={() => setCalendarModal(true)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{month + 1}월 ▼</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            {weekDays.map((w, i) => (
              <Text key={i} style={{ color: i === 0 ? '#FF0000' : i === 6 ? '#0000FF' : '#222', fontWeight: 'bold', fontSize: 16, textAlign: 'center', flex: 1 }}>{w}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            {weekDates.map((d, di) => {
              const dayIdx = d.getDay();
              const isToday = d.toDateString() === today.toDateString();
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = d.getMonth() === month;
              return (
                <View key={di} style={{ flex: 1, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      borderWidth: isToday ? 2 : 0,
                      borderColor: isToday ? '#000' : 'transparent',
                      backgroundColor: isSelected ? '#000' : 'transparent',
                      borderRadius: 8,
                      width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                    }}
                    onPress={() => setSelectedDate(new Date(d))}
                  >
                    <Text style={{
                      color: isSelected ? '#fff' : (isCurrentMonth ? (dayIdx === 0 ? '#FF0000' : dayIdx === 6 ? '#0000FF' : '#222') : '#bbb'),
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: 18
                    }}>{d.getDate()}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
        <View style={{ width: 10 }} />
      </View>
    );
  };

  // 달력 modal: 7일씩 줄 맞춤, 앞뒤 빈칸 포함, 날짜 정렬
  const renderCalendarModal = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    let days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    // 다음달 빈칸
    while (days.length < 42) days.push(null); // 6주(42칸)로 고정
    const weeks = [];
    for (let i = 0; i < 42; i += 7) weeks.push(days.slice(i, i + 7));
    const today = new Date();
    return (
      <Modal visible={calendarModal} transparent animationType="fade" onRequestClose={() => setCalendarModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: 320 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setSelectedDate(new Date(year, month - 1, 1))}><Text style={{ fontSize: 28 }}>◀</Text></TouchableOpacity>
              <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{year}년 {month + 1}월</Text>
              <TouchableOpacity onPress={() => setSelectedDate(new Date(year, month + 1, 1))}><Text style={{ fontSize: 28 }}>▶</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              {weekDays.map((w, i) => (
                <Text key={i} style={{ color: i === 0 ? '#FF0000' : i === 6 ? '#0000FF' : '#222', fontWeight: 'bold', fontSize: 16, textAlign: 'center', flex: 1 }}>{w}</Text>
              ))}
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                {week.map((d, di) => {
                  if (d === null) {
                    return <View key={di} style={{ width: 32, height: 32 }} />;
                  }
                  const dateObj = new Date(year, month, d);
                  const isToday = dateObj.toDateString() === today.toDateString();
                  const isSelected = dateObj.toDateString() === selectedDate.toDateString();
                  return (
                    <View key={di} style={{ flex: 1, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: isToday ? 2 : 0,
                          borderColor: isToday ? '#000' : 'transparent',
                          backgroundColor: isSelected ? '#000' : 'transparent',
                          borderRadius: 8,
                          width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
                        }}
                        onPress={() => setSelectedDate(new Date(year, month, d))}
                      >
                        <Text style={{
                          color: isSelected ? '#fff' : (di === 0 ? '#FF0000' : di === 6 ? '#0000FF' : '#222'),
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontSize: 18
                        }}>{d}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
            <TouchableOpacity style={{ marginTop: 16, backgroundColor: '#eee', borderRadius: 8, padding: 12 }} onPress={() => setCalendarModal(false)}>
              <Text style={{ fontSize: 18, textAlign: 'center' }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // 탭(경매내역/전국시세)
  const renderTabs = () => (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 12, borderBottomWidth: tab === '경매내역' ? 2 : 0, borderBottomColor: tab === '경매내역' ? '#000' : 'transparent' }} onPress={() => setTab('경매내역')}>
        <Text style={{ fontWeight: tab === '경매내역' ? 'bold' : 'normal' }}>경매내역</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ flex: 1, alignItems: 'center', padding: 12, borderBottomWidth: tab === '전국시세' ? 2 : 0, borderBottomColor: tab === '전국시세' ? '#000' : 'transparent' }} onPress={() => setTab('전국시세')}>
        <Text style={{ fontWeight: tab === '전국시세' ? 'bold' : 'normal' }}>전국시세</Text>
      </TouchableOpacity>
    </View>
  );

  // 경매내역 데이터 표시
  const renderAuctionData = () => {
    // 로딩/빈값 안내
    if (loading) {
      return (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#888', fontSize: 16 }}>시세 불러오는 중{loadingDots}</Text>
        </View>
      );
    }
    if (!auctionData.length) {
      return (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#888', fontSize: 16 }}>해당 날짜에 경매내역이 없습니다.</Text>
        </View>
      );
    }

    // 헤더(가이드라인) 두 줄로, 시세값과 완전히 정렬/스타일 일치, 두 줄 사이 구분선 완전 제거
    const header = (
      <View style={{ backgroundColor: '#fff', zIndex: 10 }}>
        {/* 첫 번째 줄: 품종, 규격/등급, 물량, 경락가 */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6 }}>
          <Text style={{ flex: 2.2, fontWeight: 'bold', fontSize: 17, textAlign: 'left' }}>품종</Text>
          <Text style={{ flex: 2.8, fontWeight: 'bold', fontSize: 17, textAlign: 'left' }}>규격/등급</Text>
          <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>물량</Text>
          <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 17, textAlign: 'right' }}>경락가</Text>
        </View>
        {/* 두 번째 줄: 도매사, 산지, (빈칸), 시간 */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#fff' }}>
          <Text style={{ flex: 2.2, fontSize: 15, color: '#444', textAlign: 'left' }}>도매사</Text>
          <Text style={{ flex: 2.8, fontSize: 15, color: '#444', textAlign: 'left' }}>산지</Text>
          <Text style={{ flex: 1, fontSize: 15, color: '#444', textAlign: 'center' }}></Text>
          <Text style={{ flex: 2, fontSize: 15, color: '#444', textAlign: 'right' }}>시간</Text>
        </View>
      </View>
    );

    return (
      <View style={{ flex: 1 }}>
        {header}
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {auctionData.map((item, index) => {
            // 시간 포맷팅 (24시간제 HH:MM)
            let time = '';
            if (item.SBIDTIME) {
              const t = item.SBIDTIME.split(' ')[1];
              if (t) {
                const [h, m] = t.split(':');
                time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
              }
            }
            // 경락가(가격) 포맷팅 (빨간색)
            const price = item.COST ? <Text style={{ color: '#FF0000', fontWeight: 'bold', fontSize: 17 }}>{Number(item.COST).toLocaleString()}원</Text> : '-';
            // 물량(단위 없음 시 '개'로)
            const qty = item.QTY ? Number(item.QTY) + '개' : '-';
            // 규격/등급: kg 표기 소수점 1자리, kg 뒤에 띄우고 단위 분리
            let std = item.STD ? item.STD : '-';
            std = std.replace(/(\d+\.\d{1,2})kg([^\s]*)/, (m, n, unit) => {
              let v = parseFloat(n);
              let kg = (v % 1 === 0) ? parseInt(v) + 'kg' : v.toFixed(1) + 'kg';
              return kg + (unit ? ' ' + unit : '');
            });
            // 품종
            const variety = item.SMALLNAME ? item.SMALLNAME : '-';
            // 도매사
            const cmp = item.CMPNAME ? item.CMPNAME : '-';
            // 산지: '시'까지 자르기
            let origin = item.SANNAME ? item.SANNAME : '-';
            const match = origin.match(/^(.*?시)/);
            if (match) origin = match[1];
            // 등급: 정산 가격 정보에서 매칭하여 가져오기
            let grade = '-';
            if (settlementData && settlementData.length > 0) {
              // settlementData에서 규격, 품종, 산지, 도매사, 날짜가 모두 일치하는 row 찾기
              const found = settlementData.find(row =>
                row.STD === item.STD &&
                row.SMALLNAME === item.SMALLNAME &&
                row.SANNAME === item.SANNAME &&
                row.CMPNAME === item.CMPNAME &&
                row.SALEDATE === item.SALEDATE
              );
              if (found && found.LVNAME) grade = found.LVNAME;
            }
            // 규격/등급 합치기 (예: 1.5kg 상자 / 특)
            const spec = std + ' / ' + grade;

            return (
              <View key={index} style={[styles.auctionItem, { paddingVertical: 10, paddingHorizontal: 16 }]}> 
                {/* 첫 줄: 품종, 규격/등급, 물량, 경락가 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ flex: 2.2, fontSize: 17, fontWeight: 'bold', color: '#222', textAlign: 'left' }}>{variety}</Text>
                  <Text style={{ flex: 2.8, fontSize: 17, color: '#444', textAlign: 'left' }}>{spec}</Text>
                  <Text style={{ flex: 1, fontSize: 17, color: '#444', textAlign: 'center' }}>{qty}</Text>
                  <Text style={{ flex: 2, fontSize: 17, fontWeight: 'bold', textAlign: 'right' }}>{price}</Text>
                </View>
                {/* 둘째 줄: 도매사, 산지, 시간 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 0 }}>
                  <Text style={{ flex: 2.2, fontSize: 15, color: '#444', textAlign: 'left' }} numberOfLines={1} ellipsizeMode="tail">{cmp}</Text>
                  <Text style={{ flex: 2.8, fontSize: 15, color: '#444', textAlign: 'left' }} numberOfLines={1} ellipsizeMode="tail">{origin}</Text>
                  <Text style={{ flex: 1, fontSize: 15, color: '#444', textAlign: 'center' }}></Text>
                  <Text style={{ flex: 2, fontSize: 15, color: '#444', textAlign: 'right' }} numberOfLines={1} ellipsizeMode="tail">{time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // 안내문구
  const renderGuide = () => (
    <View style={{ alignItems: 'center', marginTop: 32 }}>
      <Text style={{ color: '#888', fontSize: 16 }}>품종을 선택해주세요.</Text>
    </View>
  );

  // 인기작물/검색 결과 렌더링 (사진4 스타일, 3열 그리드, 회색 박스, 이모지+작물명, 스크롤뷰)
  const renderPopularCrops = () => (
    <>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, textAlign: 'left' }}>인기작물 TOP 21</Text>
      <ScrollView style={{ maxHeight: 320 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {popularCrops.map((crop, idx) => (
            <TouchableOpacity
              key={crop.name}
              style={{
                width: '30%',
                margin: '1.5%',
                backgroundColor: '#f5f5f5',
                borderRadius: 16,
                alignItems: 'center',
                paddingVertical: 18,
                paddingHorizontal: 0,
                minWidth: 90,
                maxWidth: 120,
              }}
              onPress={() => handlePopularCropSelect(crop)}
            >
              <Text style={{ fontSize: 40 }}>{crop.icon}</Text>
              <Text style={{ marginTop: 8, fontSize: 20, fontWeight: 'bold' }}>{crop.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );

  // 품종 리스트 렌더링
  const renderVarietyList = () => (
    <ScrollView style={{ maxHeight: 300 }}>
      {varietyList.map((varietyPair, idx) => {
        const [crop, variety] = varietyPair.split(' | ');
        return (
          <TouchableOpacity key={idx} style={styles.categoryItem} onPress={() => handleVarietySelect(varietyPair)}>
            <Text>
              <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 20 }}>{crop}</Text>
              <Text style={{ fontSize: 20 }}> | {variety}</Text>
            </Text>
          </TouchableOpacity>
        );
      })}
      {/* 인기작물로 돌아가기 버튼 */}
      <TouchableOpacity onPress={() => { setSelectedCrop(null); setSearchText(''); setVarietyList([]); }}>
        <Text style={{ color: '#4A90E2', marginTop: 16, textAlign: 'center', fontSize: 18 }}>인기작물로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // 작물추가 모달 상단: 중앙에 '작물 추가'만 굵고 크게, 왼쪽에 ←(뒤로가기) 아이콘만(텍스트 없이), 전체적으로 중앙정렬
  const renderModalHeader = () => (
    <>
      <View style={{ height: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <TouchableOpacity onPress={closeModal} style={{ position: 'absolute', left: 0, padding: 8 }}>
          <Text style={{ color: '#4A90E2', fontSize: 28, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>작물 추가</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* 작물 추가 버튼 */}
      <TouchableOpacity style={styles.addCropButton} onPress={openModal}>
        <Text style={styles.addCropText}>+ 작물 추가</Text>
      </TouchableOpacity>

      {/* 선택된 작물/품종 리스트 */}
      {renderSelectedCrops()}

      {/* 달력 */}
      {renderCalendar()}
      {renderCalendarModal()}

      {/* 탭 */}
      {renderTabs()}

      {/* 데이터 표시 영역 */}
      {!selectedList.length ? (
        renderGuide()
      ) : tab === '경매내역' ? (
        renderAuctionData()
      ) : (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#888', fontSize: 16 }}>전국시세 준비중입니다.</Text>
        </View>
      )}

      {/* Modal: 작물 추가 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {renderModalHeader()}
            <Text style={styles.modalSubTitle}>품종 선택</Text>
            {/* 검색창 */}
            <TextInput
              style={[styles.input, { fontSize: 20 }]}
              placeholder="작물 이름을 입력하세요"
              value={searchText}
              onChangeText={setSearchText}
            />
            {/* 직접 추가하기 버튼 */}
            <TouchableOpacity style={{ backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 14, marginVertical: 10 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>직접 추가하기</Text>
            </TouchableOpacity>
            {/* 인기작물 or 검색 결과 */}
            {varietyList.length === 0 && !selectedCrop ? (
              renderPopularCrops()
            ) : (
              renderVarietyList()
            )}
            {/* 취소 버튼 */}
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
              <Text style={[styles.modalButtonText, { fontSize: 20 }]}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
} 