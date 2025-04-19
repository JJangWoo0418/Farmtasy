import React, { useState, useEffect } from 'react';
import { fetchWarningNow } from '../Components/Css/FarmInfo/WeatherAPI';
import styles from '../Components/Css/FarmInfo';

const WeatherWarning = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchWarningNow();
        if (data) {
          setWarnings(data?.response?.body?.items?.item || []);
          setError(null);
        } else {
          setError('기상특보 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('기상특보 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('기상특보 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 1시간마다 업데이트
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.loading}>기상특보를 확인하는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!warnings.length) return null;

  return (
    <div className={styles.weatherWarning}>
      <h3>기상특보</h3>
      <div className={styles.warningList}>
        {warnings.map((warning, index) => (
          <div key={index} className={styles.warningItem}>
            <div className={styles.warningTitle}>{warning.title}</div>
            <div className={styles.warningContent}>{warning.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWarning; 