import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../Components/Css/FarmInfo/MarketPriceStyle';
import { getTodayWeather } from '../Components/Utils/weatherUtils';

// 인기작물 리스트 (MarketPriceScreen에서 복사)
const popularCrops = [
  { name: '벼', icon: '🌾' }, { name: '배추', icon: '🥬' }, { name: '양파', icon: '🧅' },
  { name: '감자', icon: '🥔' }, { name: '사과', icon: '🍎' }, { name: '고추', icon: '🌶️' },
  { name: '마늘', icon: '🧄' }, { name: '배', icon: '🍐' }, { name: '고구마', icon: '🍠' },
  { name: '수박', icon: '🍉' }, { name: '포도', icon: '🍇' }, { name: '옥수수', icon: '🌽' },
  { name: '토마토', icon: '🍅' }, { name: '오이', icon: '🥒' }, { name: '가지', icon: '🍆' },
  { name: '복숭아', icon: '🍑' }, { name: '딸기', icon: '🍓' }, { name: '땅콩', icon: '🥜' },
  { name: '버섯', icon: '🍄' }, { name: '당근', icon: '🥕' }, { name: '망고', icon: '🥭' },
];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 파싱 보정 함수 추가
function parseDiaryDate(date) {
  if (!date) return new Date();
  if (typeof date === 'string') {
    if (date.includes('T')) {
      // ISO 포맷
      return new Date(date);
    } else if (date.match(/^\d{4}\.\d{1,2}\.\d{1,2}$/)) {
      // 점(.)포맷 → 하이픈(-)으로 변환 후 new Date
      return new Date(date.replace(/\./g, '-'));
    }
  }
  // 그 외: 오늘 날짜
  return new Date();
}

