import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { Link } from 'expo-router';
import { useWeather } from '../context/WeatherContext';
import { WeatherProvider } from '../context/WeatherContext';
import Weather from './Weather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../Components/Css/FarmInfo/FarmInfoStyle';
import { router, useLocalSearchParams} from 'expo-router';

const FarmInfoContent = (props) => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        isLoading,
        weatherData,
        shortTermData,
        weeklyData,
        locationName
    } = useWeather();
    const [diaryList, setDiaryList] = useState([]);
    const [userPhone, setUserPhone] = useState(null);
    const { userData, name, region } = useLocalSearchParams();

    // phone 값 초기화
    useEffect(() => {
        const loadPhone = async () => {
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.phone) {
                        setUserPhone(user.phone);
                        console.log('FarmInfoContent에서 불러온 phone:', user.phone);
                    }
                }
            } catch (e) {
                console.error('phone 불러오기 실패:', e);
            }
        };
        loadPhone();
    }, []);

    // 일지 삭제 함수 수정: diary_id로 서버에 삭제 요청
    const handleDeleteDiary = async (diary_id) => {
        try {
            Alert.alert(
                '일지 삭제',
                '정말로 이 일지를 삭제하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel'
                    },
                    {
                        text: '삭제',
                        style: 'destructive',
                        onPress: async () => {
                            const API_URL = 'http://192.168.35.144:3000';
                            if (!userPhone) return;
                            const response = await fetch(`${API_URL}/diary/${diary_id}?user_phone=${userPhone}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                // 삭제 후 목록 갱신
                                setDiaryList(prev => prev.filter(d => d.diary_id !== diary_id));
                                Alert.alert('알림', '일지가 삭제되었습니다.');
                            } else {
                                Alert.alert('오류', '일지 삭제에 실패했습니다.');
                            }
                        }
                    }
                ]
            );
        } catch (e) {
            console.error('일지 삭제 실패:', e);
            Alert.alert('오류', '일지 삭제에 실패했습니다.');
        }
    };

    useEffect(() => {
        const loadDiary = async () => {
            try {
                // 서버에서 모든 영농일지 불러오기
                const API_URL = 'http://192.168.35.144:3000';
                if (!userPhone) return;
                const response = await fetch(`${API_URL}/diary/list?user_phone=${userPhone}`);
                if (response.ok) {
                    const list = await response.json();
                    // diary_date 기준으로 최신순 정렬
                    const sortedList = list.sort((a, b) => new Date(b.diary_date) - new Date(a.diary_date));
                    setDiaryList(sortedList);
                } else {
                    setDiaryList([]);
                }
            } catch (e) {
                console.error('영농일지 불러오기 실패:', e);
                setDiaryList([]);
            }
        };
        loadDiary();
    }, [userPhone]);

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
                            if (diary.diary_date) {
                                const d = new Date(diary.diary_date);
                                dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
                            }
                            return (
                                <View key={index} style={{width:'100%', maxWidth:340, backgroundColor:'#f8f8f8', borderRadius:12, padding:18, marginBottom:16}}>
                                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                                        <Text style={{fontWeight:'bold', fontSize:16}}>{dateStr}</Text>
                                        <View style={{flexDirection: 'row', gap: 8}}>
                                            <TouchableOpacity 
                                                onPress={() => navigation.navigate('FarmInfo/DiaryWrite', { 
                                                    editMode: true,
                                                    diaryData: diary,
                                                    diaryIndex: index,
                                                    phone: userPhone
                                                })}
                                                style={{backgroundColor:'#4A90E2', borderRadius:6, paddingVertical:6, paddingHorizontal:12, marginRight:8}}
                                            >
                                                <Text style={{color:'#fff', fontSize:14}}>수정하기</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => handleDeleteDiary(diary.diary_id)}
                                                style={{backgroundColor:'#f44336', borderRadius:6, paddingVertical:6, paddingHorizontal:12}}
                                            >
                                                <Text style={{color:'#fff', fontSize:14}}>삭제하기</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/* 작물명 */}
                                    <Text style={{fontSize:15, marginBottom:4}}>{diary.crop_type}</Text>
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
                onPress={() => {
                    console.log('DiaryWrite로 이동 시 phone 값:', userPhone);
                    navigation.navigate('FarmInfo/DiaryWrite', { phone: userPhone });
                }}
            >
                <Text style={styles.writeButtonText}>일지 작성하기</Text>
                <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
            </TouchableOpacity>

            <BottomTabNavigator
                currentTab="정보"
                onTabPress={(tab) => {
                    if (tab === '질문하기') {
                        router.push({ pathname: '/Chatbot/questionpage', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    } else if (tab === '홈') {
                        router.push({ pathname: '/Homepage/Home/homepage', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                    else if (tab === '정보') {
                        router.push({ pathname: '/FarmInfo/farminfo', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                    else if (tab === '장터') {
                        router.push({ pathname: '/Market/market', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                    else if (tab === '내 농장') {
                        router.push({ pathname: '/Map/Map', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                }}
            />
        </View>
    );
};

export default function FarmInfo() {
    const route = useRoute();
    const [userPhone, setUserPhone] = React.useState(route.params?.phone);
    React.useEffect(() => {
        if (!userPhone) {
            AsyncStorage.getItem('user').then(userStr => {
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        if (user && user.phone) {
                            setUserPhone(user.phone);
                            console.log('AsyncStorage에서 불러온 phone:', user.phone);
                        }
                    } catch (e) {
                        console.log('user 파싱 오류:', e);
                    }
                }
            });
        } else {
            console.log('route.params에서 받은 phone:', userPhone);
        }
    }, [route.params, userPhone]);
    return (
        <WeatherProvider>
            <FarmInfoContent phone={userPhone} />
        </WeatherProvider>
    );
}
