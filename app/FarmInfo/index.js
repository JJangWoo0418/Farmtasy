// app/FarmInfo/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../Components/Css/FarmInfo/index.js';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime, getMidFcstTime } from '../Components/Utils/timeUtils';
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
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const loadWeather = async () => {
    try {
      setLoading(true);
      let coords = FARM_COORDS;
      console.log('[날씨 로드] 시작 - 모드:', mode);
      console.log('[날씨 로드] 좌표:', coords);

      if (mode === 'current') {
        setLoadingStep('위치 정보를 가져오는 중...');
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

      // 중기예보 시간 설정
      const tmFc = getMidFcstTime();
      console.log('[시간 설정] tmFc:', tmFc);

      // 격자 변환
      setLoadingStep('위치 정보를 변환하는 중...');
      const grid = await fetchWeather('latlon', {
        lat: coords.latitude,
        lon: coords.longitude,
      });

      if (!grid || !grid.x || !grid.y) {
        console.error('[격자 변환] 실패');
        setLoading(false);
        return;
      }

      // 지역 코드 가져오기
      setLoadingStep('지역 정보를 가져오는 중...');
      const regId = await getMidLandRegId(coords.latitude, coords.longitude);

      const { base_date, base_time } = getBaseDateTime();
      console.log('[기준 시간] 설정:', { base_date, base_time });

      // 초단기예보
      setLoadingStep('현재 날씨를 가져오는 중...');
      const [current, forecast] = await Promise.all([
        fetchWeather('ultraNcst', {
          nx: grid.x,
          ny: grid.y,
          base_date,
          base_time,
        }),
        fetchWeather('ultraFcst', {
          nx: grid.x,
          ny: grid.y,
          base_date,
          base_time,
        })
      ]);

      if (current?.response?.body?.items?.item && forecast?.response?.body?.items?.item) {
        console.log('[날씨 데이터] 설정');
        setWeatherData({
          ...forecast,
          current: current
        });
      } else {
        console.warn('[날씨 데이터] 없음:', {
          current: current?.response?.header?.resultMsg,
          forecast: forecast?.response?.header?.resultMsg
        });
      }

      // 단기예보
      setLoadingStep('시간대별 날씨를 가져오는 중...');
      const villageFcst = await fetchWeather('villageFcst', {
        nx: grid.x,
        ny: grid.y,
        base_date,
        base_time,
      });

      if (villageFcst?.response?.body?.items?.item) {
        console.log('[단기예보 데이터] 설정');
        setShortTermData(villageFcst);
      }

      // 중기예보
      setLoadingStep('주간 날씨를 가져오는 중...');
      const [midLandFcst, midTa] = await Promise.all([
        fetchWeather('midLandFcst', { regId, tmFc }),
        fetchWeather('midTa', { regId, tmFc })
      ]);

      // 중기예보 데이터 처리
      const landFcstData = midLandFcst?.response?.body?.items?.item?.[0] ?? null;
      const taFcstData = midTa?.response?.body?.items?.item?.[0] ?? null;

      if (landFcstData || taFcstData) {
        // 두 데이터 합치기
        const weatherData = {
          ...landFcstData,
          ...taFcstData
        };
        console.log('[주간 날씨] 병합된 데이터:', weatherData);
        setWeeklyData(weatherData);
      }

      // 기상특보
      setLoadingStep('기상 특보를 확인하는 중...');
      const warning = await fetchWeather('warning');
      if (typeof warning === 'string') setWarningData(warning);

      setLoading(false);
      setLoadingStep('');
    } catch (error) {
      console.error('[날씨 로드] 전체 중 오류:', error);
      setLoading(false);
      setLoadingStep('');
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
        console.warn('[주간 날씨 렌더링] 데이터 없음');
        return <Text style={styles.noWarning}>주간 날씨 데이터 없음</Text>;
      }

      console.log('[주간 날씨 렌더링] 시작:', weeklyData);

      // 주간 데이터를 배열로 변환
      const weeklyArray = [];
      for (let i = 4; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + (i - 3));
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

        // 온도 데이터 처리
        let minTemp = weeklyData[`taMin${i}`];
        let maxTemp = weeklyData[`taMax${i}`];

        console.log(`[주간 날씨 렌더링] ${i}일차 온도 데이터:`, {
          minTemp,
          maxTemp,
          minTempHigh: weeklyData[`taMin${i}High`],
          minTempLow: weeklyData[`taMin${i}Low`],
          maxTempHigh: weeklyData[`taMax${i}High`],
          maxTempLow: weeklyData[`taMax${i}Low`]
        });

        // 온도가 0이거나 없는 경우 처리
        if (minTemp === 0 || minTemp === '0' || !minTemp) {
          minTemp = weeklyData[`taMin${i}High`] || weeklyData[`taMin${i}Low`] || '-';
        }
        if (maxTemp === 0 || maxTemp === '0' || !maxTemp) {
          maxTemp = weeklyData[`taMax${i}High`] || weeklyData[`taMax${i}Low`] || '-';
        }

        // 온도값이 문자열인 경우 숫자로 변환
        if (typeof minTemp === 'string' && minTemp !== '-') {
          minTemp = parseInt(minTemp);
        }
        if (typeof maxTemp === 'string' && maxTemp !== '-') {
          maxTemp = parseInt(maxTemp);
        }

        weeklyArray.push({
          date: `${month}/${day}`,
          dayOfWeek: `(${dayOfWeek})`,
          amWeather: i <= 7 ? weeklyData[`wf${i}Am`] : weeklyData[`wf${i}`],
          pmWeather: i <= 7 ? weeklyData[`wf${i}Pm`] : weeklyData[`wf${i}`],
          amRainProb: i <= 7 ? weeklyData[`rnSt${i}Am`] : weeklyData[`rnSt${i}`],
          pmRainProb: i <= 7 ? weeklyData[`rnSt${i}Pm`] : weeklyData[`rnSt${i}`],
          minTemp: minTemp,
          maxTemp: maxTemp
        });
      }

      console.log('[주간 날씨 렌더링] 최종 데이터:', weeklyArray);

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
            <Text style={styles.loading}>{loadingStep || '로딩중...'}</Text>
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
