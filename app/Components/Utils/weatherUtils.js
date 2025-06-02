import Papa from 'papaparse';
import { fetchWeather } from '../Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from './timeUtils';
import { getMidLandRegId } from './regionMapper';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

// 기상 상태에 따른 이모지 매핑
const weatherEmojiMap = {
    '맑음': '☀',
    '구름많음': '☁',
    '흐림': '☁',
    '비': '🌧',
    '소나기': '🌧',
    '눈': '❄',
    '박무': '☁',
    '안개': '☁',
    '황사': '☁',
    '': '☀' // 기본값
};

// 날짜 문자열을 YYYYMMDD 형식으로 변환
const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('.');
    return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

// 사용자의 현재 위치 가져오기
const getUserLocation = async () => {
    try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('위치 권한이 거부되었습니다.');
        }

        // 현재 위치 가져오기
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
        });

        // 좌표를 기상청 API 형식에 맞게 변환
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };
    } catch (error) {
        console.error('위치 정보 가져오기 실패:', error);
        throw error;
    }
};

// 기상청 API에서 오늘 날씨 데이터 가져오기
export const getTodayWeather = async () => {
    try {
        // 사용자의 현재 위치 가져오기
        const userLocation = await getUserLocation();
        
        console.log('사용자 위치:', userLocation);

        // 기존 API 호출
        const weatherData = await fetchWeather({
            lat: userLocation.latitude,
            lon: userLocation.longitude
        });
        
        if (weatherData && weatherData.shortTermData) {
            // 기온 데이터 찾기
            const tempData = weatherData.shortTermData.find(item => 
                item.category === 'TMP' && item.fcstDate === getBaseDateTime().baseDateStr
            );

            // 날씨 상태 데이터 찾기
            const weatherData = weatherData.shortTermData.find(item => 
                item.category === 'SKY' && item.fcstDate === getBaseDateTime().baseDateStr
            );

            if (tempData && weatherData) {
                console.log('날씨 데이터 수신:', {
                    location: userLocation,
                    temperature: tempData.fcstValue,
                    weather: weatherData.fcstValue
                });

                return {
                    minTemp: tempData.fcstValue,
                    maxTemp: tempData.fcstValue,
                    weatherEmoji: weatherEmojiMap[weatherData.fcstValue] || '☀',
                    location: userLocation
                };
            }
        }

        // 데이터가 없는 경우 기본값 반환
        return {
            minTemp: '-',
            maxTemp: '-',
            weatherEmoji: '☀',
            location: userLocation
        };
    } catch (error) {
        console.error('오늘 날씨 데이터 로딩 실패:', error);
        return {
            minTemp: '-',
            maxTemp: '-',
            weatherEmoji: '☀',
            location: null
        };
    }
};

// CSV 파일에서 날씨 데이터 가져오기
export const getWeatherData = async (dateStr) => {
    try {
        const formattedDate = formatDate(dateStr);
        
        // 오늘 날짜인 경우 기상청 API에서 데이터 가져오기
        const today = new Date();
        const [year, month, day] = dateStr.split('.');
        const diaryDate = new Date(year, month - 1, day);
        
        if (today.toDateString() === diaryDate.toDateString()) {
            return await getTodayWeather();
        }
        
        // 과거 데이터는 JSON 파일에서 가져오기
        const userLocation = await getUserLocation();
        const jsonData = await readWeatherDataFromJson(dateStr);
        
        if (jsonData) {
            return {
                ...jsonData,
                location: userLocation
            };
        }

        return {
            minTemp: '-',
            maxTemp: '-',
            weatherEmoji: '☀',
            location: userLocation
        };
    } catch (error) {
        console.error('날씨 데이터 로딩 실패:', error);
        return {
            minTemp: '-',
            maxTemp: '-',
            weatherEmoji: '☀',
            location: null
        };
    }
};

// 과거 기온 데이터를 가져오는 함수
export const getHistoricalTemperature = async (date) => {
    try {
        const userLocation = await getUserLocation();
        // OBS_ASOS JSON을 읽는 대신 기본값 반환
        /*
        const jsonData = await readWeatherDataFromJson(date);
        
        if (jsonData) {
            return {
                minTemp: jsonData.minTemp,
                maxTemp: jsonData.maxTemp,
                location: userLocation
            };
        }
        */

        return {
            minTemp: '-',
            maxTemp: '-',
            location: userLocation
        };
    } catch (error) {
        console.error('과거 기온 데이터 읽기 오류:', error);
        return null;
    }
}; 