import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { fetchWeather } from './WeatherAPI';

const FarmInfo = () => {
const [farmWeather, setFarmWeather] = useState(null);
const [currentWeather, setCurrentWeather] = useState(null);
const [farmLocation, setFarmLocation] = useState({ latitude: 36.5, longitude: 127.0 }); // 예시 농장 위치
const [currentLocation, setCurrentLocation] = useState(null);

useEffect(() => {
    // 농장 위치 날씨 조회
    fetchWeather(farmLocation.latitude, farmLocation.longitude).then(data => setFarmWeather(data));

    // 현재 위치 날씨 조회
    navigator.geolocation.getCurrentPosition(
    position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        fetchWeather(latitude, longitude).then(data => setCurrentWeather(data));
    },
    error => console.error('Error getting current location:', error)
    );
}, []);

return (
    <View style={styles.container}>
    <Text style={styles.title}>내 농장 날씨</Text>
    {farmWeather && (
        <View>
        <Text>온도: {farmWeather.current.temp_c}°C</Text>
        <Text>상태: {farmWeather.current.condition.text}</Text>
        </View>
    )}

    <Text style={styles.title}>현 위치 날씨</Text>
    {currentWeather && (
        <View>
        <Text>온도: {currentWeather.current.temp_c}°C</Text>
        <Text>상태: {currentWeather.current.condition.text}</Text>
        </View>
    )}

    <Text style={styles.title}>주간 날씨</Text>
    {farmWeather && farmWeather.forecast.forecastday.map((day, index) => (
        <View key={index}>
        <Text>{day.date}: 최고 {day.day.maxtemp_c}°C, 최저 {day.day.mintemp_c}°C</Text>
        </View>
    ))}
    </View>
);
};

const styles = StyleSheet.create({
container: {
    padding: 20,
},
title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
},
});

export default FarmInfo;