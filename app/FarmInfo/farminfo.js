import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { Link } from 'expo-router';
import { useWeather } from '../context/WeatherContext';
import { WeatherProvider } from '../context/WeatherContext';
import Weather from './Weather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../Components/Css/FarmInfo/FarmInfoStyle';

const FarmInfoContent = () => {
    const navigation = useNavigation();
    const {
        isLoading,
        weatherData,
        shortTermData,
        weeklyData,
        locationName
    } = useWeather();
    const [diaryList, setDiaryList] = useState([]);

    useEffect(() => {
        const loadDiary = async () => {
            try {
                const saved = await AsyncStorage.getItem('farmDiary');
                if (saved) {
                    const list = JSON.parse(saved);
                    // 날짜 기준으로 정렬 (최신순)
                    const sortedList = list.sort((a, b) => {
                        const dateA = new Date(a.date.replace(/\./g, '-'));
                        const dateB = new Date(b.date.replace(/\./g, '-'));
                        return dateB - dateA;
                    });
                    setDiaryList(sortedList);
                }
            } catch (e) {
                console.error('영농일지 불러오기 실패:', e);
            }
        };
        loadDiary();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>농사 정보</Text>
            </View>

            {/* 상단 메뉴: 항상 고정 */}
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

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 영농일지: 스크롤뷰 안에 배치 */}
            <ScrollView style={styles.content}>
                <View style={{marginTop: 32, alignItems: 'center'}}>
                    {diaryList.length === 0 ? (
                        <Text style={{color:'#888', fontSize:16, marginVertical:40}}>오늘 농작업 내용을 간단히 기록해보세요.</Text>
                    ) : (
                        diaryList.map((diary, index) => {
                            // 날짜 포맷 함수
                            let dateStr = '';
                            if (typeof diary.date === 'string' && diary.date.includes('T')) {
                                // ISO 포맷 처리
                                const d = new Date(diary.date);
                                dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
                            } else {
                                dateStr = diary.date;
                            }
                            return (
                                <View key={index} style={{width:'100%', maxWidth:340, backgroundColor:'#f8f8f8', borderRadius:12, padding:18, marginBottom:16}}>
                                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                                        <Text style={{fontWeight:'bold', fontSize:16}}>{dateStr}</Text>
                                        <TouchableOpacity 
                                            onPress={() => navigation.navigate('FarmInfo/DiaryWrite', { 
                                                editMode: true,
                                                diaryData: diary,
                                                diaryIndex: index
                                            })}
                                            style={{backgroundColor:'#4A90E2', borderRadius:6, paddingVertical:6, paddingHorizontal:12}}
                                        >
                                            <Text style={{color:'#fff', fontSize:14}}>수정하기</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {/* 품목(작물/품종) */}
                                    <Text style={{fontSize:15, marginBottom:4}}>{diary.crop}</Text>
                                    {/* 작성내용 */}
                                    <Text style={{fontSize:15, marginBottom:4}}>{diary.content}</Text>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* 일지 작성하기 버튼: 우측 하단에 고정, 아이콘 포함 */}
            <TouchableOpacity 
                style={styles.writeButton} 
                onPress={()=>navigation.navigate('FarmInfo/DiaryWrite')}
            >
                <Text style={styles.writeButtonText}>일지 작성하기</Text>
                <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
            </TouchableOpacity>

            <BottomTabNavigator currentTab="정보" onTabPress={(tab) => {
                if (tab === '질문하기') {
                    navigation.navigate('Chatbot/questionpage');
                } else if (tab === '홈') {
                    navigation.navigate('Homepage/Home/homepage');
                }
                else if (tab === '정보') {
                    navigation.navigate('FarmInfo/farminfo');
                }
            }} />
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