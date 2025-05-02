import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-root-toast';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          {/* 기존 스택 네비게이터 내용 */}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
} 