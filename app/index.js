import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { fetchWeather } from './Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from './Components/Utils/timeUtils';
import { getMidLandRegId } from './Components/Utils/regionMapper';
import { useWeather } from './context/WeatherContext';

const FARM_COORDS = {
  latitude: 36.953862288,
  longitude: 127.681782599,
};

export default function Home() {
  const {
    setWeatherData,
    setShortTermData,
    setWeeklyData,
    setLocationName,
    setBaseTimeInfo,
    isLoading,
    setIsLoading
  } = useWeather();

  useEffect(() => {
    loadWeatherData();
  }, []);

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      return data.address.county || data.address.city || '위치 정보 없음';
    } catch (error) {
      console.error('[위치 정보] 오류:', error);
      return '위치 정보 없음';
    }
  };

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      
      // 위치 정보 먼저 가져오기
      const location = await getLocationName(FARM_COORDS.latitude, FARM_COORDS.longitude);
      setLocationName(location);

      const { base_date, base_time } = getBaseDateTime();
      const grid = calculateGrid(FARM_COORDS.latitude, FARM_COORDS.longitude);

      // 기준 시간 정보 설정
      const now = new Date();
      const currentHour = now.getHours();
      let baseTime;
      let baseDate = new Date(now);
      
      if (currentHour < 2) {
        baseDate.setDate(baseDate.getDate() - 1);
        baseTime = '2000';
      } else if (currentHour < 5) baseTime = '0200';
      else if (currentHour < 8) baseTime = '0500';
      else if (currentHour < 11) baseTime = '0800';
      else if (currentHour < 14) baseTime = '1100';
      else if (currentHour < 17) baseTime = '1400';
      else if (currentHour < 20) baseTime = '1700';
      else baseTime = '2000';
      
      const baseDateStr = `${baseDate.getFullYear()}${String(baseDate.getMonth() + 1).padStart(2, '0')}${String(baseDate.getDate()).padStart(2, '0')}`;
      
      setBaseTimeInfo({
        baseTime,
        baseDateStr
      });

      // API 호출 시작
      const [ultraFcst, shortTermFcst, midLandFcst, midTaFcst] = await Promise.all([
        fetchWeather('ultraFcst', {
          nx: grid.x,
          ny: grid.y,
          base_date,
          base_time,
        }),
        fetchWeather('villageFcst', {
          nx: grid.x,
          ny: grid.y,
          base_date,
          base_time,
        }),
        fetchWeather('midLandFcst', {
          regId: getMidLandRegId(FARM_COORDS.latitude, FARM_COORDS.longitude),
          tmFc: `${base_date}${base_time}`,
          pageNo: '1',
          numOfRows: '10',
          dataType: 'JSON'
        }),
        fetchWeather('midTa', {
          regId: getMidLandRegId(FARM_COORDS.latitude, FARM_COORDS.longitude),
          tmFc: `${base_date}${base_time}`,
          pageNo: '1',
          numOfRows: '10',
          dataType: 'JSON'
        })
      ]);

      // 날씨 데이터 상태 업데이트
      setWeatherData(ultraFcst);
      setShortTermData(shortTermFcst);
      
      // 중기예보 데이터 처리
      const landFcstData = midLandFcst?.response?.body?.items?.item?.[0] ?? null;
      const taFcstData = midTaFcst?.response?.body?.items?.item?.[0] ?? null;
      
      if (landFcstData || taFcstData) {
        setWeeklyData({
          ...landFcstData,
          ...taFcstData
        });
      }

      console.log('[날씨 데이터] 미리 로드 완료');
      setIsLoading(false);
    } catch (error) {
      console.error('[날씨 데이터] 미리 로드 중 오류:', error);
      setIsLoading(false);
    }
  };

  const calculateGrid = (lat, lon) => {
    const RE = 6371.00877;
    const GRID = 5.0;
    const SLAT1 = 30.0;
    const SLAT2 = 60.0;
    const OLON = 126.0;
    const OLAT = 38.0;
    const XO = 43;
    const YO = 136;

    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);

    let ra = Math.tan(Math.PI * 0.25 + (lat * DEGRAD) * 0.5);
    ra = re * sf / Math.pow(ra, sn);
    let theta = lon * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

    return { x, y };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>농장 정보</Text>
      </View>
      <View style={styles.content}>
        <Link href="/FarmInfo" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuContent}>
              <Text style={styles.menuIcon}>☀️</Text>
              <Text style={styles.menuText}>날씨</Text>
              {isLoading && <Text style={styles.loadingText}>(로딩중...)</Text>}
            </View>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuContent}>
            <Text style={styles.menuIcon}>🌱</Text>
            <Text style={styles.menuText}>작물 상태</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuContent}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>작물 시세</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '500',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
});