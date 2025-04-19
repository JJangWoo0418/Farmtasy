import React, { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import styles from '../Components/Css/FarmInfo';

const CurrentWeather = ({ nx, ny, location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[DEBUG] CurrentWeather - 데이터 요청 시작', { nx, ny, location });
        const data = await fetchCurrentWeather({ nx, ny, location });
        console.log('[DEBUG] CurrentWeather - 받은 데이터:', data);
        
        if (data) {
          setWeather(data);
          setError(null);
          console.log('[DEBUG] CurrentWeather - 날씨 데이터 설정 완료:', data);
        } else {
          setError('날씨 정보를 불러올 수 없습니다.');
          console.log('[DEBUG] CurrentWeather - 데이터 없음');
        }
      } catch (err) {
        setError('날씨 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('[ERROR] CurrentWeather - 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 10분마다 날씨 정보 업데이트
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [nx, ny, location]);

  if (loading) return <div className={styles.loading}>날씨 정보를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!weather) return null;

  return (
    <div className={styles.currentWeather}>
      <h2>{weather.location}</h2>
      <div className={styles.mainInfo}>
        <div className={styles.temperature}>
          <span className={styles.currentTemp}>{weather.current.temp}°</span>
        </div>
        <div className={styles.details}>
          <div className={styles.weather}>{weather.current.weather}</div>
          <div className={styles.humidity}>습도 {weather.current.humidity}%</div>
          <div className={styles.extremes}>
            {weather.extremes.tmn !== null && weather.extremes.tmx !== null && (
              <>
                최저 {weather.extremes.tmn}° / 최고 {weather.extremes.tmx}°
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather; 