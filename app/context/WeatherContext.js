import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';
import { getMidLandRegId } from '../Components/Utils/regionMapper';

const FARM_COORDS = {
  latitude: 36.953862288,
  longitude: 127.681782599,
};

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [shortTermData, setShortTermData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [baseTimeInfo, setBaseTimeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 날씨 데이터를 미리 로드하는 함수
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

  // 컴포넌트가 마운트될 때 날씨 데이터 미리 로드
  useEffect(() => {
    preloadWeatherData();
  }, []);

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
    preloadWeatherData, // 필요할 때 수동으로 데이터를 다시 로드할 수 있도록 함수 노출
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
} 