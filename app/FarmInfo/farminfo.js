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

const FARM_COORDS = {
    latitude: 36.953862288,
    longitude: 127.681782599,
};

const FarmInfoContent = () => {
    const navigation = useNavigation();
    const {
        setWeatherData,
        setShortTermData,
        setWeeklyData,
        setLocationName,
        setBaseTimeInfo,
        isLoading,
        setIsLoading
    } = useWeather();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>농사 정보</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Link href="/FarmInfo" asChild>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuIcon}>☀️</Text>
                                <Text style={styles.menuText}>날씨</Text>
                                {isLoading && <Text style={styles.loadingText}>(로딩중...)</Text>}
                            </View>
                        </TouchableOpacity>
                    </Link>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FarmInfo/MarketPriceScreen')}>
                        <Image source={require('../../assets/quoteicon2.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>작물 시세</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Image source={require('../../assets/bugicon2.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>병해충</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 145,

    },
    content: {
        flex: 1,
    },
    section: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuIcon: {
        width: 24,
        height: 24,
        marginRight: 15,
    },
    menuText: {
        fontSize: 16,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 12,
        color: '#999',
    },
});