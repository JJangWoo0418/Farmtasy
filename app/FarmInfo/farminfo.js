import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { Link } from 'expo-router';
import { fetchWeather } from '../Components/Css/FarmInfo/WeatherAPI';
import { getBaseDateTime } from '../Components/Utils/timeUtils';
import { getMidLandRegId } from '../Components/Utils/regionMapper';
import { useWeather } from '../context/WeatherContext';
import { WeatherProvider } from '../context/WeatherContext';
import Weather from './Weather';

const FARM_COORDS = {
    latitude: 36.953862288,
    longitude: 127.681782599,
};

const FarmInfoContent = () => {
    const navigation = useNavigation();
    const {
        isLoading,
        weatherData,
        shortTermData,
        weeklyData,
        locationName
    } = useWeather();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>농사 정보</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Link href="/FarmInfo/Weather" asChild>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuIcon}>☀️</Text>
                                <Text style={styles.menuText}>날씨</Text>
                                {isLoading && <Text style={styles.loadingText}>(로딩중...)</Text>}
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FarmInfo/MarketPriceScreen')}>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuIcon}>📊</Text>
                            <Text style={styles.menuText}>작물 시세</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FarmInfo/Pests')}>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuIcon}>🐜</Text>
                            <Text style={styles.menuText}>병해충</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomTabNavigator currentTab="정보" onTabPress={(tab) => {
                if (tab === '질문하기') {
                    navigation.navigate('Chatbot/questionpage'); // 네비게이터에 등록된 이름
                } else if (tab === '홈') {
                    navigation.navigate('Homepage/Home/homepage');
                }
                else if (tab === '정보') {
                    navigation.navigate('FarmInfo/farminfo');
                    // 필요시 다른 탭도 추가
                }
            }
            } />
        </View>
    );
};

export default function FarmInfo() {
    return (
        <WeatherProvider>
            <FarmInfoContent />
        </WeatherProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'System',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 16,
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        marginRight: 0,
        shadowColor: undefined,
        shadowOffset: undefined,
        shadowOpacity: undefined,
        shadowRadius: undefined,
        elevation: undefined,
        minWidth: undefined,
        minHeight: undefined,
        alignSelf: 'center',
        backgroundColor: undefined,
        borderRadius: undefined,
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    menuContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        fontSize: 36,
        marginRight: 0,
        marginBottom: 6,
        textAlign: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        textAlign: 'center',
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#999',
    },
});