export default function DiaryWrite() {
  const navigation = useNavigation();
  const route = useRoute();
  const { editMode, diaryData, diaryIndex } = route.params || {};
  const [phoneState, setPhoneState] = useState(null);
  
  // phone 값 초기화
  useEffect(() => {
    const loadPhone = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.phone) {
            setPhoneState(user.phone);
            console.log('DiaryWrite에서 불러온 phone:', user.phone);
          }
        }
      } catch (e) {
        console.error('phone 불러오기 실패:', e);
      }
    };
    loadPhone();
  }, []);

  // 날짜 파싱 보정 적용
  const [selectedDate, setSelectedDate] = useState(editMode ? parseDiaryDate(diaryData.date) : new Date());
  const [calendarModal, setCalendarModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [varietyList, setVarietyList] = useState([]);
  const [selectedVariety, setSelectedVariety] = useState(editMode ? diaryData.crop : null);
  const [content, setContent] = useState(editMode ? diaryData.content : '');
  const [weather, setWeather] = useState(editMode ? diaryData.weather : '');
  const [itemCodeData, setItemCodeData] = useState([]);

  useEffect(() => {
    // itemCodeData를 비동기적으로 로드
    const loadItemCodeData = async () => {
      try {
        const data = await import('../Components/Utils/item_code_data.json');
        setItemCodeData(data.default || []);
      } catch (error) {
        console.error('작물 데이터 로딩 실패:', error);
        Alert.alert('오류', '작물 데이터를 불러오는데 실패했습니다.');
      }
    };
    loadItemCodeData();
  }, []);

  // 상단 헤더: ← 뒤로가기 + 중앙 타이틀
  const renderHeader = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, marginBottom: 8 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 0, paddingLeft: 8, zIndex: 2 }}>
        <Text style={{ fontSize: 28, color: '#222', fontWeight: 'bold' }}>←</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>일지 작성하기</Text>
      </View>
    </View>
  );

  // MarketPriceScreen 달력 UI 복제
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

  // MarketPriceScreen 달력 모달 복제
  const renderCalendarModal = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    let days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    const today = new Date();
    return (
      <Modal visible={calendarModal} transparent animationType="fade" onRequestClose={() => setCalendarModal(false)}>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, width: 350, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%' }}>
              <TouchableOpacity style={{ width: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                const prevMonth = new Date(year, month - 1, selectedDate.getDate());
                setSelectedDate(prevMonth);
              }}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>◀</Text>
              </TouchableOpacity>
              <Text style={{ flex: 1, fontSize: 26, fontWeight: 'bold', textAlign: 'center' }}>{year}년 {month + 1}월</Text>
              <TouchableOpacity style={{ width: 44, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                const nextMonth = new Date(year, month + 1, selectedDate.getDate());
                setSelectedDate(nextMonth);
              }}>
                <Text style={{ fontSize: 28, textAlign: 'center' }}>▶</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {weekDays.map((w, i) => (
                  <Text key={i} style={{ color: i === 0 ? '#FF0000' : i === 6 ? '#0000FF' : '#222', fontWeight: 'bold', fontSize: 20, textAlign: 'center', width: 44 }}>{w}</Text>
                ))}
              </View>
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
                {week.map((d, di) => {
                  if (d === null) {
                    return <View key={di} style={{ width: 44, height: 44 }} />;
                  }
                  const dateObj = new Date(year, month, d);
                  const isToday = dateObj.toDateString() === today.toDateString();
                  const isSelected = dateObj.toDateString() === selectedDate.toDateString();
                  return (
                    <View key={di} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: isToday ? 2 : 0,
                          borderColor: isToday ? '#000' : 'transparent',
                          backgroundColor: isSelected ? '#000' : 'transparent',
                          borderRadius: 12,
                          width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
                        }}
                        onPress={() => { setSelectedDate(new Date(year, month, d)); setCalendarModal(false); }}
                      >
                        <Text style={{
                          color: isSelected ? '#fff' : (di === 0 ? '#FF0000' : di === 6 ? '#0000FF' : '#222'),
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontSize: 22,
                          textAlign: 'center'
                        }}>{d}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
            <TouchableOpacity style={{ marginTop: 16, backgroundColor: '#eee', borderRadius: 8, padding: 12, width: '100%' }} onPress={() => setCalendarModal(false)}>
              <Text style={{ fontSize: 22, textAlign: 'center' }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // MarketPriceScreen 작물추가 버튼/모달/검색/인기작물/품종리스트/모달헤더 복제
  const openModal = () => {
    setModalVisible(true);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSearchText('');
    setSelectedCrop(null);
    setVarietyList([]);
  };
  const handlePopularCropSelect = (crop) => {
    setSearchText(crop.name);
    setSelectedCrop(crop.name);
    const filtered = itemCodeData.filter(item => item.itemName === crop.name);
    const uniqueVarieties = Array.from(new Set(filtered.map(item => item.varietyName)));
    setVarietyList(uniqueVarieties.map(v => `${crop.name} | ${v}`));
  };
  useEffect(() => {
    if (searchText === '') {
      setVarietyList([]);
      setSelectedCrop(null);
      return;
    }
    const filtered = itemCodeData.filter(
      (item) => (item.itemName && item.itemName.includes(searchText)) || (item.varietyName && item.varietyName.includes(searchText))
    );
    const uniquePairs = Array.from(new Set(filtered.map(item => `${item.itemName} | ${item.varietyName}`)));
    setVarietyList(uniquePairs);
    const cropMatch = filtered.find(item => item.itemName && item.itemName.includes(searchText));
    setSelectedCrop(cropMatch ? cropMatch.itemName : null);
  }, [searchText]);
  const handleVarietySelect = (varietyPair) => {
    setSelectedVariety(varietyPair);
    setModalVisible(false);
  };
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
      <TouchableOpacity onPress={() => { setSelectedCrop(null); setSearchText(''); setVarietyList([]); }}>
        <Text style={{ color: '#4A90E2', marginTop: 16, textAlign: 'center', fontSize: 18 }}>인기작물로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // MarketPriceScreen 작물추가 모달 완전 동일하게 복제
  const renderCropModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {renderModalHeader()}
          {/* 검색창 */}
          <TextInput
            style={[styles.input, { fontSize: 20 }]}
            placeholder="작물 이름을 입력하세요"
            value={searchText}
            onChangeText={setSearchText}
          />
          {/* 직접 추가하기 버튼 */}
          <TouchableOpacity 
            style={{ backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 14, marginVertical: 10 }}
            onPress={handleDirectAdd}
          >
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
  );

  // 등록 버튼 클릭 시 저장
  const handleSave = async () => {
    try {
        if (!selectedDate || !selectedVariety || !content) {
            Alert.alert('알림', '모든 항목을 입력해주세요.');
            return;
        }
        // phone 값이 없으면 저장 시도하지 않음
        if (!phoneState) {
            Alert.alert('오류', '사용자 전화번호 정보가 없습니다.');
            return;
        }
        console.log('저장 시도하는 phone 값:', phoneState);
        const API_URL = 'http://192.168.35.144:3000';
        const response = await fetch(`${API_URL}/diary/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            diary_date: selectedDate.toISOString(),
            crop_type: selectedVariety,
            content: content,
            user_phone: phoneState // 반드시 포함
          })
        });
        const result = await response.json();
        if (response.ok) {
          Alert.alert('알림', '영농일지가 저장되었습니다.');
          navigation.goBack();
        } else {
          Alert.alert('오류', result.error || '영농일지 저장에 실패했습니다.');
        }
    } catch (e) {
        console.error('영농일지 저장 실패:', e);
        Alert.alert('오류', '영농일지 저장에 실패했습니다.');
    }
  };

  // 직접 추가하기 버튼 핸들러
  const handleDirectAdd = () => {
    if (!searchText.trim()) {
      Alert.alert('입력 오류', '작물 이름을 입력해주세요.');
      return;
    }
    setSelectedVariety(`${searchText} | 직접 추가`);
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={{padding:24, backgroundColor:'#fff', flexGrow:1}}>
      {renderHeader()}
      {renderCalendar()}
      {renderCalendarModal()}
      {renderCropModal()}
      <View style={{height:18}} />
      <Text style={{fontSize:22, fontWeight:'bold', marginBottom:6}}>어떤 작물의 일지인가요?</Text>
      <TouchableOpacity onPress={openModal} style={{borderWidth:1, borderColor:'#bbb', borderRadius:8, padding:12, marginBottom:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        {selectedVariety ? (
          (() => {
            const [crop, variety] = selectedVariety.split(' | ');
            return (
              <View style={{flex:1, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={{fontSize:18}}>
                  <Text style={{color:'#4CAF50', fontWeight:'bold'}}>{crop}</Text>
                  <Text> | {variety}</Text>
                </Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedVariety(null);
                  }}
                  style={{padding:4}}
                >
                  <Text style={{fontSize:20, color:'#666'}}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })()
        ) : (
          <Text style={{fontSize:16}}>+ 작물 추가</Text>
        )}
      </TouchableOpacity>
      <View style={{height:18}} />
      <Text style={{fontSize:22, fontWeight:'bold', marginBottom:6}}>어떤 작업을 하셨나요?</Text>
      <TextInput 
        style={{borderWidth:1, borderColor:'#bbb', borderRadius:8, padding:12, minHeight:120, fontSize:16, marginBottom:16, marginTop:8}} 
        placeholder={'작업한 내용을 적어보세요.\n예시) 복숭아 수확, 비료 살포'} 
        value={content} 
        onChangeText={setContent} 
        multiline
      />
      <TouchableOpacity style={{backgroundColor:'#22c55e', borderRadius:12, paddingVertical:14, alignItems:'center'}} onPress={handleSave}>
        <Text style={{color:'#fff', fontWeight:'bold', fontSize:18}}>{editMode ? '수정하기' : '등록'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 