// app/Components/Css/FarmInfo/WeatherAPI.js

import axios from 'axios';
import { WEATHER_API_KEY_PORTAL, WEATHER_API_KEY_KMA } from '../../API/apikey';
import { XMLParser } from 'fast-xml-parser';
import { getMidFcstTime, getBaseDateTime, getShortTermDateTime } from '../../../Components/Utils/timeUtils';

// fast-xml-parser 설정
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    return name === 'item'; // item만 배열로 처리
  }
});

// 로그 레벨 정의와 log 함수를 export로 변경
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

// 현재 로그 레벨 설정 (필요에 따라 변경 가능)
let currentLogLevel = LOG_LEVELS.DEBUG;

// log 함수도 export
export const log = (level, message, data = null) => {
  const levels = Object.values(LOG_LEVELS);
  const currentLevelIndex = levels.indexOf(currentLogLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex >= currentLevelIndex) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
    if (data) {
      console.log(data);
    }
  }
};

// 로그 레벨 설정 함수
export const setLogLevel = (level) => {
  if (Object.values(LOG_LEVELS).includes(level)) {
    currentLogLevel = level;
    log(LOG_LEVELS.INFO, `로그 레벨이 ${level}로 설정되었습니다.`);
  }
};

// 공통 API 요청 함수
const fetchAPI = async (url, params) => {
  try {
    // log(LOG_LEVELS.DEBUG, `API 요청 시작: ${url}`, params);  // 주석 처리
    const response = await axios.get(url, { params });
    // log(LOG_LEVELS.DEBUG, `API 응답: ${url}`, response.data);  // 주석 처리
    return parser.parse(response.data);
  } catch (error) {
    log(LOG_LEVELS.ERROR, `API 요청 실패: ${url}`, error.response?.data || error.message);
    throw error;
  }
};

// fallback 날짜 구하기 함수 (어제 날짜)
const getFallbackDate = (baseDate) => {
  const date = new Date(baseDate.slice(0, 4), baseDate.slice(4, 6) - 1, baseDate.slice(6, 8));
  date.setDate(date.getDate() - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

// fallback 시도 횟수를 제한하는 함수
const getFallbackDates = (baseDate, maxAttempts = 3) => {
  const dates = [];
  let currentDate = new Date(baseDate.slice(0, 4), baseDate.slice(4, 6) - 1, baseDate.slice(6, 8));
  
  for (let i = 0; i < maxAttempts; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    dates.push(`${yyyy}${mm}${dd}`);
  }
  
  return dates;
};

// 통합 호출 함수
export const fetchWeather = async (type, params) => {
  switch (type) {
    case 'ultraNcst':
      return await fetchUltraSrtNcst(params);
    case 'ultraFcst':
      return await fetchUltraSrtFcst(params);
    case 'villageFcst':
      return await fetchVilageFcst(params);
    case 'midLandFcst':
      return await fetchMidLandFcst(params);
    case 'midFcst':
      return await fetchMidSeaFcst(params);
    case 'midTa':
      return await fetchMidTa(params);
    case 'warning':
      return await fetchWarningNow();
    case 'typhoon':
      return await fetchTyphoon(params);
    case 'latlon':
      return await convertLatLonToGrid(params);
    default:
      console.error('[ERROR] 알 수 없는 요청 유형:', type);
      return null;
  }
};

// 초단기실황조회 수정
export const fetchUltraSrtNcst = async ({ nx, ny, base_date, base_time }) => {
  try {
    log(LOG_LEVELS.INFO, '[초단기실황] API 호출 시작');
    
    const res = await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'XML',
      base_date,
      base_time,
      nx,
      ny,
    });

    // 응답 데이터 가공
    const items = res?.response?.body?.items?.item || [];
    const processedData = {
      response: {
        header: res.response.header,
        body: {
          dataType: 'XML',
          items: {
            item: items.map(item => ({
              ...item,
              obsrValue: item.obsrValue,
              category: item.category
            }))
          }
        }
      }
    };

    return processedData;
  } catch (error) {
    log(LOG_LEVELS.ERROR, '[초단기실황] API 오류:', error);
    return null;
  }
};

