import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 실제 사용할 화면들 추가
import HomePage from "./app/Home/homepage"; // 홈 화면
import FarmPage from "./app/Farm/farm"; // 내 농장 화면
import MarketPage from "./app/Market/market"; // 장터 화면

const Tab = createBottomTabNavigator();

const screens = [
    { name: "질문하기", icon: "chatbubble-outline", component: DummyScreen },
    { name: "정보", icon: "book-outline", component: DummyScreen },
    { name: "홈", icon: "home-outline", component: HomePage },
    { name: "내 농장", icon: "map-outline", component: FarmPage },
    { name: "장터", icon: "basket-outline", component: MarketPage },
];

const TabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={() => navigation.navigate(route.name)}
                        style={[styles.tab, isFocused && styles.focusedTab]}
                    >
                        <Ionicons
                            name={screens[index].icon}
                            size={24}
                            color={isFocused ? "black" : "gray"}
                        />
                        <Text style={[styles.label, isFocused && styles.focusedLabel]}>
                            {route.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
            {screens.map((screen) => (
                <Tab.Screen key={screen.name} name={screen.name} component={screen.component} />
            ))}
        </Tab.Navigator>
    );
}

// 임시 화면 (DummyScreen)
const DummyScreen = ({ route }) => (
    <View style={styles.screen}>
        <Text>{route.name} 화면</Text>
    </View>
);

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        height: 60,
        borderTopWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
    },
    focusedTab: {
        backgroundColor: "#e0e0e0",
        borderRadius: 10,
    },
    label: {
        fontSize: 12,
        color: "gray",
    },
    focusedLabel: {
        color: "black",
    },
    screen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
