// app/Components/Css/FarmInfo/WeatherAPI.js

import axios from 'axios';
import { WEATHER_API_KEY_PORTAL, WEATHER_API_KEY_KMA } from '../../API/apikey';
import { XMLParser } from 'fast-xml-parser';

// fast-xml-parser 설정
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => name === 'item',
});

// 공통 API 요청 함수
const fetchAPI = async (url, params) => {
  try {
    const response = await axios.get(url, { params });
    const xml = response.data;
    console.log('[LOG] 날씨 API 원 응답:', xml);
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
    case 'vilageFcst':
      return await fetchVilageFcst(params);
    case 'midLandFcst':
      return await fetchMidLandFcst(params);
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
  return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst', {
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

// 중기육상예보 (fallback 적용)
export const fetchMidLandFcst = async ({ regId, tmFc }) => {
  const res = await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst', {
    serviceKey: WEATHER_API_KEY_PORTAL,
    dataType: 'XML',
    regId,
    tmFc,
  });

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
};

// 중기기온예보 (fallback 적용)
export const fetchMidTa = async ({ regId, tmFc }) => {
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

  return res;
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
