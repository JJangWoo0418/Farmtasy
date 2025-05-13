// app/Components/Css/FarmInfo/WeatherAPI.js

import axios from 'axios';
import { WEATHER_API_KEY_PORTAL, WEATHER_API_KEY_KMA } from '../../API/apikey';
import { XMLParser } from 'fast-xml-parser';

// fast-xml-parser 설정
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    return name === 'item'; // item만 배열로 처 리
  }
});


// 공통 API 요청 함수
const fetchAPI = async (url, params) => {
  try {
    const response = await axios.get(url, { params });
    const xml = response.data;
    // console.log('[LOG] 날씨 API 원 응답:', xml);
    return parser.parse(xml);
  } catch (error) {
    console.error('[ERROR] 기상청 API 요청 오류:', error);
    return null;
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

// 초단기실황조회
export const fetchUltraSrtNcst = async ({ nx, ny, base_date, base_time }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst', {
    serviceKey: WEATHER_API_KEY_PORTAL,
    pageNo: 1,
    numOfRows: 1000,
    dataType: 'XML',
    base_date,
    base_time,
    nx,
    ny,
  });
};

// 초단기예보조회 (fallback 적용)
export const fetchUltraSrtFcst = async (params) => {
  const res = await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst', {
    serviceKey: WEATHER_API_KEY_PORTAL,
    pageNo: 1,
    numOfRows: 1000,
    dataType: 'XML',
    ...params,
  });

  const code = res?.response?.header?.resultCode;
  if (code === '03' || !res?.response?.body?.items?.item?.length) {
    console.warn('[WARN] 초단기예보 NO_DATA fallback 적용');
    const fallbackDate = getFallbackDate(params.base_date);
    return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst', {
      ...params,
      base_date: fallbackDate,
      serviceKey: WEATHER_API_KEY_PORTAL,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'XML',
    });
  }

  return res;
};

// 단기예보조회
export const fetchVilageFcst = async ({ nx, ny, base_date, base_time }) => {
  try {
    // console.log('단기예보 API 호출:', { nx, ny, base_date, base_time });  // 로그 추가
    const response = await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'XML',
      base_date,
      base_time,
      nx,
      ny,
    });
    // console.log('단기예보 응답:', response);    // 로그 추가
    return response;
  } catch (error) {
    console.error('단기예보 API 오류:', error); // 로그 추가
    return null;
  }
};

// 중기육상예보 (fallback 적용)
export const fetchMidLandFcst = async ({ regId, tmFc }) => {
  try {
    // console.log('중기예보 API 호출:', { regId, tmFc });  // 로그 추가
    const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      dataType: 'XML',
      regId,
      tmFc,
    });
    // console.log('중기예보 응답:', res);    // 로그 추가

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
    console.error('중기예보 API 오류:', error); // 로그 추가
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

// 중기기온예보 (fallback 적용)
export const fetchMidTa = async ({ regId, tmFc }) => {
  try {
    console.log('[중기기온예보] API 호출:', { regId, tmFc });
    const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa', {
      serviceKey: WEATHER_API_KEY_PORTAL,
      dataType: 'XML',
      regId,
      tmFc,
    });

    const code = res?.response?.header?.resultCode;
    if (code === '03' || !res?.response?.body?.items?.item?.length) {
      console.warn('[WARN] 중기기온예보 NO_DATA fallback 적용');
      const fallbackDate = getFallbackDate(tmFc.slice(0, 8)) + tmFc.slice(8);
      return await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa', {
        serviceKey: WEATHER_API_KEY_PORTAL,
        dataType: 'XML',
        regId,
        tmFc: fallbackDate,
      });
    }

    // 온도 데이터 처리
    const item = res?.response?.body?.items?.item?.[0];
    if (item) {
      for (let i = 4; i <= 10; i++) {
        if (item[`taMax${i}`] === '0' || item[`taMax${i}`] === 0) {
          item[`taMax${i}`] = item[`taMax${i}High`] || item[`taMax${i}Low`] || '-';
        }
        if (item[`taMin${i}`] === '0' || item[`taMin${i}`] === 0) {
          item[`taMin${i}`] = item[`taMin${i}High`] || item[`taMin${i}Low`] || '-';
        }
      }
    }

    return res;
  } catch (error) {
    console.error('[ERROR] 중기기온예보 API 오류:', error);
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
    } else {
      console.error('[ERROR] 격자 정보 없음.');
      return null;
    }
  } catch (error) {
    console.error('[ERROR] 격자 변환 요청 오류:', error.response || error.message);
    return null;
  }
};

