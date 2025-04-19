import React from 'react';
import CurrentWeather from './CurrentWeather';
import HourlyWeather from './HourlyWeather';
import WeeklyWeather from './WeeklyWeather';
import WeatherWarning from './WeatherWarning';
import styles from '../Components/Css/FarmInfo';

const Weather = ({ location, nx, ny, regId }) => {
  return (
    <div className={styles.weatherContainer}>
      <CurrentWeather nx={nx} ny={ny} location={location} />
      <HourlyWeather nx={nx} ny={ny} />
      <WeeklyWeather regId={regId} />
      <WeatherWarning />
    </div>
  );
};

export default Weather; 