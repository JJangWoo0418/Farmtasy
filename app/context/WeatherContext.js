// app/context/WeatherContext.js
// 이 파일은 앱 전체에서 날씨 데이터를 관리하고 공유하기 위한 React Context를 정의합니다.

import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI'; // 날씨 API 호출 함수
import { getBaseDateTime } from '../Components/Utils/timeUtils'; // 시간 관련 유틸리티
import { getMidLandRegId } from '../Components/Utils/regionMapper'; // 지역 코드 매퍼
import API_CONFIG from '../DB/api'; // API_CONFIG 임포트

// 농장 좌표 (현재 하드코딩됨)
const FARM_COORDS = {
  latitude: 36.7692064,
  longitude: 127.0220957,
};

// 날씨 Context 생성
// 이 Context를 통해 날씨 데이터와 관련 상태를 앱 전체에서 접근하고 업데이트할 수 있습니다.
const WeatherContext = createContext();

// Weather Provider 컴포넌트
// 날씨 관련 상태를 관리하고, Context를 통해 하위 컴포넌트에 제공합니다.
export function WeatherProvider({ children, userPhone }) {
  // 날씨 데이터 상태 변수들
  const [weatherData, setWeatherData] = useState(null); // 초단기 예보 데이터
  const [shortTermData, setShortTermData] = useState(null); // 단기 예보 데이터
  const [weeklyData, setWeeklyData] = useState(null); // 주간 예보 데이터
  const [locationName, setLocationName] = useState(''); // 현재 위치 또는 농장 위치 이름
  const [baseTimeInfo, setBaseTimeInfo] = useState(null); // API 호출 기준 시간 정보
  const [isLoading, setIsLoading] = useState(true); // 데이터 로딩 상태

  // 농장 선택 관련 상태
  const [isFarmSelectModalVisible, setIsFarmSelectModalVisible] = useState(false);
  const [allUserFarms, setAllUserFarms] = useState([]);
  const [currentFarm, setCurrentFarm] = useState(null); // 현재 표시 중인 농장 정보

  // 날씨 데이터를 미리 로드하는 함수 - 현재 미사용으로 주석 처리됨
  // 이 함수는 앱 시작 시 또는 필요할 때 날씨 데이터를 일괄적으로 가져옵니다.
  /*
  const preloadWeatherData = async () => {
    try {
      setIsLoading(true);
      
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
      
      // 중기예보용 시간 설정
      const midFcstTime = currentHour < 6 ? '0600' : (currentHour < 18 ? '0600' : '1800');
      const midBaseDate = new Date(now);
      if (currentHour < 6) {
        midBaseDate.setDate(midBaseDate.getDate() - 1);
      }
      
      const midBaseDateStr = `${midBaseDate.getFullYear()}${String(midBaseDate.getMonth() + 1).padStart(2, '0')}${String(midBaseDate.getDate()).padStart(2, '0')}`;
      const tmFc = `${midBaseDateStr}${midFcstTime}`;

      const regionId = getMidLandRegId(FARM_COORDS.latitude, FARM_COORDS.longitude);
      
      // 격자 좌표 계산
      const grid = await fetchWeather('latlon', {
        lat: FARM_COORDS.latitude,
        lon: FARM_COORDS.longitude
      });

      if (!grid || !grid.x || !grid.y) {
        console.error('[격자 변환] 실패');
        setIsLoading(false);
        return;
      }

      console.log('[날씨 API 호출 정보]', {
        격자좌표: grid,
        단기예보: { baseDateStr, baseTime },
        중기예보: { midBaseDateStr, midFcstTime, tmFc }
      });

      // 모든 API 요청을 병렬로 실행
      const [ultraFcst, shortTermFcst, midLandFcst, midTaFcst, warningFcst] = await Promise.all([
        fetchWeather('ultraFcst', {
          nx: grid.x,
          ny: grid.y,
          base_date: baseDateStr,
          base_time: baseTime
        }),
        fetchWeather('villageFcst', {
          nx: grid.x,
          ny: grid.y,
          base_date: baseDateStr,
          base_time: baseTime
        }),
        fetchWeather('midLandFcst', {
          regId: regionId,
          tmFc: tmFc,
          pageNo: '1',
          numOfRows: '10',
          dataType: 'XML'
        }),
        fetchWeather('midTa', {
          regId: regionId,
          tmFc: tmFc,
          pageNo: '1',
          numOfRows: '10',
          dataType: 'XML'
        }),
        fetchWeather('warning')
      ]);

      if (ultraFcst?.response?.body?.items?.item) {
        setWeatherData(ultraFcst);
      }
      if (shortTermFcst?.response?.body?.items?.item) {
        setShortTermData(shortTermFcst);
      }
      if (midLandFcst?.response?.body?.items?.item || midTaFcst?.response?.body?.items?.item) {
        const landFcstData = midLandFcst?.response?.body?.items?.item?.[0] ?? null;
        const taFcstData = midTaFcst?.response?.body?.items?.item?.[0] ?? null;
        setWeeklyData({
          ...landFcstData,
          ...taFcstData
        });
      }

      // 위치 이름 가져오기
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${FARM_COORDS.latitude}&lon=${FARM_COORDS.longitude}`);
        const data = await response.json();
        const name = data.address.county || data.address.city || '위치 정보 없음';
        setLocationName(name);
      } catch (error) {
        console.error('[위치 정보] 오류:', error);
        setLocationName('위치 정보 없음');
      }

      setBaseTimeInfo({ baseDate: baseDateStr, baseTime });
    } catch (error) {
      console.error('[날씨 데이터 프리로드 오류]:', error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  // 컴포넌트가 마운트될 때 날씨 데이터 미리 로드 - 현재 미사용으로 주석 처리
  /*
  useEffect(() => {
    preloadWeatherData();
  }, []);
  */

  // 사용자 농장 목록 가져오는 함수
  const fetchUserFarms = async () => {
    if (!userPhone) {
      console.error('[농장 목록 Context] 사용자 전화번호 없음');
      return [];
    }
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/farm?user_phone=${userPhone}`);
      const farms = await response.json();
      if (response.ok && farms.length > 0) {
        console.log('[농장 목록 Context] 가져오기 성공:', farms.length);
        setAllUserFarms(farms);
        return farms;
      } else {
        console.warn('[농장 목록 Context] 등록된 농장 없음 또는 가져오기 실패');
        setAllUserFarms([]);
        return [];
      }
    } catch (error) {
      console.error('[농장 목록 Context] 가져오기 오류:', error);
      setAllUserFarms([]);
      return [];
    }
  };

  // 농장 선택 모달 열기
  const openFarmSelectModal = async () => {
    await fetchUserFarms(); // 모달 열 때마다 목록 새로 가져오기
    setIsFarmSelectModalVisible(true);
  };

  // 농장 선택 처리
  const handleFarmSelect = (farm) => {
    setCurrentFarm(farm); // 선택된 농장으로 상태 업데이트
    setIsFarmSelectModalVisible(false); // 모달 닫기
    // WeatherContent에서 mode 상태를 관리하고 있으므로, Context에서는 농장 정보만 업데이트
  };

  const value = {
    weatherData,
    setWeatherData,
    shortTermData,
    setShortTermData,
    weeklyData,
    setWeeklyData,
    locationName,
    setLocationName,
    baseTimeInfo,
    setBaseTimeInfo,
    isLoading,
    setIsLoading,
    // preloadWeatherData, // 필요할 때 수동으로 데이터를 다시 로드할 수 있도록 함수 노출 - 현재 미사용으로 주석 처리됨
    
    // 농장 선택 관련 Context 값
    isFarmSelectModalVisible,
    setIsFarmSelectModalVisible,
    allUserFarms,
    currentFarm,
    setCurrentFarm, // WeatherContent에서 첫 로딩 시 설정 가능하도록 노출
    fetchUserFarms, // 첫 로딩 시 사용
    openFarmSelectModal,
    handleFarmSelect,
  };

  // Context Provider를 통해 value 객체를 하위 컴포넌트에 제공합니다.
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

// useWeather 커스텀 훅
// Context 값을 쉽게 사용할 수 있도록 하는 훅입니다.
// 이 훅을 사용하면 WeatherProvider 내부의 날씨 데이터와 상태에 접근할 수 있습니다.
export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
} 