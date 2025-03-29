import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "./app/Homepage/homepage"; // HomePage 연결
import BottomTabNavigator from "./app/Navigator/BottomTabNavigator"; // 탭 네비게이션 연결

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <BottomTabNavigator />
        </NavigationContainer>
    );
}
