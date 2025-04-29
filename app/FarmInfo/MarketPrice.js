import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketPriceService } from './MarketPriceService';

const API_KEY = 'ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa';

export default function MarketPrice() {
  const [selectedTab, setSelectedTab] = useState('경매내역');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCrop, setSelectedCrop] = useState('그레이트');
  const [loading, setLoading] = useState(false);
  const [dailyPrices, setDailyPrices] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [error, setError] = useState(null);
  const [itemCodes, setItemCodes] = useState([]);

  // 품목 코드 로드
  useEffect(() => {
    const loadItemCodes = async () => {
      try {
        const response = await MarketPriceService.getItemCodes();
        if (response.response.body.items) {
          setItemCodes(response.response.body.items);
          console.log('품목 코드 로드 성공:', response.response.body.items);
        }
      } catch (err) {
        console.error('품목 코드 로드 오류:', err);
      }
    };
    loadItemCodes();
  }, []);

  // 데이터 로드 함수
  const loadPriceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      if (selectedTab === '경매내역') {
        const data = await MarketPriceService.getDailyPrice('PA0000');
        if (data.response.body.items) {
          setDailyPrices(data.response.body.items);
          console.log('일일 시세 데이터:', data.response.body.items);
        }
      } else {
        const data = await MarketPriceService.getRegionalPrices('PA0000', '1101');
        if (data.response.body.items) {
          setMarketPrices(data.response.body.items);
          console.log('지역별 시세 데이터:', data.response.body.items);
        }
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 탭이나 날짜가 변경될 때 데이터 로드
  useEffect(() => {
    loadPriceData();
  }, [selectedTab, selectedDate]);

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
      <View style={styles.cropSelector}>
        <TouchableOpacity style={styles.selectedCropTab}>
          <Text style={styles.selectedCropText}>그레이트</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cropTab}>
          <Text style={styles.cropText}>복숭아</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cropTab}>
          <Text style={styles.cropText}>전체</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCropButton}>
          <Text style={styles.addCropText}>+ 작물 추가</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.columnTitle}>품종</Text>
            <Text style={styles.columnTitle}>규격/등급</Text>
            <Text style={styles.columnTitle}>물량</Text>
            <Text style={styles.columnTitle}>경락가</Text>
          </View>
          <ScrollView>
            {dailyPrices.map((item, index) => (
              <View key={index} style={styles.priceRow}>
                <Text style={styles.priceText}>{item.variety}</Text>
                <Text style={styles.priceText}>{item.spec}</Text>
                <Text style={styles.priceText}>{item.quantity}</Text>
                <Text style={[styles.priceText, styles.priceValue]}>{item.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.nationalPriceContainer}>
          <ScrollView>
            <View style={styles.marketSection}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketName}>서울가락도매</Text>
                <Text style={styles.totalVolume}>총 19,348kg</Text>
                <View style={styles.priceChange}>
                  <Text style={styles.changeLabel}>전일대비</Text>
                  <Text style={styles.decreaseText}>-350원(-12%)</Text>
                </View>
              </View>
              <View style={styles.priceDetails}>
                <Text>특 / 4kg 상자</Text>
                <Text>19,348kg</Text>
                <Text>그레이트</Text>
                <View style={styles.priceRange}>
                  <Text>9,820원/kg</Text>
                  <Text style={styles.highPrice}>최고 22,000원</Text>
                  <Text style={styles.lowPrice}>최저 4,000원</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cropSelector: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCropTab: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  cropTab: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCropText: {
    color: '#fff',
  },
  cropText: {
    color: '#000',
  },
  addCropButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addCropText: {
    color: '#666',
  },
  calendar: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateButton: {
    alignItems: 'center',
    padding: 8,
    marginRight: 16,
  },
  selectedDate: {
    backgroundColor: '#000',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
  },
  sundayText: {
    color: 'red',
  },
  selectedDateText: {
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  priceContainer: {
    flex: 1,
    padding: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  columnTitle: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  priceText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  priceValue: {
    color: '#ff0000',
  },
  nationalPriceContainer: {
    flex: 1,
    padding: 16,
  },
  marketSection: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalVolume: {
    fontSize: 14,
    color: '#666',
  },
  priceChange: {
    flexDirection: 'row',
  },
  changeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  decreaseText: {
    fontSize: 14,
    color: '#0000ff',
  },
  priceDetails: {
    marginTop: 8,
  },
  priceRange: {
    marginTop: 8,
  },
  highPrice: {
    color: '#ff0000',
  },
  lowPrice: {
    color: '#0000ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
}); 