import React, { createContext, useState, useContext } from 'react';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [shortTermData, setShortTermData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [baseTimeInfo, setBaseTimeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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