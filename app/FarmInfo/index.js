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
    if (currentHour < 6) baseDate.setDate(baseDate.getDate() - 1);

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

    const itemRaw = midForecast?.response?.body?.items?.item;
    const itemArray = Array.isArray(itemRaw) ? itemRaw : itemRaw ? [itemRaw] : [];

    const hasValidForecast = (item) => {
      const keys = Object.keys(item || {});
      return keys.some((key) => /^wf[5-9](Am|Pm)?$/.test(key) || key === 'wf10');
    };

    const filteredItems = itemArray.filter((item) => hasValidForecast(item));
    console.log('[주간 날씨] 응답 원본 item:', itemArray);
    console.log('[주간 날씨] 필터링된 item:', filteredItems);

    // 🛠 수정: filteredItems가 존재할 경우 첫 번째 요소로 set
    if (midForecast?.response?.header?.resultCode === '00' && filteredItems.length > 0) {
      setWeeklyData(filteredItems[0]);
      console.log('[주간 날씨] 최종 파싱된 데이터:', filteredItems[0]);
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
      default: return '☀ ';
    }
  };

  const getEmojiForSky = (value) => {
    switch (value) {
      case '1': return '☀ ';
      case '3': return '⛅ ';
      case '4': return '☁ ';
      default: return '☀ ';
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
    const itemList = weeklyData?.response?.body?.items?.item;
  
    // itemList가 undefined 또는 비어있으면 에러 메시지 표시
    if (!itemList || (Array.isArray(itemList) && itemList.length === 0)) {
      console.log('[주간 날씨] itemList 없음 또는 비어있음:', itemList);
      return <Text style={styles.noWarning}>주간 예보 데이터 없음</Text>;
    }
  
    // item은 항상 첫 번째 항목 사용
    const item = Array.isArray(itemList) ? itemList[0] : itemList;
  
    console.log('[주간 날씨] 원시 데이터:', item);
  
    if (!item || typeof item !== 'object' || Object.keys(item).length === 0) {
      return <Text style={styles.noWarning}>주간 예보 데이터 없음</Text>;
    }
  
    const getEmoji = (text) => {
      if (!text) return '❓';
      if (text.includes('맑')) return '☀ ';
      if (text.includes('구름많')) return '⛅ ';
      if (text.includes('흐림')) return '☁ ';
      if (text.includes('비')) return '🌧 ';
      if (text.includes('눈')) return '❄ ';
      return '❓';
    };
  
    const dayList = [
      { am: 'wf5Am', pm: 'wf5Pm' },
      { am: 'wf6Am', pm: 'wf6Pm' },
      { am: 'wf7Am', pm: 'wf7Pm' },
      { am: 'wf8', pm: null },
      { am: 'wf9', pm: null },
      { am: 'wf10', pm: null },
    ];
  
    const today = new Date();
    const weeklyDates = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + 5 + i);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
  
    return (
      <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled={true}>
        {dayList.map((field, idx) => {
          const amText = item?.[field.am];
          const pmText = field.pm ? item?.[field.pm] : null;
          const emoji = `${getEmoji(amText)}${pmText ? '/ ' + getEmoji(pmText) : ''}`;
          const desc = `${amText || ''}${pmText ? ' / ' + pmText : ''}`;
          return (
            <View key={idx} style={styles.row}>
              <Text style={styles.time}>{weeklyDates[idx]}</Text>
              <Text style={styles.value}>{emoji}</Text>
              <Text style={styles.value}>{desc}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
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
        {loading ? <Text style={styles.loading}>로딩중...</Text> : renderForecast()}
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>[주간 날씨]</Text>
        {loading ? <Text style={styles.loading}>로딩중...</Text> : renderWeekly()}
      </View>

      <View style={styles.weatherBox}>
        <Text style={styles.sectionTitle}>[기상 특보]</Text>
        {loading ? <Text style={styles.loading}>로딩중...</Text> : renderWarning()}
      </View>
    </ScrollView>
  );
}
