// app/Components/Css/FarmInfo/WeatherAPI.js
import axios from 'axios';
import { WEATHER_API_KEY } from '../../API/apikey';

// 공통 API 요청 함수
const fetchAPI = async (url, params) => {
  try {
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${query}`;

    const response = await axios.get(fullUrl, {
      headers: {
        Accept: 'application/json', // JSON 명시
      },
      responseType: 'json', // 이 부분 추가
    });

    return response.data;
  } catch (error) {
    console.error('[ERROR] 기상청 API 요청 오류:', error);
    return null;
  }
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
    case 'latlon': {
      const { lat, lon } = params || {};
      if (lat === undefined || lon === undefined) {
        console.error('[ERROR] 격자 변환 파라미터 누락');
        return null;
      }
      return await convertLatLonToGrid({ lat, lon });
    }
    default:
      console.error('[ERROR] 알 수 없는 요청 유형:', type);
      return null;
  }
};

// 초단기실황조회
export const fetchUltraSrtNcst = async ({ nx, ny, base_date, base_time }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst', {
    serviceKey: WEATHER_API_KEY,
    pageNo: 1,
    numOfRows: 1000,
    dataType: 'JSON',
    base_date,
    base_time,
    nx,
    ny,
  });
};

// 초단기예보조회
export const fetchUltraSrtFcst = async ({ nx, ny, base_date, base_time }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst', {
    serviceKey: WEATHER_API_KEY,
    pageNo: 1,
    numOfRows: 1000,
    dataType: 'JSON',
    base_date,
    base_time,
    nx,
    ny,
  });
};

// 단기예보조회
export const fetchVilageFcst = async ({ nx, ny, base_date, base_time }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst', {
    serviceKey: WEATHER_API_KEY,
    pageNo: 1,
    numOfRows: 1000,
    dataType: 'JSON',
    base_date,
    base_time,
    nx,
    ny,
  });
};

// 중기육상예보
export const fetchMidLandFcst = async ({ regId, tmFc }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst', {
    serviceKey: WEATHER_API_KEY,
    dataType: 'JSON',
    regId,
    tmFc,
  });
};

// 중기기온예보
export const fetchMidTa = async ({ regId, tmFc }) => {
  return await fetchAPI('https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa', {
    serviceKey: WEATHER_API_KEY,
    dataType: 'JSON',
    regId,
    tmFc,
  });
};

// 기상특보
export const fetchWarningNow = async () => {
  return await fetchAPI('https://apihub.kma.go.kr/api/typ01/url/wrn_now_data.php', {
    authKey: WEATHER_API_KEY,
    fe: 'f',
  });
};

// 태풍정보
export const fetchTyphoon = async ({ YY, typ, seq, mode }) => {
  return await fetchAPI('https://apihub.kma.go.kr/api/typ01/url/typ_data.php', {
    authKey: WEATHER_API_KEY,
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
        authKey: WEATHER_API_KEY,
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
    console.error('[ERROR] 격자 변환 요청 오류:', error);
    return null;
  }
};