// 시간대별 날씨 데이터 통합 함수
export const fetchHourlyWeather = async ({ nx, ny, base_date, base_time }) => {
  try {
    // 실시간 데이터와 예보 데이터를 병렬로 가져옴
    const [ncstData, fcstData] = await Promise.all([
      fetchUltraSrtNcst({ nx, ny, base_date, base_time }),
      fetchUltraSrtFcst({ nx, ny, base_date, base_time })
    ]);

    // 데이터 통합 및 정렬
    const combinedData = [];
    
    // 실시간 데이터 처리
    if (ncstData?.response?.body?.items?.item) {
      combinedData.push(...ncstData.response.body.items.item.map(item => ({
        ...item,
        type: 'ncst'
      })));
    }

    // 예보 데이터 처리
    if (fcstData?.response?.body?.items?.item) {
      combinedData.push(...fcstData.response.body.items.item.map(item => ({
        ...item,
        type: 'fcst'
      })));
    }

    // 시간순으로 정렬
    combinedData.sort((a, b) => {
      const timeA = a.fcstTime || a.obsrTime;
      const timeB = b.fcstTime || b.obsrTime;
      return timeA - timeB;
    });

    return combinedData;
  } catch (error) {
    console.error('[ERROR] 시간대별 날씨 데이터 통합 오류:', error);
    return null;
  }
};

// 주간 날씨 데이터 통합 함수
export const fetchWeeklyWeather = async ({ regId, tmFc }) => {
  try {
    // 중기 육상예보와 기온예보를 병렬로 가져옴
    const [landData, taData] = await Promise.all([
      fetchMidLandFcst({ regId, tmFc }),
      fetchMidTa({ regId, tmFc })
    ]);

    const weeklyData = [];

    // 육상예보 데이터 처리
    if (landData?.response?.body?.items?.item) {
      landData.response.body.items.item.forEach(item => {
        // 날짜 형식 변환 (YYYYMMDD -> MM/DD)
        const date = item.tmFc.slice(0, 8);
        const month = parseInt(date.slice(4, 6));
        const day = parseInt(date.slice(6, 8));
        const formattedDate = `${month}/${day}`;
        
        // 요일 계산
        const dayOfWeek = new Date(
          parseInt(date.slice(0, 4)),
          month - 1,
          day
        ).toLocaleDateString('ko-KR', { weekday: 'short' });

        weeklyData.push({
          date: formattedDate,
          dayOfWeek,
          amWeather: item.wf3Am || item.wf4Am || item.wf5Am || item.wf6Am || item.wf7Am,
          pmWeather: item.wf3Pm || item.wf4Pm || item.wf5Pm || item.wf6Pm || item.wf7Pm,
          amRainProb: item.rnSt3Am || item.rnSt4Am || item.rnSt5Am || item.rnSt6Am || item.rnSt7Am,
          pmRainProb: item.rnSt3Pm || item.rnSt4Pm || item.rnSt5Pm || item.rnSt6Pm || item.rnSt7Pm,
          type: 'land'
        });
      });
    }

    // 기온예보 데이터 처리
    if (taData?.response?.body?.items?.item) {
      taData.response.body.items.item.forEach(item => {
        const date = item.tmFc.slice(0, 8);
        const month = parseInt(date.slice(4, 6));
        const day = parseInt(date.slice(6, 8));
        const formattedDate = `${month}/${day}`;

        const existingData = weeklyData.find(d => d.date === formattedDate);
        if (existingData) {
          // 3일차부터 10일차까지의 온도 데이터 처리
          for (let i = 3; i <= 10; i++) {
            if (item[`taMax${i}`] && item[`taMin${i}`]) {
              existingData.maxTemp = parseInt(item[`taMax${i}`]);
              existingData.minTemp = parseInt(item[`taMin${i}`]);
              break;
            }
          }
        }
      });
    }

    // 날짜순으로 정렬
    weeklyData.sort((a, b) => {
      const [aMonth, aDay] = a.date.split('/').map(Number);
      const [bMonth, bDay] = b.date.split('/').map(Number);
      if (aMonth === bMonth) {
        return aDay - bDay;
      }
      return aMonth - bMonth;
    });

    // 데이터 검증 및 로깅
    console.log('[주간 날씨] 최종 데이터:', weeklyData);

    // 중기예보 데이터 처리
    const landFcstData = landData?.response?.body?.items?.item?.[0] ?? null;
    const taFcstData = taData?.response?.body?.items?.item?.[0] ?? null;

    if (landFcstData || taFcstData) {
      // 두 데이터 합치기
      const weatherData = {
        ...landFcstData,
        ...taFcstData
      };
      
      // 온도 데이터가 0인 경우 처리
      for (let i = 4; i <= 10; i++) {
        if (weatherData[`taMax${i}`] === 0) {
          weatherData[`taMax${i}`] = weatherData[`taMax${i}High`] || weatherData[`taMax${i}Low`] || '-';
        }
        if (weatherData[`taMin${i}`] === 0) {
          weatherData[`taMin${i}`] = weatherData[`taMin${i}High`] || weatherData[`taMin${i}Low`] || '-';
        }
      }
      
      console.log('[주간 날씨] 병합된 데이터:', weatherData);
      return weatherData;
    } else {
      console.warn('[주간 날씨] 데이터 없음');
      return null;
    }
  } catch (error) {
    console.error('[ERROR] 주간 날씨 데이터 통합 오류:', error);
    return null;
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

