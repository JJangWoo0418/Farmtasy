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
  const [shortTermData, setShortTermData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [warningData, setWarningData] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const loadWeather = async () => {
    try {
    setLoading(true);
    let coords = FARM_COORDS;
      console.log('[날씨 로드] 시작 - 모드:', mode);
      console.log('[날씨 로드] 좌표:', coords);

    if (mode === 'current') {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('[위치 권한] 거부됨');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
          console.log('[현재 위치] 좌표:', coords);
      } catch (error) {
          console.error('[위치 오류]:', error);
        setLoading(false);
        return;
      }
    }

      // 현재 시간 기준으로 base_date와 base_time 설정
    const now = new Date();
    const currentHour = now.getHours();
    const baseDate = new Date(now);
      
      // 6시 이전이면 전날 18시 발표 데이터 사용
      if (currentHour < 6) {
        baseDate.setDate(baseDate.getDate() - 1);
      }

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
    const dd = String(baseDate.getDate()).padStart(2, '0');
      const tmFc = `${yyyy}${mm}${dd}${currentHour < 6 ? '1800' : '0600'}`;

      console.log('[시간 설정] tmFc:', tmFc);

    const grid = await fetchWeather('latlon', {
      lat: coords.latitude,
      lon: coords.longitude,
    });
      // console.log('[격자 변환] 결과:', grid);  // 긴 로그 주석 처리

    if (!grid || !grid.x || !grid.y) {
        console.error('[격자 변환] 실패');
      setLoading(false);
      return;
    }

      const { base_date, base_time } = getBaseDateTime();
      console.log('[기준 시간] 설정:', { base_date, base_time });

      // 초단기예보 조회
    const forecast = await fetchWeather('ultraFcst', {
      nx: grid.x,
      ny: grid.y,
      base_date,
      base_time,
    });
      // console.log('[초단기예보] 응답:', forecast);  // 긴 로그 주석 처리

      if (forecast?.response?.body?.items?.item) {
        console.log('[초단기예보 데이터] 설정');
        setWeatherData(forecast);
      } else {
        console.warn('[초단기예보] 데이터 없음:', forecast?.response?.header?.resultMsg);
      }

      // 단기예보 조회 (최근 3일치 데이터 요청)
      const shortTermPromises = [];
      const currentTime = new Date();
      const hour = currentTime.getHours();
      
      // 기상청 API 제공 시간: 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
      let baseTime;
      if (hour < 2) {
        baseTime = '2300';  // 전날 23시 데이터
      } else if (hour < 5) {
        baseTime = '0200';  // 당일 2시 데이터
      } else if (hour < 8) {
        baseTime = '0500';  // 당일 5시 데이터
      } else if (hour < 11) {
        baseTime = '0800';  // 당일 8시 데이터
      } else if (hour < 14) {
        baseTime = '1100';  // 당일 11시 데이터
      } else if (hour < 17) {
        baseTime = '1400';  // 당일 14시 데이터
      } else if (hour < 20) {
        baseTime = '1700';  // 당일 17시 데이터
      } else if (hour < 23) {
        baseTime = '2000';  // 당일 20시 데이터
      } else {
        baseTime = '2300';  // 당일 23시 데이터
      }
      
      console.log('[단기예보] 현재 시간:', hour, '시, 요청 시간:', baseTime);
      
      // 현재 날짜 기준으로 3일치 데이터 요청
      for (let i = 0; i < 3; i++) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(targetDate.getDate() - i);
        const targetDateStr = `${targetDate.getFullYear()}${String(targetDate.getMonth() + 1).padStart(2, '0')}${String(targetDate.getDate()).padStart(2, '0')}`;
        
        console.log('[단기예보] 요청 날짜:', targetDateStr, '시간:', baseTime);
        
        shortTermPromises.push(
          fetchWeather('villageFcst', {
            nx: grid.x,
            ny: grid.y,
            base_date: targetDateStr,
            base_time: baseTime,
          })
        );
      }

      // 단기예보 API 응답을 처리하는 부분
      const shortTermResults = await Promise.all(shortTermPromises);
      let validShortTermData = null;
      
      for (const result of shortTermResults) {
        if (result?.response?.body?.items?.item) {
          validShortTermData = result;
          // console.log('[단기예보] 유효한 데이터:', result.response.body.items);  // XML 형식의 긴 로그 주석 처리
          break;
        } else {
          console.log('[단기예보] 데이터 없음:', result?.response?.header?.resultMsg);
        }
      }

      if (validShortTermData) {
        console.log('[단기예보 데이터] 설정');
        setShortTermData(validShortTermData);
      } else {
        console.warn('[단기예보] 유효한 데이터 없음');
        // 단기예보 데이터가 없는 경우 초단기예보 데이터를 활용
        if (forecast) {
          console.log('[단기예보] 초단기예보 데이터 활용');
          setShortTermData(forecast);
        }
      }

      // 중기예보 조회
      const regId = getMidLandRegId(coords.latitude, coords.longitude);
      console.log('[중기예보] 지역 ID:', regId);
      
      // 중기예보 API 호출 (날씨와 온도 데이터 모두 요청)
      const midForecast = await fetchWeather('midLandFcst', { 
        regId, 
        tmFc,
        type: 'XML',
        numOfRows: '10',
        pageNo: '1',
        dataType: 'XML'
      });
      
      // 중기기온예보 추가
      const midTaForecast = await fetchWeather('midTa', {
        regId,
        tmFc,
        type: 'XML',
        numOfRows: '10',
        pageNo: '1',
        dataType: 'XML'
      });

      // 중기예보 API 응답 로그
      // console.log('[중기예보] 육상예보 응답:', midForecast);  // 긴 로그 주석 처리
      // console.log('[중기예보] 기온예보 응답:', midTaForecast);  // 긴 로그 주석 처리

      // 중기예보 데이터 처리
      const landFcstData = midForecast?.response?.body?.items?.item?.[0] ?? null;
      const taFcstData = midTaForecast?.response?.body?.items?.item?.[0] ?? null;

      if (landFcstData || taFcstData) {
        // 두 데이터 합치기
        const weatherData = {
          ...landFcstData,
          ...taFcstData
        };
        console.log('[주간 날씨] 병합된 데이터:', weatherData);
        setWeeklyData(weatherData);
      } else {
        console.warn('[주간 날씨] 데이터 없음');
        setWeeklyData(null);
      }

      const warning = await fetchWeather('warning');
      console.log('[기상 특보] 응답:', warning);

    if (typeof warning === 'string') setWarningData(warning);
    setLoading(false);
    } catch (error) {
      console.error('[날씨 로드] 전체 중 오류:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await loadWeather();
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [mode]);

  const getEmoji = (text) => {
    if (!text) return '❓';
    if (text.includes('맑음')) return '☀️';
    if (text.includes('구름많')) return '⛅';
    if (text.includes('흐림')) return '☁️';
    if (text.includes('비')) return '🌧️';
    if (text.includes('눈')) return '❄️';
    if (text.includes('태풍')) return '🌪️';
    return '❓';
  };

  const getEmojiForPty = (value) => {
    switch (value) {
      case '0': return '☀️';  // 맑음
      case '1': return '🌧️';  // 비
      case '2': return '🌧️';  // 비/눈
      case '3': return '❄️';  // 눈
      case '4': return '🌧️';  // 소나기
      default: return '☀️';
    }
  };

  const getEmojiForSky = (value) => {
    switch (value) {
      case '1': return '☀️';  // 맑음
      case '3': return '⛅';  // 구름많음
      case '4': return '☁️';  // 흐림
      default: return '☀️';
    }
  };

  const getDayOfWeek = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const renderForecast = () => {
    try {
    const msg = weatherData?.response?.header?.resultMsg;
    const code = weatherData?.response?.header?.resultCode;
    if (msg !== 'NORMAL_SERVICE') return <Text style={styles.errorText}>에러: {msg} (코드 {code})</Text>;

    const items = weatherData?.response?.body?.items?.item || [];
      if (!items.length) {
        console.warn('[시간대별 날씨] 데이터 없음');
        return <Text style={styles.noWarning}>시간대별 날씨 데이터가 없습니다.</Text>;
      }

      // 날짜별, 시간별 데이터 그룹화
      const dateGroups = {};
      items.forEach(item => {
        if (!item || typeof item !== 'object') return;

        const fcstTime = item.fcstTime.toString().padStart(4, '0');
        const formattedTime = fcstTime.slice(0, 2) + '00';

        const key = `${item.fcstDate}_${formattedTime}`;
        if (!dateGroups[key]) {
          dateGroups[key] = {
            date: item.fcstDate,
            time: formattedTime,
            data: {}
          };
        }
        dateGroups[key].data[item.category] = item.fcstValue;
      });

      const sortedTimes = Object.keys(dateGroups).sort();
      if (sortedTimes.length === 0) {
        return <Text style={styles.noWarning}>시간대별 날씨 데이터가 없습니다.</Text>;
      }

      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentTimeStr = `${currentHour.toString().padStart(2, '0')}00`;

    return (
      <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.hourlyWeatherScroll}
        >
          {sortedTimes.map((key, idx) => {
            const groupData = dateGroups[key];
            if (!groupData?.time || !groupData?.data) return null;

            const hour = groupData.time.slice(0, 2);
            const displayHour = `${hour}시`;
            const data = groupData.data;

            const pty = data['PTY'] || '0';
            const sky = data['SKY'] || '1';
            const t1h = data['T1H'] ? `${data['T1H']}°` : '-°';
            const reh = data['REH'] ? `${data['REH']}%` : '-%';
            const rn1 = data['RN1'] === '강수없음' ? '-' : data['RN1'];
          const emoji = pty !== '0' ? getEmojiForPty(pty) : getEmojiForSky(sky);
            const isCurrentHour = groupData.time === currentTimeStr;
          
          return (
              <View key={idx} style={[
                styles.hourlyWeatherItem,
                isCurrentHour && styles.hourlyWeatherItemCurrent
              ]}>
                <Text style={[
                  styles.hourlyTime,
                  isCurrentHour && styles.hourlyTimeCurrent
                ]}>{displayHour}</Text>
                <Text style={styles.weatherEmoji}>{emoji}</Text>
                <Text style={styles.weatherValue}>{rn1}</Text>
                <Text style={[
                  styles.weatherTemp,
                  isCurrentHour && styles.weatherTempCurrent
                ]}>{t1h}</Text>
                <Text style={styles.weatherValue}>{reh}</Text>
            </View>
          );
          }).filter(Boolean)}
      </ScrollView>
    );
    } catch (error) {
      console.error('[시간대별 날씨] 전체 처리 중 오류:', error);
      return <Text style={styles.errorText}>날씨 데이터를 불러오는 중 오류가 발생했습니다.</Text>;
    }
  };

  const renderWeekly = () => {
    try {
      if (!weeklyData) {
        return <Text style={styles.noWarning}>주간 날씨 데이터 없음</Text>;
      }

      // 주간 데이터를 배열로 변환
      const weeklyArray = [];
      for (let i = 4; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i - 3));
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

        weeklyArray.push({
          date: `${month}/${day}`,
          dayOfWeek: `(${dayOfWeek})`,
          amWeather: i <= 7 ? weeklyData[`wf${i}Am`] : weeklyData[`wf${i}`],
          pmWeather: i <= 7 ? weeklyData[`wf${i}Pm`] : weeklyData[`wf${i}`],
          amRainProb: i <= 7 ? weeklyData[`rnSt${i}Am`] : weeklyData[`rnSt${i}`],
          pmRainProb: i <= 7 ? weeklyData[`rnSt${i}Pm`] : weeklyData[`rnSt${i}`],
          minTemp: weeklyData[`taMin${i}`] === 0 ? '-' : weeklyData[`taMin${i}`],
          maxTemp: weeklyData[`taMax${i}`] === 0 ? '-' : weeklyData[`taMax${i}`]
        });
      }

      return (
        <ScrollView style={styles.weeklyScrollView} nestedScrollEnabled={true}>
          {weeklyArray.map((item, idx) => (
            <View key={idx} style={[styles.weeklyRow, { height: 60, flexDirection: 'row' }]}>
              <View style={[styles.weeklyDateColumn, { width: 80, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyDate, { fontSize: 16 }]}>{item.date}</Text>
                <Text style={[styles.weeklyDayOfWeek, { fontSize: 14 }]}>{item.dayOfWeek}</Text>
              </View>
              <View style={[styles.weeklyWeatherColumn, { width: 80, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyEmoji, { fontSize: 24 }]}>{getEmoji(item.amWeather)}</Text>
                <Text style={[styles.weeklyRainProb, { fontSize: 14 }]}>{item.amRainProb}%</Text>
              </View>
              <View style={[styles.weeklyWeatherColumn, { width: 80, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyEmoji, { fontSize: 24 }]}>{getEmoji(item.pmWeather)}</Text>
                <Text style={[styles.weeklyRainProb, { fontSize: 14 }]}>{item.pmRainProb}%</Text>
              </View>
              <View style={[styles.weeklyTempColumn, { width: 100, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyTemp, { fontSize: 16 }]}>
                  {item.minTemp !== '-' && item.maxTemp !== '-' ? `${item.minTemp}°/${item.maxTemp}°` : '-/-'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      );
    } catch (e) {
      console.error('[주간 날씨] 렌더 중 오류:', e);
      return <Text style={styles.noWarning}>주간 날씨 데이터를 불러오는 중 오류가 발생했습니다.</Text>;
    }
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
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, mode === 'farm' ? styles.navButtonActive : styles.navButtonInactive]}
          onPress={() => setMode('farm')}
        >
          <Text style={[styles.navText, mode === 'farm' ? styles.navTextActive : styles.navTextInactive]}>
            내 농장 날씨
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, mode === 'current' ? styles.navButtonActive : styles.navButtonInactive]}
          onPress={() => setMode('current')}
        >
          <Text style={[styles.navText, mode === 'current' ? styles.navTextActive : styles.navTextInactive]}>
            현 위치 날씨
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
        <View style={styles.currentWeatherBox}>
          {loading ? (
            <Text style={styles.loading}>로딩중...</Text>
          ) : weatherData?.response?.body?.items?.item ? (
            <>
              <Text style={styles.currentTemp}>
                {weatherData.response.body.items.item.find(item => item.category === 'T1H')?.fcstValue || '-'}°
              </Text>
              <Text style={styles.weatherDesc}>
                {weatherData.response.body.items.item.find(item => item.category === 'PTY')?.fcstValue === '0' 
                  ? getEmojiForSky(weatherData.response.body.items.item.find(item => item.category === 'SKY')?.fcstValue || '1')
                  : getEmojiForPty(weatherData.response.body.items.item.find(item => item.category === 'PTY')?.fcstValue || '0')
                } 
                {weatherData.response.body.items.item.find(item => item.category === 'SKY')?.fcstValue === '4' ? '흐림' : '맑음'}
              </Text>
              <Text style={styles.weatherValue}>
                습도: {weatherData.response.body.items.item.find(item => item.category === 'REH')?.fcstValue || '-'}%
              </Text>
              {weatherData?.response?.body?.items?.item && (
                <Text style={styles.tempRange}>
                  {(() => {
                    const temps = weatherData.response.body.items.item
                      .filter(item => item.category === 'T1H')
                      .map(item => parseInt(item.fcstValue));
                    const minTemp = temps.length ? Math.min(...temps) : '-';
                    const maxTemp = temps.length ? Math.max(...temps) : '-';
                    return `최저 ${minTemp}° / 최고 ${maxTemp}°`;
                  })()}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.noWarning}>날씨 데이터를 불러올 수 없습니다.</Text>
          )}
      </View>

        <Text style={styles.sectionTitle}>시간대별 날씨</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderForecast()
        )}

        <Text style={styles.sectionTitle}>주간 날씨</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          renderWeekly()
        )}

        <Text style={styles.sectionTitle}>기상 특보</Text>
        {loading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : (
          <View style={styles.warningContainer}>
            {renderWarning()}
      </View>
        )}
    </ScrollView>
    </View>
  );
}
