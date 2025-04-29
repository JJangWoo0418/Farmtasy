import { Stack } from 'expo-router';
import { WeatherProvider } from './context/WeatherContext';

export default function Layout() {
    return (
    <WeatherProvider>
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="FarmInfo/index" 
                options={{
                    title: '날씨',
                    headerBackTitle: '뒤로'
                }}
            />
        </Stack>
    </WeatherProvider>
    );
}