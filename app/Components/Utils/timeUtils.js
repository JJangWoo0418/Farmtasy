// app/Components/Utils/timeUtils.js

// 파일 상단에 추가
import { LOG_LEVELS, log } from '../Css/FarmInfo/WeatherAPI';

// 날짜와 시간 관련 유틸리티 함수들

// 초단기실황/예보용 시간 계산 함수
export const getBaseDateTime = () => {
  const now = new Date();
  console.log('[시간 계산] 현재 시각:', now);  // log 대신 console.log 사용

  // 날짜 형식 변환 (YYYYMMDD)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const base_date = `${year}${month}${day}`;
  
  // 시간 형식 변환 (HHMM)
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = now.getMinutes();
  
  // API 제공 시간이 매시각 40분이므로, 40분 이전이면 한 시간 전 데이터를 요청
  const base_hour = minute < 40 ? String(now.getHours() - 1).padStart(2, '0') : hour;
  const base_time = `${base_hour}00`;

  const result = { base_date, base_time };
  console.log('[시간 계산] 계산된 기준 시각:', result);  // log 대신 console.log 사용

  return result;
};

// 단기예보용 시간 계산 함수의 로그 주석 처리
export const getShortTermDateTime = () => {
  const now = new Date();
  const hour = now.getHours();
  
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  
  let baseHour = baseTimes[0];
  for (const time of baseTimes) {
    if (hour >= time) {
      baseHour = time;
    } else {
      break;
    }
  }
  
  let baseDate = new Date(now);
  if (hour < 2) {
    baseDate.setDate(baseDate.getDate() - 1);
    baseHour = 23;
  }
  
  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getDate()).padStart(2, '0');
  
  const result = {
    base_date: `${y}${m}${d}`,
    base_time: `${String(baseHour).padStart(2, '0')}00`
  };

  // console.log('[단기예보] 시간 계산:', {
  //   현재시각: `${hour}시`,
  //   기준시각: result
  // });
  
  return result;
};

// 중기예보 시간 계산 (발표시간: 06:00, 18:00)
export const getMidFcstTime = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  let baseDate = new Date(now);
  let baseHour;
  
  // 발표시간 기준으로 예보 시간 설정
  if (currentHour < 6 || (currentHour === 6 && currentMinute < 0)) {
    // 6시 이전이면 전날 18시 예보 사용
    baseDate.setDate(baseDate.getDate() - 1);
    baseHour = '18';
  } else if (currentHour < 18 || (currentHour === 18 && currentMinute < 0)) {
    // 6시~18시 사이면 당일 6시 예보 사용
    baseHour = '06';
  } else {
    // 18시 이후면 당일 18시 예보 사용
    baseHour = '18';
  }
  
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  
  const result = `${year}${month}${day}${baseHour}00`;
  
  console.log('중기예보 시간 계산:', {
    현재시간: `${year}년 ${month}월 ${day}일 ${currentHour}시 ${currentMinute}분`,
    사용할예보시간: `${year}년 ${month}월 ${day}일 ${baseHour}시`,
    결과: result
  });
  
  return result;
};
