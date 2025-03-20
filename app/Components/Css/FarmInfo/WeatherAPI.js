import axios from 'axios';
import { WEATHER_API_KEY } from './apikey.js';

export const fetchWeather = async (latitude, longitude) => {
    try {
    const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7`
    );
    return response.data;
    } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
    }
};