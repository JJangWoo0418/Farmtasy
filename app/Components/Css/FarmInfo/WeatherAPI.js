import axios from 'axios';

const WEATHER_API_KEY = 'WT1TsX5OR7-9U7F-Tse_2g';

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