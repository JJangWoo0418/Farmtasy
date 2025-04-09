import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "./app/Homepage/homepage"; // HomePage 연결
import WritingPage from "./app/Homepage/writingpage"; // 글쓰기 페이지 추가
import PostPage from "./app/Homepage/postpage";     // 게시글 페이지 추가
import PostDetailPage from "./app/Homepage/postdetailpage"; // 게시글 상세 페이지 추가
import BottomTabNavigator from "./app/Navigator/BottomTabNavigator"; // 탭 네비게이션 연결

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* 메인 화면 (탭 네비게이터) */}
                <Stack.Screen name="Main" component={BottomTabNavigator} />
                {/* 개별 화면들 */}
                <Stack.Screen name="Writing" component={WritingPage} />
                <Stack.Screen name="Post" component={PostPage} />
                <Stack.Screen name="PostDetail" component={PostDetailPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
