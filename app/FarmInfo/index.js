// app/FarmInfo/index.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import styles from '../Components/Css/FarmInfo/index.js';

const getBaseDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 30);
  const yyyy = date.getFullYear();
  const mm = ('0' + (date.getMonth() + 1)).slice(-2);
  const dd = ('0' + date.getDate()).slice(-2);
  const hh = ('0' + date.getHours()).slice(-2);
  const min = date.getMinutes();
  const roundedMin = min < 30 ? '00' : '30';
  return {
    base_date: `${yyyy}${mm}${dd}`,
    base_time: `${hh}${roundedMin}`,
  };
};

const FarmInfo = () => {
  const [mode, setMode] = useState('farm');
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ latitude: 36.798464, longitude: 127.077581 });

  useEffect(() => {
    loadWeather();
  }, [mode]);

  const loadWeather = async () => {
    console.log('[LOG] 모드:', mode);

    let coords = location;

    if (mode === 'current') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('[ERROR] 위치 권한 거부');
        return;
      }
      const currentPosition = await Location.getCurrentPositionAsync({});
      coords = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };
      console.log('[LOG] 현위치 좌표:', coords);
      setLocation(coords);
    } else {
      console.log('[LOG] 농장 좌표:', coords);
    }

    console.log('[LOG] 모드: latlon');
    console.log('[LOG] 격자 변환 요청 좌표:', {
      lat: coords.latitude,
      lon: coords.longitude,
    });

    const grid = await fetchWeather('latlon', {
      lat: coords.latitude,
      lon: coords.longitude,
    });

    if (!grid) {
      console.error('[ERROR] 격자 정보 없음.');
      return;
    }

    console.log('[LOG] 격자 정보:', grid);

    const { base_date, base_time } = getBaseDateTime();
    console.log('[LOG] 기준 날짜:', base_date, '기준 시간:', base_time);

    const result = await fetchWeather('ultraFcst', {
      nx: grid.x,
      ny: grid.y,
      base_date,
      base_time,
    });

    console.log('[LOG] 날씨 API 원 응답:', JSON.stringify(result));

    if (!result || typeof result !== 'object' || result.response === undefined) {
      console.error('[ERROR] API 응답 오류:', result?.response);
      return;
    }

    console.log('[LOG] 날씨 데이터:', result);

    setWeatherData(result);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setMode('farm')} style={[styles.tab, mode === 'farm' && styles.activeTab]}>
          <Text style={styles.tabText}>내 농장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('current')} style={[styles.tab, mode === 'current' && styles.activeTab]}>
          <Text style={styles.tabText}>현 위치</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>오늘의 날씨</Text>
      {!weatherData ? (
        <Text style={styles.loading}>로딩중...</Text>
      ) : (
        <View style={styles.weatherBox}>
          <Text>기온: {weatherData.response?.body?.items?.item[0]?.fcstValue || '-'}°C</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>시간대별 날씨</Text>
      {weatherData ? (
        <Text>현재 초단기 예보 항목 중 일부만 표시됩니다.</Text>
      ) : (
        <Text style={styles.loading}>로딩중...</Text>
      )}

      <Text style={styles.sectionTitle}>주간 날씨</Text>
      <Text style={styles.subInfo}>준비 중</Text>
    </ScrollView>
  );
};

export default FarmInfo;
