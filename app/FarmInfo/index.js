// app/FarmInfo/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import styles from '../Components/Css/FarmInfo/index.js';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';
import { getMidLandRegId } from '../Components/Utils/regionMapper';
import * as Location from 'expo-location';

const FARM_COORDS = {
  latitude: 36.953862288,
  longitude: 127.681782599,
};

export default function FarmInfo() {
  const [mode, setMode] = useState('farm');
  const [weatherData, setWeatherData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [warningData, setWarningData] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    let coords = FARM_COORDS;
    console.log('[공통] 현재 설정된 농장 좌표:', coords);

    if (mode === 'current') {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('[공통] 위치 권한 거부됨');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('[공통] 현재 위치 좌표:', coords);
      } catch (error) {
        console.error('[공통] 현재 위치 가져오기 실패:', error);
        setLoading(false);
        return;
      }
    }

    const now = new Date();
    const currentHour = now.getHours();
    const baseDate = new Date(now);

    if (currentHour < 6) {
      baseDate.setDate(baseDate.getDate() - 1);
    }

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const tmFc = currentHour < 6 || currentHour >= 18 ? `${dateStr}1800` : `${dateStr}0600`;

    const { base_date, base_time } = getBaseDateTime();
    console.log('[공통] 기준 날짜 및 시간:', base_date, base_time);

    const grid = await fetchWeather('latlon', {
      lat: coords.latitude,
      lon: coords.longitude,
    });
    console.log('[격자변환] 결과:', grid);
    if (!grid || !grid.x || !grid.y) {
      setLoading(false);
      return;
    }

    console.log('[시간대별 날씨] 요청 좌표:', grid.x, grid.y);
    const forecast = await fetchWeather('ultraFcst', {
      nx: grid.x,
      ny: grid.y,
      base_date,
      base_time,
    });
    console.log('[시간대별 날씨] 응답:', forecast);

    const regId = getMidLandRegId(coords.latitude, coords.longitude);
    const midForecast = await fetchWeather('midLandFcst', { regId, tmFc });
    console.log('[주간 날씨] 요청 파라미터:', { regId, tmFc });
    console.log('[주간 날씨] 응답:', midForecast);

    const warning = await fetchWeather('warning');
    console.log('[기상 특보] 응답:', warning);

    if (forecast) setWeatherData(forecast);
    if (
      midForecast?.response?.header?.resultCode === '00' &&
      Array.isArray(midForecast?.response?.body?.items?.item)
    ) {
      const items = midForecast.response.body.items.item;
      const validItems = items.filter(item => item.wfAm || item.wfPm);
      setWeeklyData({ response: { body: { items: { item: validItems } } } });
    } else {
      console.warn('[주간 날씨] 유효하지 않은 응답 또는 데이터 없음:', midForecast);
    }
    if (typeof warning === 'string') setWarningData(warning);

    setLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, [mode]);

  const getEmojiForPty = (value) => {
    switch (value) {
      case '0': return '☀ ';
      case '1': return '🌧 ';
      case '2': return '🌦 ';
      case '3': return '❄ ';
      case '4': return '🌨 ';
      default: return '☁ ';
    }
  };

  const getEmojiForSky = (value) => {
    switch (value) {
      case '1': return '☀ ';
      case '3': return '⛅ ';
      case '4': return '☁ ';
      default: return '☁ ';
    }
  };

  const renderForecast = () => {
    const msg = weatherData?.response?.header?.resultMsg;
    const code = weatherData?.response?.header?.resultCode;
    if (msg !== 'NORMAL_SERVICE') return <Text style={styles.errorText}>에러: {msg} (코드 {code})</Text>;

    const items = weatherData?.response?.body?.items?.item || [];
    const categories = ['PTY', 'RN1', 'SKY', 'T1H', 'REH'];
    const grouped = {};

    for (const item of items) {
      if (!categories.includes(item.category)) continue;
      if (!grouped[item.fcstTime]) grouped[item.fcstTime] = {};
      grouped[item.fcstTime][item.category] = item.fcstValue;
    }

    console.log('[시간대별 날씨] 그룹화된 데이터:', grouped);

    const now = new Date();
    const currentHour = now.getHours();
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const aHour = parseInt(a);
      const bHour = parseInt(b);
      const offsetA = (aHour + 24 - currentHour) % 24;
      const offsetB = (bHour + 24 - currentHour) % 24;
      return offsetA - offsetB;
    });

    return (
      <ScrollView style={{ maxHeight: 600 }} nestedScrollEnabled={true}>
        {sortedTimes.map((time, idx) => {
          const data = grouped[time] || {};
          const pty = data['PTY'];
          const rn1 = data['RN1'];
          const sky = data['SKY'];
          const t1h = data.hasOwnProperty('T1H') ? ` ${data['T1H']} ℃ ` : ' - ';
          const reh = data.hasOwnProperty('REH') ? `${data['REH']}% ` : ' - ';
          const emoji = pty !== '0' ? getEmojiForPty(pty) : getEmojiForSky(sky);
          const rainInfo = rn1 ? (pty !== '0 ' && rn1 !== '강수없음 ' ? `${rn1}` : '강수없음 ') : '강수없음 ';
          const hour = `${String(time).padStart(4, '0').slice(0, 2)} 시`;

          return (
            <View key={idx} style={styles.row}>
              <Text style={styles.time}>{hour}</Text>
              <Text style={styles.value}>{emoji}</Text>
              <Text style={styles.value}>{rainInfo}</Text>
              <Text style={styles.value}>{t1h}</Text>
              <Text style={styles.value}>{reh}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderWeekly = () => {
    const items = weeklyData?.response?.body?.items?.item || [];
    console.log('[주간 날씨] 원시 데이터:', items);
    if (items.length === 0) return <Text style={styles.noWarning}>주간 예보 데이터 없음</Text>;

    const getEmoji = (text) => {
      if (text.includes('맑')) return '☀ ';
      if (text.includes('구름많')) return '⛅ ';
      if (text.includes('흐림')) return '☁ ';
      if (text.includes('비')) return '🌧 ';
      if (text.includes('눈')) return '❄ ';
      return '❓';
    };

    return items.map((item, idx) => (
      <View key={idx} style={styles.row}>
        <Text style={styles.time}>{item.fcstDate}</Text>
        <Text style={styles.value}>{getEmoji(item.wfAm)} / {getEmoji(item.wfPm)}</Text>
        <Text style={styles.value}>{item.wfAm} / {item.wfPm}</Text>
      </View>
    ));
  };

  const renderWarning = () => {
    const lines = typeof warningData === 'string'
      ? warningData.split('\n').filter(line => line.startsWith('L'))
      : [];
    console.log('[기상 특보] 파싱된 특보 라인:', lines);
    if (lines.length === 0) return <Text style={styles.noWarning}>현재 발효 중인 특보가 없습니다.</Text>;
    return lines.map((line, idx) => <Text key={idx} style={styles.warningLine}>{line}</Text>);
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <View style={styles.tabContainer}>
        <Button title="내 농장 날씨" onPress={() => setMode('farm')} />
        <Button title="현 위치 날씨" onPress={() => setMode('current')} />
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>[시간대별 날씨]</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderForecast()
        )}
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>[주간 날씨]</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderWeekly()
        )}
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>[기상 특보]</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderWarning()
        )}
      </View>
    </ScrollView>
  );
}
