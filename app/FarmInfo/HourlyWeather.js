import React, { useState, useEffect } from 'react';
import { fetchHourlyWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import styles from '../Components/Css/FarmInfo';

const HourlyWeather = ({ nx, ny }) => {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchHourlyWeather({ nx, ny });
        if (data && data.length > 0) {
          setHourlyData(data);
          setError(null);
        } else {
          setError('시간대별 날씨 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('시간대별 날씨 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('시간대별 날씨 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 10분마다 날씨 정보 업데이트
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [nx, ny]);

  if (loading) return <div className={styles.loading}>시간대별 날씨를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!hourlyData.length) return null;

  return (
    <div className={styles.hourlyWeather}>
      <h3>시간대별 날씨</h3>
      <div className={styles.hourlyList}>
        {hourlyData.map((hour, index) => (
          <div key={index} className={styles.hourlyItem}>
            <div className={styles.time}>
              {hour.time.slice(0, 2)}:00
            </div>
            <div className={styles.weather}>
              {hour.weather}
            </div>
            <div className={styles.temp}>
              {hour.temp}°
            </div>
            {hour.rainAmount && (
              <div className={styles.rain}>
                {hour.rainAmount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyWeather; 