// 초단기예보조회 수정
export const fetchUltraSrtFcst = async ({ nx, ny, base_date, base_time }) => {
  try {
    log(LOG_LEVELS.INFO, '[초단기예보] API 호출 시작');
    
    const res = await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'XML',
      base_date,
      base_time,
      nx,
      ny,
    });

    // 데이터 가공 후 반환
    const items = res?.response?.body?.items?.item || [];
    const processedData = {
      response: {
        header: res.response.header,
        body: {
          dataType: 'XML',
          items: {
            item: items.map(item => ({
              ...item,
              fcstTime: item.fcstTime,
              fcstValue: item.fcstValue,
              category: item.category
            }))
          }
        }
      }
    };

    return processedData;
  } catch (error) {
    log(LOG_LEVELS.ERROR, '[초단기예보] API 오류:', error);
    return null;
  }
};

// 강수량 포맷팅 함수 수정
const formatRainAmount = (value) => {
  if (!value || value === '0' || value === '강수없음') return '';
  if (value === '1.0mm 미만' || value.includes('미만')) return '1mm↓';
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';
  return `${Math.round(numValue)}mm`;
};

// 날씨 상태 텍스트 변환 함수 수정
const getWeatherText = (sky, pty) => {
  // PTY 우선 처리 (강수형태)
  if (pty && pty !== '0') {
    switch (pty) {
      case '1': return '비';
      case '2': return '비/눈';
      case '3': return '눈';
      case '4': return '소나기';
      default: return null;
    }
  }
  
  // SKY 처리 (하늘상태)
  if (!sky || sky === '') return '맑음';  // 기본값 처리
  
  switch (sky) {
    case '1': return '맑음';
    case '3': return '구름많음';
    case '4': return '흐림';
    default: return '맑음';
  }
};

// 단기예보 조회 함수 수정
export const fetchVilageFcst = async ({ nx, ny, base_date, base_time }) => {
  try {
    log(LOG_LEVELS.INFO, '[단기예보] API 호출 시작');
    
    // 시간 계산 로직 수정
    const hours = parseInt(base_time.slice(0, 2));
    const availableTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    let targetHour = availableTimes[availableTimes.length - 1]; // 기본값을 마지막 시간으로
    
    for (let i = 0; i < availableTimes.length; i++) {
      if (hours < availableTimes[i]) {
        targetHour = availableTimes[i - 1 >= 0 ? i - 1 : availableTimes.length - 1];
        break;
      }
    }
    
    // 자정 이전 처리
    let adjusted_base_date = base_date;
    if (hours < 2) {
      const yesterday = new Date(base_date.slice(0, 4), base_date.slice(4, 6) - 1, base_date.slice(6, 8));
      yesterday.setDate(yesterday.getDate() - 1);
      adjusted_base_date = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
      targetHour = 23;
    }

    const adjusted_base_time = String(targetHour).padStart(2, '0') + '00';
    
    log(LOG_LEVELS.DEBUG, '[단기예보] 조정된 요청 시각:', { adjusted_base_date, adjusted_base_time });

    // API 호출 시 수정된 시간 사용
    const res = await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'XML',
      base_date: adjusted_base_date,
      base_time: adjusted_base_time,
      nx,
      ny,
    });

    const items = res?.response?.body?.items?.item || [];
    const processedData = {};

    items.forEach(item => {
      const date = item.fcstDate;
      if (!processedData[date]) {
        processedData[date] = {
          date,
          amData: {},
          pmData: {},
          tmn: null,
          tmx: null,
        };
      }

      const hour = parseInt(item.fcstTime.slice(0, 2));
      const target = hour < 12 ? 'amData' : 'pmData';

      switch (item.category) {
        case 'TMN':
          processedData[date].tmn = parseInt(item.fcstValue);
          break;
        case 'TMX':
          processedData[date].tmx = parseInt(item.fcstValue);
          break;
        case 'SKY':
          processedData[date][target].sky = item.fcstValue;
          break;
        case 'PTY':
          processedData[date][target].pty = item.fcstValue;
          break;
        case 'POP':
          processedData[date][target].pop = parseInt(item.fcstValue);
          break;
      }
    });

    // log(LOG_LEVELS.DEBUG, '[단기예보] 처리된 데이터:', processedData);
    return processedData;
  } catch (error) {
    // log(LOG_LEVELS.ERROR, '[단기예보] API 오류:', error);
    return null;
  }
};

