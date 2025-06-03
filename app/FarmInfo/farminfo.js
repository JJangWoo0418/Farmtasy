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
import { router, useLocalSearchParams } from 'expo-router';
const defaultCropImage = require('../../assets/handpencilicon.png');
import API_CONFIG from '../DB/api';

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
                            if (!userPhone) return;
                            const response = await fetch(`${API_CONFIG.BASE_URL}/diary/${diary_id}?user_phone=${userPhone}`, {
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

    const handlePinDiary = (diary_id) => {
        setDiaryList(prev => {
            return prev.map(diary =>
                diary.diary_id === diary_id
                    ? { ...diary, isPinned: true }
                    : { ...diary, isPinned: false } // 하나만 고정하려면 나머지는 false
            ).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        });
    };

    useEffect(() => {
        const loadDiary = async () => {
            try {
                // 서버에서 모든 영농일지 불러오기
                if (!userPhone) return;
                const response = await fetch(`${API_CONFIG.BASE_URL}/diary/list?user_phone=${userPhone}`);
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

    const popularCrops = [
        { name: '고추', image: require('../../assets/peppericon2.png') },
        { name: '벼', image: require('../../assets/riceicon2.png') },
        { name: '감자', image: require('../../assets/potatoicon2.png') },
        { name: '고구마', image: require('../../assets/sweetpotatoicon2.png') },
        { name: '사과', image: require('../../assets/appleicon2.png') },
        { name: '딸기', image: require('../../assets/strawberryicon2.png') },
        { name: '마늘', image: require('../../assets/garlicicon2.png') },
        { name: '상추', image: require('../../assets/lettuceicon2.png') },
        { name: '배추', image: require('../../assets/napacabbageicon2.png') },
        { name: '토마토', image: require('../../assets/tomatoicon2.png') },
        { name: '포도', image: require('../../assets/grapeicon2.png') },
        { name: '콩', image: require('../../assets/beanicon2.png') },
        { name: '감귤', image: require('../../assets/tangerinesicon2.png') },
        { name: '복숭아', image: require('../../assets/peachicon2.png') },
        { name: '양파', image: require('../../assets/onionicon2.png') },
        { name: '감', image: require('../../assets/persimmonicon2.png') },
        { name: '파', image: require('../../assets/greenonionicon2.png') },
        { name: '들깨', image: require('../../assets/perillaseedsicon2.png') },
        { name: '오이', image: require('../../assets/cucumbericon2.png') },
        { name: '낙엽교목류', image: require('../../assets/deciduoustreesicon2.png') },
        { name: '옥수수', image: require('../../assets/cornericon2.png') },
        { name: '표고버섯', image: require('../../assets/mushroomicon2.png') },
        { name: '블루베리', image: require('../../assets/blueberryicon2.png') },
        { name: '양배추', image: require('../../assets/cabbageicon2.png') },
        { name: '호박', image: require('../../assets/pumpkinicon2.png') },
        { name: '자두', image: require('../../assets/plumicon2.png') },
        { name: '시금치', image: require('../../assets/spinachicon2.png') },
        { name: '두릅', image: require('../../assets/araliaicon2.png') },
        { name: '참깨', image: require('../../assets/sesameicon2.png') },
        { name: '매실', image: require('../../assets/greenplumicon2.png') },
    ];

    // 작물명에서 ' | ' 앞부분만 추출 (예: '고추 | 청양고추' → '고추')
    function getCropName(cropType) {
        if (!cropType) return '';
        return cropType.split(' | ')[0];
    }

    // 작물명에 맞는 이미지 찾기
    function getCropImage(cropType) {
        if (!cropType) return null;
        if (cropType.includes('직접 추가')) {
            return defaultCropImage;
        }
        const cropName = cropType.split(' | ')[0];
        const found = popularCrops.find(c => c.name === cropName);
        return found ? found.image : defaultCropImage; // popularCrops에 없으면 기본 아이콘
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>농사 정보</Text>
            </View>

            {/* 상단 메뉴: 항상 고정 */}
            <View style={styles.section}>
                <Link href="/FarmInfo/Weather" asChild>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuContent2}>
                            <Image source={require('../../assets/weathericon3.png')} style={{ width: 60, height: 60, marginBottom: 10 }} />
                            <Text style={styles.menuText}>날씨</Text>
                            <View style={{ minHeight: 20, justifyContent: 'center' }}>
                                {/* 날씨 로딩 상태 표시 제거 */}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FarmInfo/MarketPriceScreen')}>
                    <View style={styles.menuContent}>
                        <Image source={require('../../assets/stockicon.png')} style={{ width: 60, height: 60, marginBottom: 10 }} />
                        <Text style={styles.menuText}>작물 시세</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FarmInfo/Pests')}>
                    <View style={styles.menuContent}>
                        <Image source={require('../../assets/pestsicon.png')} style={{ width: 60, height: 60, marginBottom: 10 }} />
                        <Text style={styles.menuText}>병해충</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 영농일지: 스크롤뷰 안에 배치 */}
            <ScrollView style={styles.content}>
                <View style={{ marginTop: 15, alignItems: 'center' }}>
                    {diaryList.length === 0 ? (
                        <Text style={{ color: '#888', fontSize: 16, marginVertical: 40 }}>오늘 농작업 내용을 간단히 기록해보세요.</Text>
                    ) : (
                        diaryList.map((diary, index) => {
                            // 날짜 포맷 함수
                            let dateStr = '';
                            if (diary.diary_date) {
                                const d = new Date(diary.diary_date);
                                dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
                            }
                            return (
                                <View key={index} style={{
                                    width: '100%',
                                    maxWidth: 340,
                                    backgroundColor: '#fffbc8',
                                    borderRadius: 16,
                                    padding: 20,
                                    marginBottom: 18,
                                    // 그림자 효과 (iOS/Android)
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                    borderWidth: 1,
                                    borderColor: '#f0f0f0',
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Image source={require('../../assets/timeicon.png')} style={{ width: 22, height: 22, marginRight: 0 }} />
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginRight: 75 }}>{dateStr}</Text>
                                        <View style={{ flexDirection: 'row', gap: 3}}>
                                            {/* 수정하기 버튼 */}
                                            <TouchableOpacity
                                                onPress={() => navigation.navigate('FarmInfo/DiaryWrite', {
                                                    editMode: true,
                                                    diaryData: diary,
                                                    diaryIndex: index,
                                                    phone: userPhone
                                                })}
                                                style={{ backgroundColor: '#4A90E2', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 14 }}>수정</Text>
                                            </TouchableOpacity>
                                            {/* 삭제하기 버튼 */}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteDiary(diary.diary_id)}
                                                style={{ backgroundColor: '#f44336', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 14 }}>삭제</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/* 작물명 */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                        <Image
                                            source={getCropImage(diary.crop_type)}
                                            style={{ width: 60, height: 60, marginLeft: -17}}
                                            resizeMode="contain"
                                        />
                                        <Text style={{ fontSize: 15 }}>{diary.crop_type}</Text>
                                    </View>
                                    <View style={{ height: 1, backgroundColor: '#222', marginVertical: 8, opacity: 0.15, marginTop: 0, marginBottom: 15 }} />
                                    {/* 작성내용 */}
                                    <Text style={{ fontSize: 15, marginBottom: 4 }}>{diary.content}</Text>
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
                <Text style={styles.writeButtonText}>일지 작성</Text>
                <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
            </TouchableOpacity>

            <BottomTabNavigator
                currentTab="정보"
                onTabPress={(tab) => {
                    if (tab === '질문하기') {
                        router.push({
                            pathname: '/Chatbot/questionpage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    } else if (tab === '홈') {
                        router.push({
                            pathname: '/Homepage/Home/homepage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '정보') {
                        router.push({
                            pathname: '/FarmInfo/farminfo', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '장터') {
                        router.push({
                            pathname: '/Market/market', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '내 농장') {
                        router.push({
                            pathname: '/Map/Map', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
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
