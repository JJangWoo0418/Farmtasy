// app/FarmInfo/Weather.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, Image, navigation, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import styles from '../Components/Css/FarmInfo/index.js';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';
import { getMidLandRegId } from '../Components/Utils/regionMapper';
import * as Location from 'expo-location';
import { getHistoricalTemperature } from '../Components/Utils/weatherUtils';
import { useWeather, WeatherProvider } from '../context/WeatherContext';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import API_CONFIG from '../DB/api'; // API_CONFIG 임포트
// import { Asset } from 'expo-asset'; // Asset 더 이상 사용 안 함

// 평균 기온 JSON 데이터 (파일에서 로드)
let avgTempData = [];

// JSON 데이터 로드 함수
const loadAvgTempData = async () => {
  try {
    // require를 사용하여 JSON 데이터를 객체로 가져온 뒤 사용
    // 이 방식은 FileSystem 접근 오류를 우회합니다.
    const jsonData = require('../../assets/avg_daily_temp_no_year.json');
    // require 결과를 바로 사용하지 않고 깊은 복사 후 사용 (안정성 확보)
    avgTempData = JSON.parse(JSON.stringify(jsonData));

    console.log('[평균 기온 JSON] 데이터 로드 성공', avgTempData.length);
  } catch (error) {
    console.error('[평균 기온 JSON] 데이터 로드 실패:', error);
  }
};