// 중기육상예보 (fallback 적용)
export const fetchMidLandFcst = async ({ regId, tmFc }) => {
  try {
    // console.log('[LOG] 중기예보 API 호출:', { regId, tmFc });  // 주석 처리
    const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      dataType: 'XML',
      regId,
      tmFc,
    });
    // console.log('[LOG] 중기예보 응답:', res);    // 주석 처리

    const code = res?.response?.header?.resultCode;
    if (code === '03' || !res?.response?.body?.items?.item?.length) {
      console.warn('[WARN] 중기육상예보 NO_DATA fallback 적용');
      const fallbackDate = getFallbackDate(tmFc.slice(0, 8)) + tmFc.slice(8);
      return await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst', {
        serviceKey: WEATHER_API_KEY_PORTAL,
        dataType: 'XML',
        regId,
        tmFc: fallbackDate,
      });
    }

    return res;
  } catch (error) {
    // console.error('[ERROR] 중기예보 API 오류:', error); // 주석 처리
    return null;
  }
};

// 중기해상예보 (fallback 적용)
export const fetchMidSeaFcst = async ({ regId, tmFc }) => {
  const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidSeaFcst', {
    serviceKey: WEATHER_API_KEY_PORTAL,
    dataType: 'XML',
    regId,
    tmFc,
  });

  const code = res?.response?.header?.resultCode;
  if (code === '03' || !res?.response?.body?.items?.item?.length) {
    console.warn('[WARN] 중기해상예보 NO_DATA fallback 적용');
    const fallbackDate = getFallbackDate(tmFc.slice(0, 8)) + tmFc.slice(8);
    return await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidSeaFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      dataType: 'XML',
      regId,
      tmFc: fallbackDate,
    });
  }

  return res;
};

// 중기기온예보 조회 함수 수정
export const fetchMidTa = async ({ regId, tmFc }) => {
  try {
    log(LOG_LEVELS.INFO, '[중기기온예보] API 호출 시작');
    log(LOG_LEVELS.DEBUG, '[중기기온예보] 요청 파라미터:', { regId, tmFc });

    const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      dataType: 'XML',
      regId,
      tmFc,
    });

    log(LOG_LEVELS.DEBUG, '[중기기온예보] API 응답:', res);

    const items = res?.response?.body?.items?.item;
    if (!items || items.length === 0) {
      log(LOG_LEVELS.WARN, '[중기기온예보] 데이터 없음');
      return null;
    }

    const item = items[0];
    log(LOG_LEVELS.DEBUG, '[중기기온예보] 원본 데이터:', item);

    // 온도 데이터 추출 (3~10일차)
    const temperatureData = {};
    for (let i = 3; i <= 10; i++) {
      const maxTemp = item[`taMax${i}`] || item[`taMax${i}High`] || item[`taMax${i}Low`];
      const minTemp = item[`taMin${i}`] || item[`taMin${i}High`] || item[`taMin${i}Low`];

      log(LOG_LEVELS.DEBUG, `[중기기온예보] ${i}일차 온도 키 확인:`, {
        maxKeys: [`taMax${i}`, `taMax${i}High`, `taMax${i}Low`],
        minKeys: [`taMin${i}`, `taMin${i}High`, `taMin${i}Low`],
        maxValues: [item[`taMax${i}`], item[`taMax${i}High`], item[`taMax${i}Low`]],
        minValues: [item[`taMin${i}`], item[`taMin${i}High`], item[`taMin${i}Low`]]
      });

      temperatureData[`day${i}`] = {
        maxTemp: maxTemp ? parseInt(maxTemp) : null,
        minTemp: minTemp ? parseInt(minTemp) : null
      };

      log(LOG_LEVELS.DEBUG, `[중기기온예보] ${i}일차 온도:`, temperatureData[`day${i}`]);
    }

    return temperatureData;
  } catch (error) {
    log(LOG_LEVELS.ERROR, '[중기기온예보] API 오류:', error);
    return null;
  }
};

