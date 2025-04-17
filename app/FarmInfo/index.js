// app/FarmInfo/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
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
  const [selectedDate, setSelectedDate] = useState(null);

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
    
    // 주간 날씨와 온도 데이터를 함께 요청
    const [midForecast, midTemp] = await Promise.all([
      fetchWeather('midLandFcst', { regId, tmFc }),
      fetchWeather('midFcst', { regId, tmFc })
    ]);
    
    console.log('[주간 날씨] 요청 파라미터:', { regId, tmFc });
    console.log('[주간 날씨] 응답:', midForecast);
    console.log('[주간 온도] 응답:', midTemp);

    const warning = await fetchWeather('warning');
    console.log('[기상 특보] 응답:', warning);

    if (forecast) setWeatherData(forecast);

    const itemRaw = midForecast?.response?.body?.items?.item ?? null;
    const itemArray = Array.isArray(itemRaw) ? itemRaw : itemRaw ? [itemRaw] : [];

    const hasValidForecast = (item) => {
      const keys = Object.keys(item || {});
      return keys.some((key) => /^wf[4-9](Am|Pm)?$/.test(key) || key === 'wf10');
    };

    const filteredItems = itemArray.filter((item) => hasValidForecast(item));
    console.log('[주간 날씨] 응답 원본 item:', itemArray);
    console.log('[주간 날씨] 필터링된 item:', filteredItems);

    if (filteredItems.length > 0) {
      // 주간 날씨와 온도 데이터를 병합
      const weatherData = filteredItems[0];
      const tempData = midTemp?.response?.body?.items?.item?.[0] || {};
      
      const mergedData = {
        ...weatherData,
        ...tempData
      };
      
      setWeeklyData(mergedData);
      console.log('[주간 날씨] 최종 파싱된 데이터:', mergedData);
    } else {
      console.warn('[주간 날씨] 유효하지 않은 응답 또는 데이터 없음:', midForecast);
      setWeeklyData(null);
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

  const getDayOfWeek = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
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
    const currentHour = parseInt(now.getHours().toString().padStart(2, '0'));
    
    // 모든 시간대를 현재 시간 기준으로 정렬
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const aHour = parseInt(a.slice(0, 2));
      const bHour = parseInt(b.slice(0, 2));
      
      // 현재 시간과의 차이 계산
      let diffA = aHour - currentHour;
      let diffB = bHour - currentHour;
      
      // 음수인 경우 (다음날) 24를 더해서 보정
      if (diffA < 0) diffA += 24;
      if (diffB < 0) diffB += 24;
      
      return diffA - diffB;
    });

    // 현재 시간의 인덱스 찾기
    const currentTimeIndex = sortedTimes.findIndex(time => 
      parseInt(time.slice(0, 2)) === currentHour
    );

    return (
      <ScrollView 
        style={{ maxHeight: 600 }} 
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingVertical: 10 }}
      >
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
            <View 
              key={idx} 
              style={[
                styles.row,
                idx === currentTimeIndex && { backgroundColor: '#f0f0f0' }
              ]}
            >
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
    try {
      if (!weeklyData) {
        return <Text style={styles.noWarning}>주간 날씨 데이터 없음</Text>;
      }

      // 주간 날씨 데이터 로깅 추가
      console.log('[주간 날씨] 전체 데이터:', weeklyData);

      const getEmoji = (text) => {
        if (!text) return '❓';
        if (text.includes('맑')) return '☀ ';
        if (text.includes('구름많')) return '⛅ ';
        if (text.includes('흐림')) return '☁ ';
        if (text.includes('비')) return '🌧 ';
        if (text.includes('눈')) return '❄ ';
        return '❓';
      };

      // 날씨 데이터 매핑을 위한 키 배열
      const weatherKeys = [
        { am: 'wf4Am', pm: 'wf4Pm', min: 'taMin4', max: 'taMax4' },
        { am: 'wf5Am', pm: 'wf5Pm', min: 'taMin5', max: 'taMax5' },
        { am: 'wf6Am', pm: 'wf6Pm', min: 'taMin6', max: 'taMax6' },
        { am: 'wf7Am', pm: 'wf7Pm', min: 'taMin7', max: 'taMax7' },
        { am: 'wf8', pm: null, min: 'taMin8', max: 'taMax8' },
        { am: 'wf9', pm: null, min: 'taMin9', max: 'taMax9' },
        { am: 'wf10', pm: null, min: 'taMin10', max: 'taMax10' },
      ];

      // API 응답 데이터 로깅
      console.log('[주간 날씨] API 응답 데이터:', weeklyData);

      const today = new Date();
      const currentDay = today.getDay();
      
      // 10일치 날짜 생성 (오늘부터 10일)
      const dateList = Array.from({ length: 10 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return {
          date: d,
          formattedDate: `${d.getMonth() + 1}/${d.getDate()}`,
          dayOfWeek: getDayOfWeek(d),
          weatherKey: i < 7 ? weatherKeys[i] : null
        };
      });

      return (
        <ScrollView style={{ maxHeight: 400 }} nestedScrollEnabled={true}>
          {dateList.map((dateInfo, idx) => {
            if (!dateInfo.weatherKey) return null;

            const amText = weeklyData[dateInfo.weatherKey.am];
            const pmText = dateInfo.weatherKey.pm ? weeklyData[dateInfo.weatherKey.pm] : null;
            
            // 최저/최고 온도 키 변경
            const minTemp = weeklyData[`taMin${idx + 4}`] || '-';
            const maxTemp = weeklyData[`taMax${idx + 4}`] || '-';
            
            // 온도 데이터 로깅
            console.log(`[주간 날씨] ${dateInfo.formattedDate} 온도:`, {
              min: weeklyData[`taMin${idx + 4}`],
              max: weeklyData[`taMax${idx + 4}`],
              keys: Object.keys(weeklyData)
            });

            const emoji = `${getEmoji(amText)}${pmText ? '/ ' + getEmoji(pmText) : ''}`;
            const desc = `${amText || ''}${pmText ? ' / ' + pmText : ''}`;
            
            return (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.row,
                  selectedDate?.getTime() === dateInfo.date.getTime() && { backgroundColor: '#f0f0f0' }
                ]}
                onPress={() => {
                  console.log('[주간 날씨] 선택된 날짜:', dateInfo.date);
                  setSelectedDate(dateInfo.date);
                }}
              >
                <Text style={styles.time}>
                  {dateInfo.formattedDate} ({dateInfo.dayOfWeek})
                </Text>
                <Text style={styles.value}>{emoji}</Text>
                <Text style={styles.value}>{desc}</Text>
                <Text style={styles.value}>{minTemp}℃/{maxTemp}℃</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    } catch (e) {
      console.warn('[주간 날씨] 렌더 중 오류 발생:', e);
      return <Text style={styles.noWarning}>주간 날씨 데이터 없음</Text>;
    }
  };

  const renderSelectedDateWeather = () => {
    if (!selectedDate) return null;
    
    console.log('[시간대별 날씨] 선택된 날짜:', selectedDate);
    
    // 선택된 날짜의 날씨 데이터 필터링
    const dateStr = selectedDate.toISOString().split('T')[0];
    const filteredWeather = weatherData?.response?.body?.items?.item?.filter(
      item => item.fcstDate === dateStr
    ) || [];

    console.log('[시간대별 날씨] 필터링된 데이터:', filteredWeather);

    // 시간대별로 그룹화
    const groupedWeather = {};
    filteredWeather.forEach(item => {
      if (!groupedWeather[item.fcstTime]) {
        groupedWeather[item.fcstTime] = {};
      }
      groupedWeather[item.fcstTime][item.category] = item.fcstValue;
    });

    return (
      <View style={styles.selectedDateContainer}>
        <Text style={styles.sectionTitle}>
          {selectedDate.getMonth() + 1}/{selectedDate.getDate()} ({getDayOfWeek(selectedDate)}) 시간대별 날씨
        </Text>
        <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
          {Object.entries(groupedWeather).map(([time, data]) => (
            <View key={time} style={styles.row}>
              <Text style={styles.time}>{time.slice(0, 2)} 시</Text>
              <Text style={styles.value}>
                {data.PTY !== '0' ? getEmojiForPty(data.PTY) : getEmojiForSky(data.SKY)}
              </Text>
              <Text style={styles.value}>
                {data.PTY !== '0' ? (data.RN1 || '강수없음') : '강수없음'}
              </Text>
              <Text style={styles.value}>{data.T1H} ℃</Text>
              <Text style={styles.value}>{data.REH}%</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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

      {renderSelectedDateWeather()}
    </ScrollView>
  );
}
