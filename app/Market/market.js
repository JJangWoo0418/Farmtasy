import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Market/marketstyle';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
const categories = [
    { label: '제초용품', icon: require('../../assets/weedicon2.png') },
    { label: '농자재', icon: require('../../assets/toolicon2.png') },
    { label: '농수산물', icon: require('../../assets/fruiticon2.png') },
    { label: '생활잡화', icon: require('../../assets/lifeicon2.png') },
    { label: '농기계', icon: require('../../assets/tractoricon2.png') },
    { label: '비료/상토', icon: require('../../assets/fertilizericon2.png') },
    { label: '종자/모종', icon: require('../../assets/seedicon2.png') },
    { label: '기타', icon: require('../../assets/etcicon2.png') },
];

// ✅ 글쓰기 버튼 애니메이션 관련 함수
const animateWriteButton = (visible) => {
    Animated.timing(writeButtonAnim, {
        toValue: visible ? 1 : 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // ✅ transform에만 쓰더라도 safe 처리
    }).start();
};

const handleScroll = (e) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    const shouldShow = yOffset < 200;

    if (showText !== shouldShow) {
        setShowText(shouldShow);
        animateWriteButton(shouldShow);
    }
};

const Market = () => {
    const [isFolded, setIsFolded] = useState(false);
    const navigation = useNavigation();
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [isWriteToggleVisible, setWriteToggleVisible] = useState(false);
    const route = useRoute();
    const { userData, phone, name, region } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            {/* 상단 검색창 */}
            <View style={styles.searchBarContainer}>
                <View style={styles.searchBox}>
                    <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder=" 지금 필요한 농자재 검색"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <TouchableOpacity style={styles.bellIconWrapper}>
                    <Image source={require('../../assets/bellicon.png')} />
                </TouchableOpacity>
            </View>

            {/* 카테고리 + 접기/펼치기 버튼 */}
            {!isFolded && (
                <>
                    <View style={styles.categoryWrap}>
                        {categories.map((cat, idx) => (
                            <View key={idx} style={styles.categoryItem}>
                                <Image source={cat.icon} style={styles.categoryIcon} />
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                        <View style={styles.foldBtnHDivider} />
                        <TouchableOpacity style={styles.foldBtn} onPress={() => setIsFolded(true)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image source={require('../../assets/arrow_up.png')} style={{ width: 16, height: 16, marginRight: 2 }} />
                                <Text style={styles.foldBtnText}>접기</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.foldBtnHDivider} />
                    </View>
                </>
            )}
            {isFolded && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                    <View style={styles.foldBtnHDivider} />
                    <TouchableOpacity style={styles.foldBtn} onPress={() => setIsFolded(false)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../../assets/arrow_down.png')} style={{ width: 16, height: 16, marginRight: 2 }} />
                            <Text style={styles.foldBtnText}>펼치기</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.foldBtnHDivider} />
                </View>
            )}

            {/* 기간 한정 특가 */}
            <View style={styles.specialWrap}>
                <Text style={styles.specialTitle}>기간 한정 특가</Text>
            </View>
            {isWriteToggleVisible && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setWriteToggleVisible(false)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 100,
                    }}
                />
            )}

            {isWriteToggleVisible && (
                <View style={{
                    position: 'absolute',
                    bottom: 200,
                    right: 20,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 5,
                    zIndex: 888,
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '농사질문',
                                    icon: require('../../assets/farmingquestions2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/fruit.png')}
                            style={{ width: 42, height: 42, marginRight: 7, marginBottom: 7, marginTop: 10 }}
                        />
                        <Text style={{ fontSize: 20, marginRight: 5, marginBottom: 10, marginTop: 10 }}>
                            농수산물 팔기
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/tool.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>농자재 팔기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/life.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>생활잡화 팔기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/tractor.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>농기계 팔기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/fertilizer.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>비료/상토 팔기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/weed.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>제초용품 팔기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../assets/studyfarming2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                    >
                        <Image
                            source={require('../../assets/seed.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>종자/모종 팔기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            console.log('현재 route.params:', route.params);
                            console.log('전달되는 사용자 정보:', {
                                userData: route.params?.userData,
                                name: route.params?.name,
                                phone: route.params?.phone,
                                region: route.params?.region
                            });
                            router.push({
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '자유주제',
                                    icon: require('../../assets/freetopic2.png'),
                                    userData: route.params?.userData,
                                    name: route.params?.name,
                                    phone: route.params?.phone,
                                    region: route.params?.region
                                }
                            });
                        }}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Image
                            source={require('../../assets/etc.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>기타 팔기</Text>
                    </TouchableOpacity>

                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.writeButton,
                    isWriteToggleVisible && {
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                    },
                    {
                        zIndex: 555,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }
                ]}
                onPress={() => setWriteToggleVisible(prev => !prev)}
            >
                {isWriteToggleVisible ? (
                    <Image
                        source={require('../../assets/Xicon.png')}
                        style={{ width: 60, height: 60, resizeMode: 'contain' }}
                    />
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.writeButtonText}>글쓰기  </Text>
                        <Image
                            source={require('../../assets/paperpencil.png')}
                            style={styles.paperpencilIcon}
                        />
                    </View>
                )}
            </TouchableOpacity>
            <BottomTabNavigator
                currentTab="장터"
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
                        // 필요시 다른 탭도 추가
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
                }
                }
            />
        </View>
    );
};

export default Market;