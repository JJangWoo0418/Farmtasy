// app/FarmInfo/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../Components/Css/FarmInfo/index.js';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';
import { getMidLandRegId } from '../Components/Utils/regionMapper';
import * as Location from 'expo-location';
import { getHistoricalTemperature } from '../Components/Utils/weatherUtils';

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
  const [forecastDateStr, setForecastDateStr] = useState('');
  const [baseTime, setBaseTime] = useState('');
  const [weeklyTemps, setWeeklyTemps] = useState({});
  const [currentLocation, setCurrentLocation] = useState('');

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
          
          // 현재 위치 이름 설정
          const locationName = await getLocationName(coords.latitude, coords.longitude);
          setCurrentLocation(locationName);
      } catch (error) {
          console.error('[위치 오류]:', error);
        setLoading(false);
        return;
      }
      } else {
        // 내 농장 위치 이름 설정
        const locationName = await getLocationName(FARM_COORDS.latitude, FARM_COORDS.longitude);
        setCurrentLocation(locationName);
    }

      // 현재 시간 기준으로 API 호출 시간 설정
    const now = new Date();
    const currentHour = now.getHours();
      
      // 단기예보용 시간 설정
      let baseTime;
      let baseDate = new Date(now);
      
      if (currentHour < 2) {
        baseDate.setDate(baseDate.getDate() - 1);
        baseTime = '2000';
      } else if (currentHour < 5) {
        baseTime = '0200';
      } else if (currentHour < 8) {
        baseTime = '0500';
      } else if (currentHour < 11) {
        baseTime = '0800';
      } else if (currentHour < 14) {
        baseTime = '1100';
      } else if (currentHour < 17) {
        baseTime = '1400';
      } else if (currentHour < 20) {
        baseTime = '1700';
      } else {
        baseTime = '2000';
      }
      
      const baseDateStr = `${baseDate.getFullYear()}${String(baseDate.getMonth() + 1).padStart(2, '0')}${String(baseDate.getDate()).padStart(2, '0')}`;
      
      // 중기예보용 시간 설정 - 현재 시간에 맞게 조정
      const midFcstTime = currentHour < 6 ? '0600' : (currentHour < 18 ? '0600' : '1800');
      const midBaseDate = new Date(now);
      if (currentHour < 6) {
        midBaseDate.setDate(midBaseDate.getDate() - 1);
      }
      
      const midBaseDateStr = `${midBaseDate.getFullYear()}${String(midBaseDate.getMonth() + 1).padStart(2, '0')}${String(midBaseDate.getDate()).padStart(2, '0')}`;
      const tmFc = `${midBaseDateStr}${midFcstTime}`;
      
      console.log('[중기예보] 발표 시각:', {
        현재시각: `${currentHour}시`,
        발표시각: midFcstTime,
        발표일자: midBaseDateStr
      });
      
      setBaseTime(baseTime);
      setForecastDateStr(baseDateStr);
      
      console.log('[API 시간 설정]', {
        currentHour,
        단기예보: {
          baseDate: baseDateStr,
          baseTime
        },
        중기예보: {
          baseDate: midBaseDateStr,
          baseTime: midFcstTime,
          tmFc
        }
      });
      
      // 격자 좌표 계산 함수
      const calculateGrid = (lat, lon) => {
        const RE = 6371.00877; // 지구 반경(km)
        const GRID = 5.0;      // 격자 간격(km)
        const SLAT1 = 30.0;    // 표준 위도1
        const SLAT2 = 60.0;    // 표준 위도2
        const OLON = 126.0;    // 기준점 경도
        const OLAT = 38.0;     // 기준점 위도
        const XO = 43;         // 기준점 X좌표
        const YO = 136;        // 기준점 Y좌표

        const DEGRAD = Math.PI / 180.0;
        const RADDEG = 180.0 / Math.PI;

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

        let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        let theta = lon * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;

        const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
        const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

        return { x, y };
      };

      // 격자 좌표 계산
      const grid = calculateGrid(coords.latitude, coords.longitude);
      console.log('[격자 변환] 계산된 좌표:', grid);

    if (!grid || !grid.x || !grid.y) {
        console.error('[격자 변환] 실패');
      setLoading(false);
      return;
    }

      const { base_date, base_time } = getBaseDateTime();
      console.log('[기준 시간] 설정:', { base_date, base_time });

      // 단기예보 조회
      const shortTermPromise = fetchWeather('villageFcst', {
        nx: grid.x,
        ny: grid.y,
        base_date: baseDateStr,
        base_time: baseTime,
      });
      
      // 중기예보 조회
      const midLandPromise = fetchWeather('midLandFcst', { 
        regId: getMidLandRegId(coords.latitude, coords.longitude), 
        tmFc,
        pageNo: '1',
        numOfRows: '10',
        dataType: 'XML'
      });

      // 중기기온예보 조회
      const midTaPromise = fetchWeather('midTa', {
        regId: getMidLandRegId(coords.latitude, coords.longitude),
        tmFc,
        pageNo: '1',
        numOfRows: '10',
        dataType: 'XML'
      });

      console.log('[중기기온예보] API 호출:', {
        regId: getMidLandRegId(coords.latitude, coords.longitude),
        tmFc,
        pageNo: '1',
        numOfRows: '10',
        dataType: 'XML'
      });

      // 모든 API 요청을 병렬로 실행
      const [ultraFcst, shortTermFcst, midLandFcst, midTaFcst, warningFcst] = await Promise.all([
        fetchWeather('ultraFcst', {
      nx: grid.x,
      ny: grid.y,
      base_date,
      base_time,
        }),
        shortTermPromise,
        midLandPromise,
        midTaPromise,
        fetchWeather('warning')
      ]);

      // 중기기온예보 데이터 상세 로깅
      console.log('[중기기온예보] 전체 응답:', midTaFcst);
      if (midTaFcst?.response?.body?.items?.item) {
        console.log('[중기기온예보] 데이터 항목:', midTaFcst.response.body.items.item);
        console.log('[중기기온예보] 응답 코드:', midTaFcst.response.header.resultCode);
        console.log('[중기기온예보] 응답 메시지:', midTaFcst.response.header.resultMsg);
      } else {
        console.warn('[중기기온예보] 데이터 없음:', midTaFcst?.response?.header?.resultMsg);
      }

      // 초단기예보 데이터 설정
      if (ultraFcst?.response?.body?.items?.item) {
        console.log('[초단기예보 데이터] 설정');
        setWeatherData(ultraFcst);
      } else {
        console.warn('[초단기예보] 데이터 없음:', ultraFcst?.response?.header?.resultMsg);
      }

      // 단기예보 데이터 설정
      if (shortTermFcst?.response?.body?.items?.item) {
        console.log('[단기예보 데이터] 설정');
        setShortTermData(shortTermFcst);
      } else {
        console.warn('[단기예보] 데이터 없음:', shortTermFcst?.response?.header?.resultMsg);
      }

      // 중기예보 데이터 처리
      const landFcstData = midLandFcst?.response?.body?.items?.item?.[0] ?? null;
      const taFcstData = midTaFcst?.response?.body?.items?.item?.[0] ?? null;

      console.log('[중기기온예보] 데이터:', taFcstData);

      if (landFcstData || taFcstData) {
        const weatherData = {
          ...landFcstData,
          ...taFcstData
        };
        console.log('[주간 날씨] 병합된 데이터:', weatherData);
        
        // taMin3 ~ taMin10, taMax3 ~ taMax10 값이 있는지 확인
        for (let i = 3; i <= 10; i++) {
          console.log(`[주간 날씨] ${i}일 후 기온:`, {
            min: weatherData[`taMin${i}`],
            max: weatherData[`taMax${i}`]
          });
        }
        
        setWeeklyData(weatherData);
    } else {
        console.warn('[주간 날씨] 데이터 없음');
        setWeeklyData(null);
      }

      // 기상 특보 데이터 설정
      if (typeof warningFcst === 'string') {
        setWarningData(warningFcst);
      }

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

  useEffect(() => {
    const loadHistoricalTemps = async () => {
      if (!weeklyData) return;
      
      try {
        const temps = {};
        for (let i = 4; i <= 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const formattedDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
          
          // 로컬 CSV 파일 경로
          const csvPath = `app/Components/Utils/ta_${formattedDate}034032.csv`;
          
          try {
            // 로컬 파일 읽기
            const response = await fetch(csvPath);
            if (!response.ok) {
              console.log(`[과거 기온] ${i}일차 데이터 없음:`, csvPath);
              continue;
            }
            
            const text = await response.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            const data = lines[1].split(',');
            
            const minTemp = parseFloat(data[headers.indexOf('minTemp')]);
            const maxTemp = parseFloat(data[headers.indexOf('maxTemp')]);
            
            if (!isNaN(minTemp) && !isNaN(maxTemp)) {
              temps[i] = { minTemp, maxTemp };
              console.log(`[과거 기온] ${i}일차 데이터:`, temps[i]);
            }
          } catch (error) {
            console.log(`[과거 기온] ${i}일차 데이터 읽기 실패:`, error.message);
          }
        }
        setWeeklyTemps(temps);
      } catch (error) {
        console.error('[과거 기온] 전체 처리 중 오류:', error);
      }
    };
    
    loadHistoricalTemps();
  }, [weeklyData]);

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

  const getWeatherEmoji = (pty, sky) => {
    // 문자열로 변환하여 비교
    const ptyStr = String(pty);
    const skyStr = String(sky);

    // PTY가 0일 때만 SKY 값을 확인
    if (ptyStr === '0') {
      switch(skyStr) {
        case '1': return '☀️';  // 맑음
        case '3': return '⛅';  // 구름많음
        case '4': return '☁️';  // 흐림
        default: return '☀️';   // 기본값
      }
    } else {
      // PTY 값에 따른 이모지
      switch(ptyStr) {
        case '1': return '🌧️';  // 비
        case '2': return '🌨️';  // 비/눈
        case '3': return '❄️';  // 눈
        case '4': return '🌦️';  // 소나기
        case '5': return '🌧️';  // 빗방울
        case '6': return '🌨️';  // 빗방울과 눈날림
        case '7': return '❄️';  // 눈날림
        default: return '☀️';   // 기본값
      }
    }
  };

  const getWeatherText = (pty, sky) => {
    // 문자열로 변환하여 비교
    const ptyStr = String(pty);
    const skyStr = String(sky);

    // PTY가 0일 때만 SKY 값을 확인
    if (ptyStr === '0') {
      switch(skyStr) {
        case '1': return '맑음';
        case '3': return '구름많음';
        case '4': return '흐림';
        default: return '맑음';
      }
    } else {
      // PTY 값에 따른 날씨 설명
      switch(ptyStr) {
        case '1': return '비';
        case '2': return '비/눈';
        case '3': return '눈';
        case '4': return '소나기';
        case '5': return '빗방울';
        case '6': return '빗방울과 눈날림';
        case '7': return '눈날림';
        default: return '맑음';
      }
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
            const rn1 = data['RN1'] === '강수없음' ? '-' : 
                       data['RN1'].includes('미만') ? `${data['RN1'].split('미만')[0]}↓` : 
                       data['RN1'];
            
            const emoji = getWeatherEmoji(pty, sky);
            
            console.log(`[시간대별 날씨] 시간: ${hour}시, PTY: ${pty}, SKY: ${sky}, 이모지: ${emoji}`);
            
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
                <Text style={styles.rainValue}>{rn1}</Text>
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
    if (!weeklyData) {
      return <Text style={styles.noWarning}>주간 날씨 데이터가 없습니다.</Text>;
    }

    try {
      // 주간 데이터를 배열로 변환
      const weeklyArray = [];
      
      // 1-3일차 데이터 (단기예보)
      if (shortTermData?.response?.body?.items?.item) {
        const shortTermItems = shortTermData.response.body.items.item;
        
        // 날짜별로 그룹화된 데이터 확인
        const dateGroups = {};
        shortTermItems.forEach(item => {
          if (!dateGroups[item.fcstDate]) {
            dateGroups[item.fcstDate] = [];
          }
          dateGroups[item.fcstDate].push(item);
        });

        console.log('[단기예보] 날짜별 데이터:', Object.keys(dateGroups));
        
        // 1-3일차 데이터 처리
        for (let i = 1; i <= 3; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const targetDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
          
          console.log(`[단기예보] ${i}일차 조회:`, targetDate);
          
          // 해당 날짜의 모든 데이터
          const dayData = dateGroups[targetDate] || [];
          
          if (dayData.length === 0) {
            console.log(`[단기예보] ${i}일차 데이터 없음:`, targetDate);
            continue;  // 데이터가 없으면 다음 날짜로
          }

          // 발표 시간별로 데이터 정렬
          const baseTimes = [...new Set(dayData.map(item => item.baseTime))].sort();
          
          // 가장 최근 발표 시각의 데이터에서 TMN, TMX 찾기
          const latestBaseTime = baseTimes[baseTimes.length - 1];
          const latestData = dayData.filter(item => item.baseTime === latestBaseTime);
          
          // 최저/최고 기온 찾기 (모든 시간대에서 검색)
          let minTemp = null;
          let maxTemp = null;
          for (const time of baseTimes.reverse()) {  // 최신 데이터부터 검색
            const timeData = dayData.filter(item => item.baseTime === time);
            if (!minTemp) minTemp = timeData.find(item => item.category === 'TMN')?.fcstValue;
            if (!maxTemp) maxTemp = timeData.find(item => item.category === 'TMX')?.fcstValue;
            if (minTemp && maxTemp) break;  // 둘 다 찾았으면 중단
          }
          
          // 3일차의 경우 중기예보 데이터도 확인
          if (i === 3 && weeklyData) {
            const midMinTemp = weeklyData[`taMin3`] || weeklyData[`taMin3High`] || weeklyData[`taMin3Low`];
            const midMaxTemp = weeklyData[`taMax3`] || weeklyData[`taMax3High`] || weeklyData[`taMax3Low`];

            console.log(`[3일차 기온 비교] 단기예보 vs 중기예보:`, {
              단기예보: { 최저: minTemp, 최고: maxTemp },
              중기예보: { 최저: midMinTemp, 최고: midMaxTemp }
            });

            // 단기예보 값이 없거나 '-'인 경우 중기예보 값 사용
            if (!minTemp || minTemp === '-') minTemp = midMinTemp;
            if (!maxTemp || maxTemp === '-') maxTemp = midMaxTemp;
          }
          
          // 시간대별 데이터 그룹화
          const timeData = {};
          dayData.forEach(item => {
            if (!timeData[item.fcstTime]) {
              timeData[item.fcstTime] = [];
            }
            timeData[item.fcstTime].push(item);
          });
          
          // 오전 9시, 오후 3시와 가장 가까운 시간 찾기 (±3시간)
          const findNearestTime = (targetHour) => {
            const times = Object.keys(timeData).sort();
            return times.reduce((closest, time) => {
              const currentDiff = Math.abs(parseInt(time) - targetHour);
              const closestDiff = Math.abs(parseInt(closest) - targetHour);
              return currentDiff < closestDiff ? time : closest;
            }, times[0]);
          };

          const morning = findNearestTime(900);  // 오전 9시
          const afternoon = findNearestTime(1500);  // 오후 3시
          
          const morningData = timeData[morning] || [];
          const afternoonData = timeData[afternoon] || [];

          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dayOfWeek = getDayOfWeek(date);

          const morningPty = morningData.find(item => item.category === 'PTY')?.fcstValue || '0';
          const morningSky = morningData.find(item => item.category === 'SKY')?.fcstValue || '1';
          const afternoonPty = afternoonData.find(item => item.category === 'PTY')?.fcstValue || '0';
          const afternoonSky = afternoonData.find(item => item.category === 'SKY')?.fcstValue || '1';

          // 강수확률 데이터 찾기
          const morningPop = morningData.find(item => item.category === 'POP')?.fcstValue;
          const afternoonPop = afternoonData.find(item => item.category === 'POP')?.fcstValue;

          console.log(`[단기예보] ${i}일차 강수확률:`, {
            날짜: `${month}/${day}`,
            오전: morningPop,
            오후: afternoonPop
          });

          weeklyArray.push({
            date: `${month}/${day}`,
            dayOfWeek: `(${dayOfWeek})`,
            amWeather: getWeatherEmoji(morningPty, morningSky),
            pmWeather: getWeatherEmoji(afternoonPty, afternoonSky),
            amRainProb: morningPop ? `${morningPop}%` : '0%',
            pmRainProb: afternoonPop ? `${afternoonPop}%` : '0%',
            minTemp: minTemp ? `${minTemp}°` : '예보 없음',
            maxTemp: maxTemp ? `${maxTemp}°` : '예보 없음'
          });
        }
      }

      // 4-7일차 데이터 (중기예보)
      if (weeklyData) {
        // 단기예보의 최근 기온 데이터
        const shortTermItems = shortTermData?.response?.body?.items?.item || [];
        const shortTermMin = shortTermItems.find(item => item.category === 'TMN')?.fcstValue;
        const shortTermMax = shortTermItems.find(item => item.category === 'TMX')?.fcstValue;

        for (let i = 4; i <= 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dayOfWeek = getDayOfWeek(date);

          // 중기예보 데이터 인덱스 계산 (실제 날짜와 맞추기)
          const midIndex = i;
          
          // 날씨 상태 데이터
          const amWeather = weeklyData[`wf${midIndex}Am`];
          const pmWeather = weeklyData[`wf${midIndex}Pm`];
          
          // 강수확률 데이터
          const amRainProb = weeklyData[`rnSt${midIndex}Am`];
          const pmRainProb = weeklyData[`rnSt${midIndex}Pm`];
          
          // 기온 데이터 - 단기예보의 최근 기온을 기반으로 예측
          let minTemp = '-';
          let maxTemp = '-';

          if (shortTermMin && shortTermMax) {
            // 날씨 상태에 따른 기온 조정
            const weather = weeklyData[`wf${midIndex}Am`] || weeklyData[`wf${midIndex}Pm`] || '';
            let tempAdjustment = 0;
            
            if (weather && weather.includes('맑음')) tempAdjustment = 1;
            else if (weather && weather.includes('구름많음')) tempAdjustment = 0;
            else if (weather && weather.includes('흐림')) tempAdjustment = -1;
            
            // 단기예보 데이터를 기반으로 예측
            minTemp = Math.round(parseInt(shortTermMin) + tempAdjustment);
            maxTemp = Math.round(parseInt(shortTermMax) + tempAdjustment);
            
            // 최저/최고 기온의 차이 유지 (최대 12도 차이 제한)
            const tempDiff = Math.min(parseInt(shortTermMax) - parseInt(shortTermMin), 12);
            if (maxTemp - minTemp < tempDiff) {
              maxTemp = minTemp + tempDiff;
            }
          }

          console.log(`[중기예보] ${i}일차 기온 데이터:`, {
            날짜: `${month}/${day}`,
            최저기온: minTemp,
            최고기온: maxTemp,
            날씨상태: weeklyData[`wf${midIndex}Am`] || weeklyData[`wf${midIndex}Pm`]
          });

          weeklyArray.push({
            date: `${month}/${day}`,
            dayOfWeek: `(${dayOfWeek})`,
            amWeather: amWeather ? getEmoji(amWeather) : '☀️',
            pmWeather: pmWeather ? getEmoji(pmWeather) : '☀️',
            amRainProb: amRainProb ? `${amRainProb}%` : '0%',
            pmRainProb: pmRainProb ? `${pmRainProb}%` : '0%',
            minTemp: minTemp !== '-' ? `${minTemp}°` : '-',
            maxTemp: maxTemp !== '-' ? `${maxTemp}°` : '-'
          });
        }
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
                <Text style={[styles.weeklyEmoji, { fontSize: 24 }]}>{item.amWeather}</Text>
                <Text style={[styles.weeklyRainProb, { fontSize: 14 }]}>{item.amRainProb}</Text>
              </View>
              <View style={[styles.weeklyWeatherColumn, { width: 80, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyEmoji, { fontSize: 24 }]}>{item.pmWeather}</Text>
                <Text style={[styles.weeklyRainProb, { fontSize: 14 }]}>{item.pmRainProb}</Text>
              </View>
              <View style={[styles.weeklyTempColumn, { width: 100, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[styles.weeklyTemp, { fontSize: 16, color: '#666' }]}>
                  {item.minTemp !== undefined && item.maxTemp !== undefined ? 
                    `${item.minTemp} / ${item.maxTemp}` : 
                    '-/-'}
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
    if (!warningData) return <Text style={styles.noWarning}>기상 특보 데이터가 없습니다.</Text>;
    return <Text style={styles.warningText}>{warningData}</Text>;
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
              <Text style={styles.locationText}>{currentLocation}</Text>
              <Text style={styles.currentTemp}>
                {weatherData.response.body.items.item.find(item => item.category === 'T1H')?.fcstValue || '-'}°
              </Text>
              <Text style={styles.weatherDesc}>
                {(() => {
                  const pty = weatherData.response.body.items.item.find(item => item.category === 'PTY')?.fcstValue;
                  const sky = weatherData.response.body.items.item.find(item => item.category === 'SKY')?.fcstValue;
                  return getWeatherEmoji(pty, sky);
                })()}
                {(() => {
                  const pty = weatherData.response.body.items.item.find(item => item.category === 'PTY')?.fcstValue;
                  const sky = weatherData.response.body.items.item.find(item => item.category === 'SKY')?.fcstValue;
                  return getWeatherText(pty, sky);
                })()}
              </Text>
              <Text style={styles.weatherValue}>
                습도: {weatherData.response.body.items.item.find(item => item.category === 'REH')?.fcstValue || '-'}%
              </Text>
              {shortTermData?.response?.body?.items?.item && (
                <Text style={styles.tempRange}>
                  {(() => {
                    const items = shortTermData.response.body.items.item;
                    
                    // 최저기온과 최고기온 찾기
                    const tmn = items.find(item => item.category === 'TMN')?.fcstValue;
                    const tmx = items.find(item => item.category === 'TMX')?.fcstValue;

                    // 로그 출력
                    console.log(`[현재 날씨] 기준 시각: ${forecastDateStr} ${baseTime}`);
                    console.log(`[현재 날씨] 최저: ${tmn}°, 최고: ${tmx}°`);
                    console.log(`[현재 날씨] 전체 데이터 수: ${items.length}`);
                    console.log(`[현재 날씨] 전체 카테고리:`, items.map(item => item.category).join(', '));
                    
                    if (tmn || tmx) {
                      return `최저 ${tmn || '-'}° / 최고 ${tmx || '-'}°`;
                    } else {
                      return '최저/최고 온도 정보 없음';
                    }
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