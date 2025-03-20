import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './app/Login/login'; // 로그인 화면

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>  {/* NavigationContainer로 감싸야 navigation 사용 가능 */}
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