// 기상특보 조회 (fallback 적용)
export const fetchWarningNow = async () => {
  const res = await fetchAPI('https://apis.data.go.kr/1360000/WthrWrnInfoService/getWthrWrnList', {
    serviceKey: WEATHER_API_KEY_PORTAL,
    dataType: 'XML',
    pageNo: 1,
    numOfRows: 100,
  });

  const code = res?.response?.header?.resultCode;
  if (code === '03' || !res?.response?.body?.items?.item?.length) {
    console.warn('[WARN] 기상특보 NO_DATA fallback 적용 - 이전 날 기준 요청 없음');
    return null;
  }

  return res;
};

// 태풍정보
export const fetchTyphoon = async ({ YY, typ, seq, mode }) => {
  return await fetchAPI('https://apihub.kma.go.kr/api/typ01/url/typ_data.php', {
    authKey: WEATHER_API_KEY_KMA,
    YY,
    typ,
    seq,
    mode,
  });
};

// 위경도 → 격자변환
export const convertLatLonToGrid = async ({ lat, lon }) => {
  try {
    console.log('[LOG] 모드: latlon');
    console.log('[LOG] 격자 변환 요청 좌표:', { lat, lon });

    // 기본 격자 좌표 (충청남도 천안시 기준)
    const defaultGrid = {
      x: 67,
      y: 100,
      lat: 36.8154,
      lon: 127.1138
    };

    try {
      const response = await axios.get('https://apihub.kma.go.kr/api/typ01/cgi-bin/url/nph-dfs_xy_lonlat', {
        params: {
          lat,
          lon,
          authKey: WEATHER_API_KEY_KMA,
        },
      });

      const text = response.data;
      const match = text.match(/\s+(\d+\.\d+),\s+(\d+\.\d+),\s+(\d+),\s+(\d+)/);

      if (match) {
        const result = {
          lon: parseFloat(match[1]),
          lat: parseFloat(match[2]),
          x: parseInt(match[3]),
          y: parseInt(match[4]),
        };
        console.log('[LOG] 격자 정보:', result);
        return result;
      }
    } catch (error) {
      console.warn('[WARN] 격자 변환 API 호출 실패, 기본 좌표 사용:', error);
    }

    // API 호출 실패 시 기본 격자 좌표 반환
    console.log('[LOG] 기본 격자 좌표 사용:', defaultGrid);
    return defaultGrid;
  } catch (error) {
    console.error('[ERROR] 격자 변환 요청 오류:', error);
    return null;
  }
};

// 캐시 설정 추가
const CACHE_DURATION = 10 * 60 * 1000; // 10분
const weatherCache = {
  current: new Map(),
  timestamp: new Map()
};

// 캐시된 날씨 데이터 확인 함수
const getCachedWeather = (key) => {
  const cached = weatherCache.current.get(key);
  const timestamp = weatherCache.timestamp.get(key);
  
  if (cached && timestamp && (Date.now() - timestamp < CACHE_DURATION)) {
    log(LOG_LEVELS.DEBUG, '[캐시] 캐시된 날씨 데이터 사용:', key);
    return cached;
  }
  return null;
};

// 날씨 데이터 캐시 저장 함수
const setCachedWeather = (key, data) => {
  weatherCache.current.set(key, data);
  weatherCache.timestamp.set(key, Date.now());
};

