import React, { useState, useEffect } from 'react';
import { fetchMidLandFcst, fetchMidTa } from '../Components/Css/FarmInfo/WeatherAPI';
import { getMidFcstTime } from '../Components/Utils/timeUtils';
import styles from '../Components/Css/FarmInfo';

const WeeklyWeather = ({ regId }) => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tmFc = getMidFcstTime();
        const [landFcst, tempData] = await Promise.all([
          fetchMidLandFcst({ regId, tmFc }),
          fetchMidTa({ regId, tmFc })
        ]);

        if (landFcst && tempData) {
          // 데이터 처리 로직
          setWeeklyData({ landFcst, tempData });
          setError(null);
        } else {
          setError('주간 날씨 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('주간 날씨 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('주간 날씨 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 6시간마다 업데이트 (중기예보는 하루 4회 발표)
    const interval = setInterval(fetchData, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [regId]);

  if (loading) return <div className={styles.loading}>주간 날씨를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!weeklyData) return null;

  return (
    <div className={styles.weeklyWeather}>
      <h3>주간 날씨</h3>
      {/* 주간 날씨 표시 UI */}
    </div>
  );
};

export default WeeklyWeather; 