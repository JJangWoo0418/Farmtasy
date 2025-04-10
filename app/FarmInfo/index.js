// app/FarmInfo/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import styles from '../Components/Css/FarmInfo/index';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';

const FARM_COORDS = {
  latitude: 36.798464,
  longitude: 127.077581,
};

export default function FarmInfo() {
  const [mode, setMode] = useState('farm');
  const [weatherData, setWeatherData] = useState(null);
  const [warningData, setWarningData] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    console.log('[LOG] 모드:', mode);

    const coords = FARM_COORDS;
    console.log('[LOG] 농장 좌표:', coords);

    const { base_date, base_time } = getBaseDateTime();
    console.log('[LOG] 기준 날짜:', base_date, '기준 시간:', base_time);

    const grid = await fetchWeather('latlon', {
      lat: coords.latitude,
      lon: coords.longitude,
    });
    if (!grid || !grid.x || !grid.y) return;

    const forecast = await fetchWeather('ultraFcst', {
      nx: grid.x,
      ny: grid.y,
      base_date,
      base_time,
    });
    const warning = await fetchWeather('warning');

    if (!forecast) {
      console.error('[ERROR] 예보 API 응답 오류:', forecast);
    } else {
      console.log('[LOG] 예보 데이터:', forecast);
      setWeatherData(forecast);
    }

    if (!warning) {
      console.error('[ERROR] 특보 API 응답 오류:', warning);
    } else {
      console.log('[LOG] 특보 데이터:', warning);
      const warningText = typeof warning === 'string' ? warning : '';
      setWarningData(warningText);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, [mode]);

  const renderForecast = () => {
    const msg = weatherData?.OpenAPI_ServiceResponse?.cmmMsgHeader?.errMsg;
    const code = weatherData?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnReasonCode;
    if (msg) return `에러: ${msg} (코드 ${code})`;
    return JSON.stringify(weatherData);
  };

  const renderWarning = () => {
    if (!warningData || typeof warningData !== 'string') {
      return <Text>현재 발효 중인 특보가 없습니다.</Text>;
    }
    const lines = warningData
      .split('\n')
      .filter(line => line.trim().startsWith('L'));

    if (lines.length === 0) return <Text>현재 발효 중인 특보가 없습니다.</Text>;
    return lines.map((line, idx) => (
      <Text key={idx} style={{ marginBottom: 2 }}>{line}</Text>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        <Button title="내 농장 날씨" onPress={() => setMode('farm')} />
        <Button title="현 위치 날씨" onPress={() => setMode('current')} />
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>오늘의 날씨</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          <Text>{renderForecast()}</Text>
        )}
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>기상 특보</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderWarning()
        )}
      </View>
    </ScrollView>
  );
}