const WeatherContent = () => {
  const {
    weatherData,
    shortTermData,
    weeklyData,
    locationName,
    baseTimeInfo,
    isLoading,
    setWeatherData,
    setShortTermData,
    setWeeklyData,
    setLocationName,
    setBaseTimeInfo,
    setIsLoading,
    isFarmSelectModalVisible,
    setIsFarmSelectModalVisible,
    allUserFarms,
    currentFarm,
    setCurrentFarm,
    fetchUserFarms,
    openFarmSelectModal,
    handleFarmSelect,
  } = useWeather();

  const params = useLocalSearchParams();
  const [mode, setMode] = useState('farm');
  const [warningData, setWarningData] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [forecastDateStr, setForecastDateStr] = useState('');
  const [baseTime, setBaseTime] = useState('');
  const [weeklyTemps, setWeeklyTemps] = useState({});
  const [currentLocation, setCurrentLocation] = useState('');

  // mode 또는 currentFarm이 변경될 때마다 날씨 로드
  useEffect(() => {
    loadWeather();
  }, [mode, currentFarm]);

  // 컴포넌트 마운트 시 평균 기온 데이터 로드 및 첫 농장 정보 로드
  useEffect(() => {
    loadAvgTempData();
    // 첫 로딩 시 사용자 농장 목록을 가져와 첫 번째 농장을 currentFarm으로 설정
    const loadInitialFarm = async () => {
      if (!params.phone) {
         console.error('[첫 농장 로드] 사용자 전화번호 없음');
         return;
      }
      const farms = await fetchUserFarms();
      if (farms.length > 0) {
        setCurrentFarm(farms[0]); // 첫 번째 농장으로 설정
      }
    };
    loadInitialFarm();
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

  const loadWeather = async () => {
    try {
      setIsLoading(true);
      let coords = null;
      console.log('[날씨 로드] 시작 - 모드:', mode);

      if (mode === 'current') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.error('[위치 권한] 거부됨');
            setIsLoading(false);
            return;
          }

          const position = await Location.getCurrentPositionAsync({});
          coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('[현재 위치] 좌표:', coords);
          
          const locationName = await getLocationName(coords.latitude, coords.longitude);
          setCurrentLocation(locationName);
        } catch (error) {
          console.error('[위치 오류]:', error);
          setIsLoading(false);
          return;
        }
      } else { // mode === 'farm'
        // Map.js에서 전달받은 농장 좌표 또는 현재 선택된 농장 좌표 사용
        if (params.latitude && params.longitude) {
          coords = {
            latitude: parseFloat(params.latitude),
            longitude: parseFloat(params.longitude)
          };
          console.log('[농장 위치] Map에서 전달받은 좌표 사용:', coords);
          const locationName = await getLocationName(coords.latitude, coords.longitude);
          setCurrentLocation(locationName);
           // Map에서 전달받은 농장 정보로 currentFarm 초기화 - 이제 WeatherContent에서 처리
          if (params.farmName) {
            setCurrentFarm({ farm_id: null, farm_name: params.farmName, latitude: coords.latitude, longitude: coords.longitude }); // Map에서 넘어온 정보로 currentFarm 설정
          } else if (!currentFarm) {
             // Map에서 넘어왔지만 farmName이 없는 경우 (Map 수정 필요)
             setCurrentFarm({ farm_id: null, farm_name: locationName, latitude: coords.latitude, longitude: coords.longitude });
          }
        } else {
          // Map.js를 거치지 않고 직접 왔거나, 농장 선택 모달에서 선택했을 경우
          if (!currentFarm) { // currentFarm이 설정되지 않았을 경우 (초기 로딩)
             console.warn('[농장 위치] currentFarm 상태가 설정되지 않았습니다.');
             setIsLoading(false);
             setWeatherData(null);    // 기존 날씨 데이터 초기화
             setShortTermData(null); // 기존 단기예보 데이터 초기화
             setWeeklyData(null);    // 기존 주간예보 데이터 초기화
             return; // currentFarm이 설정될 때까지 대기
          }
          // currentFarm에 설정된 농장 좌표 사용
          coords = {
             latitude: parseFloat(currentFarm.latitude),
             longitude: parseFloat(currentFarm.longitude)
          };
          console.log('[농장 위치] 선택된 농장 좌표 사용:', coords);
          const locationName = await getLocationName(coords.latitude, coords.longitude);
          setCurrentLocation(currentFarm.farm_name || locationName); // 농장 이름 우선 사용
        }
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
      setIsLoading(false);
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

    setIsLoading(false);
    } catch (error) {
      console.error('[날씨 로드] 전체 중 오류:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!weatherData || !shortTermData || !weeklyData) {
      loadWeather();
    }
  }, [weatherData, shortTermData, weeklyData]);

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

  useEffect(() => {
    // 전달받은 데이터가 있으면 상태 업데이트
    if (params.weatherData && params.shortTermData && params.weeklyData) {
      try {
        console.log('[미리 로드된 데이터] 사용');
        setWeatherData(JSON.parse(params.weatherData));
        setShortTermData(JSON.parse(params.shortTermData));
        setWeeklyData(JSON.parse(params.weeklyData));
        
        // 위치 정보 설정
        setCurrentLocation(params.locationName || '위치 정보 없음');
        
        // 기준 시간 정보 설정
        if (params.baseTimeInfo) {
          const baseTimeInfo = JSON.parse(params.baseTimeInfo);
          setBaseTimeInfo(baseTimeInfo);
        }
      } catch (error) {
        console.error('[미리 로드된 데이터] 파싱 오류:', error);
        loadWeather();  // 파싱 오류 시 새로 로드
      }
    } else {
      loadWeather();  // 미리 로드된 데이터가 없으면 새로 로드
    }
  }, [params.weatherData, params.shortTermData, params.weeklyData, params.locationName, params.baseTimeInfo]);

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
            const pop = data['POP'] ? `${data['POP']}%` : '강수없음';
            
            const emoji = getWeatherEmoji(pty, sky);

            // 풍향(VEC)과 풍속(WSD) 정보 추출
            const wsd = data['WSD'] ? data['WSD'] : '0'; // 풍속이 없거나 '-'인 경우 0으로 표시
            const vec = data['VEC'] ? data['VEC'] : '-'; // 풍향(도)

            // 풍향(도수)을 8방위 이모지로 변환하는 함수
            const getWindDirectionEmoji = (deg) => {
              if (deg === '-' || deg === undefined) return '·';
              const d = parseInt(deg, 10);
              if ((d >= 338 || d < 23)) return '↑';    // 북
              if (d >= 23 && d < 68) return '↗';      // 북동
              if (d >= 68 && d < 113) return '→';     // 동
              if (d >= 113 && d < 158) return '↘';    // 남동
              if (d >= 158 && d < 203) return '↓';    // 남
              if (d >= 203 && d < 248) return '↙';    // 남서
              if (d >= 248 && d < 293) return '←';    // 서
              if (d >= 293 && d < 338) return '↖';    // 북서
              return '·';
            };
            const windEmoji = getWindDirectionEmoji(vec);
            
            console.log(`[시간대별 날씨] 시간: ${hour}시, PTY: ${pty}, SKY: ${sky}, 이모지: ${emoji}, 풍향: ${windEmoji}, 풍속: ${wsd}`);
            
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
                {/* 강수확률(POP) - 값이 없으면 '강수없음'을 작게, 아래 패딩 추가 */}
                <Text style={[styles.rainValue, !data['POP'] && { fontSize: 12, paddingBottom: 4 }]}> {pop} </Text>
                <Text style={[
                  styles.weatherTemp,
                  isCurrentHour && styles.weatherTempCurrent
                ]}>{t1h}</Text>
                {/* 풍향(이모지) + 풍속(m/s) 표시, 습도 대신 */}
                <Text style={styles.weatherValue}>
                  {windEmoji} {wsd === '-' ? '0' : wsd}
                </Text>
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
          
          // 기온 데이터 - API에서 받은 값 또는 평균 기온 사용
          let minTemp = weeklyData[`taMin${midIndex}`] || '-';
          let maxTemp = weeklyData[`taMax${midIndex}`] || '-';

          // API 데이터가 없을 경우 JSON 데이터 사용
          if (minTemp === '-' || maxTemp === '-') {
            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i); // i는 4부터 7까지
            const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
            const day = targetDate.getDate().toString().padStart(2, '0');
            const formattedDate = `${month}-${day}`;

            const avgData = avgTempData.find(item => item.date === formattedDate);

            if (avgData) {
              console.log(`[주간 날씨] ${i}일차 (${formattedDate}) 평균 기온 사용: 최저 ${avgData.avg_min_temp}°, 최고 ${avgData.avg_max_temp}°`);
              // 평균 기온 데이터를 반올림하여 사용
              if (minTemp === '-') minTemp = Math.round(avgData.avg_min_temp);
              if (maxTemp === '-') maxTemp = Math.round(avgData.avg_max_temp);
            } else {
              console.warn(`[주간 날씨] ${i}일차 (${formattedDate}) 평균 기온 데이터 없음.`);
            }
          }

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
      <View style={styles.header}>
                                <TouchableOpacity onPress={() => router.back()}>
                                    <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                                </TouchableOpacity>
                                <Text style={styles.title}>날씨</Text>
                            </View>
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
      {/*종합날씨*/}
      <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
        <View style={styles.currentWeatherBox}>
          {isLoading ? (
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
                    const tmn = items.find(item => item.category === 'TMN')?.fcstValue;
                    const tmx = items.find(item => item.category === 'TMX')?.fcstValue;
                    if (tmn || tmx) {
                      return `최저 ${tmn || '-'}° / 최고 ${tmx || '-'}°`;
                    } else {
                      return '최저/최고 온도 정보 없음';
                    }
                  })()}
                </Text>
              )}
              <Text style={styles.weatherValue}>
                {weatherData.response.body.items.item.find(item => item.category === 'POP')?.fcstValue || '강수 없음'}
                {weatherData.response.body.items.item.find(item => item.category === 'POP')?.fcstValue ? '%' : ''}
              </Text>
              {/* 농장 변경 버튼 추가 */}
              {mode === 'farm' && (
                <TouchableOpacity style={styles.changeFarmButton} onPress={openFarmSelectModal}>
                  <Text style={styles.changeFarmButtonText}>농장 변경</Text>
                </TouchableOpacity>
              )}
            </>
          ) : mode === 'farm' && !currentFarm ? (
            <TouchableOpacity onPress={() => router.push({ pathname: '/Map/Map', params: { ...params } })}> 
              <Text style={[styles.noWarning, { color: '#22CC6B' }]}>내 농장 설정하기</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noWarning}>날씨 데이터를 불러올 수 없습니다.</Text>
          )}
        </View>

        <Text style={[styles.sourceText, { color: '#666', paddingHorizontal: 16, marginTop: 0, textAlign: 'right' }]}>출처 : 기상청</Text>

        <Text style={styles.sectionTitle}>시간대별 날씨</Text>
        {isLoading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : mode === 'farm' && !currentFarm ? (
          <Text style={styles.noWarning}>내 농장을 설정해 주세요.</Text>
        ) : (
          renderForecast()
        )}

        <Text style={styles.sectionTitle}>주간 날씨</Text>
        {isLoading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : mode === 'farm' && !currentFarm ? (
          <Text style={styles.noWarning}>내 농장을 설정해 주세요.</Text>
        ) : (
          renderWeekly()
        )}

        <Text style={styles.sectionTitle}>기상 특보</Text>
        {isLoading ? (
          <Text style={styles.loading}>로딩중...</Text>
        ) : mode === 'farm' && !currentFarm ? (
          <View style={styles.warningContainer}>
            <Text style={styles.noWarning}>내 농장을 설정해 주세요.</Text>
          </View>
        ) : (
          <View style={styles.warningContainer}>
            {renderWarning()}
      </View>
        )}
    </ScrollView>

      {/* 농장 선택 모달 렌더링 - WeatherContent 내부로 이동 */}
      <FarmSelectModal
        isVisible={isFarmSelectModalVisible}
        farms={allUserFarms}
        onClose={() => setIsFarmSelectModalVisible(false)}
        onSelectFarm={handleFarmSelect}
      />
    </View>
  );
};

// 농장 선택 모달 컴포넌트 (WeatherContent 외부 유지)
const FarmSelectModal = ({ isVisible, farms, onClose, onSelectFarm }) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>농장 선택</Text>
          <ScrollView>
            {farms.map((farm, index) => (
              <TouchableOpacity
                key={index}
                style={styles.farmItem}
                onPress={() => onSelectFarm(farm)}
              >
                {/* 농장 이모지 추가 */}
                <Text style={styles.farmEmoji}>📍</Text>
                <Text style={styles.farmName}>{farm.farm_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 닫기 버튼 컨테이너 추가 */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function Weather() {
  // useLocalSearchParams를 여기서 한 번만 호출하여 phone 값을 가져옵니다.
  const params = useLocalSearchParams();
  const userPhone = params.phone;

  return (
    // WeatherProvider에 userPhone prop 전달
    <WeatherProvider userPhone={userPhone}>
      <WeatherContent />
    </WeatherProvider>
  );
}