// 현재 날씨 데이터 가져오기
export const fetchCurrentWeather = async ({ nx, ny, location }) => {
  try {
    console.log('[DEBUG] fetchCurrentWeather - 요청 파라미터:', { nx, ny, location });
    
    const currentData = await fetchUltraSrtNcst({ nx, ny });
    console.log('[DEBUG] fetchCurrentWeather - 초단기실황 데이터:', currentData);
    
    const forecastData = await fetchVilageFcst({ nx, ny });
    // console.log('[DEBUG] fetchCurrentWeather - 단기예보 데이터:', forecastData);

    if (!currentData || !forecastData) {
      console.log('[ERROR] fetchCurrentWeather - 필요한 데이터 누락');
      return null;
    }

    const result = {
      location,
      current: {
        temp: currentData.temp,
        humidity: currentData.humidity,
        weather: currentData.weather
      },
      extremes: {
        tmn: forecastData.tmn,
        tmx: forecastData.tmx
      }
    };
    
    console.log('[DEBUG] fetchCurrentWeather - 최종 결과:', result);
    return result;
  } catch (error) {
    console.error('[ERROR] fetchCurrentWeather - API 호출 오류:', error);
    throw error;
  }
};

// 시간대별 날씨 데이터 통합 함수
export const fetchHourlyWeather = async ({ nx, ny }) => {
  try {
    log(LOG_LEVELS.INFO, '[시간대별날씨] API 호출 시작');
    
    // 1. 기준 시간 계산
    const { base_date, base_time } = getBaseDateTime();
    
    // 2. 초단기예보 데이터 가져오기
    const fcstData = await fetchUltraSrtFcst({ 
      nx, 
      ny, 
      base_date,
      base_time
    });
    
    if (!fcstData || !Array.isArray(fcstData)) {
      log(LOG_LEVELS.ERROR, '[시간대별날씨] 초단기예보 데이터 없음');
      return [];
    }

    // 시간별 데이터 그룹화
    const timeGroups = {};
    fcstData.forEach(item => {
      const time = item.fcstTime;
      if (!timeGroups[time]) {
        timeGroups[time] = {
          fcstDate: item.fcstDate,
          fcstTime: time,
          temp: null,
          humidity: null,
          pty: '0',
          sky: '1',
          rainAmount: ''
        };
      }

      switch (item.category) {
        case 'T1H':
          timeGroups[time].temp = parseFloat(item.fcstValue);
          break;
        case 'REH':
          timeGroups[time].humidity = parseInt(item.fcstValue);
          break;
        case 'PTY':
          timeGroups[time].pty = item.fcstValue;
          break;
        case 'SKY':
          timeGroups[time].sky = item.fcstValue;
          break;
        case 'RN1':
          timeGroups[time].rainAmount = formatRainAmount(item.fcstValue);
          break;
      }
    });

    // 시간 순으로 정렬하여 반환
    const hourlyData = Object.values(timeGroups)
      .sort((a, b) => parseInt(a.fcstTime) - parseInt(b.fcstTime))
      .map(data => ({
        time: data.fcstTime,
        temp: data.temp,
        humidity: data.humidity,
        pty: data.pty,
        sky: data.sky,
        rainAmount: data.rainAmount,
        weather: getWeatherText(data.sky, data.pty)
      }));

    log(LOG_LEVELS.INFO, '[시간대별날씨] 최종 데이터 처리 완료');
    return hourlyData;

  } catch (error) {
    log(LOG_LEVELS.ERROR, '[시간대별날씨] 오류 발생:', error);
    return [];
  }
};

// 최고/최저 온도를 가져오는 함수
export const fetchDailyTemperature = async ({ regId, tmFc }) => {
  const midTa = await fetchMidTa({ regId, tmFc });
  if (!midTa?.response?.body?.items?.item) return null;

  const items = midTa.response.body.items.item;
  const dailyTemps = {};

  items.forEach(item => {
    const date = item.tm.substring(0, 8); // YYYYMMDD
    if (!dailyTemps[date]) {
      dailyTemps[date] = {
        max: -100,
        min: 100
      };
    }

    if (item.taMax) dailyTemps[date].max = Math.max(dailyTemps[date].max, parseInt(item.taMax));
    if (item.taMin) dailyTemps[date].min = Math.min(dailyTemps[date].min, parseInt(item.taMin));
  });

  return dailyTemps;
};

