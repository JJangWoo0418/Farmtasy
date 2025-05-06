import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Animated, StatusBar } from 'react-native';
import styles from '../Components/Css/Homepage/homepagestyle';
import { FontAwesome } from '@expo/vector-icons';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

const HomePage = () => {
    const navigation = useNavigation();
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [isWriteToggleVisible, setWriteToggleVisible] = useState(false);
    const route = useRoute();


    const drawerAnim = useRef(new Animated.Value(-300)).current; // 왼쪽에서 숨겨진 상태

    const openDrawer = () => {
        setDrawerVisible(true);
        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(drawerAnim, {
            toValue: -300, // 왼쪽으로 다시 숨기기
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setDrawerVisible(false); // 애니메이션 끝난 뒤에 drawer 숨김
        });
    };

    const goToPostPage = (category) => {
        console.log('현재 route.params:', route.params);
        console.log('전달되는 사용자 정보:', {
            userData: route.params?.userData,
            phone: route.params?.phone,
            name: route.params?.name,
            region: route.params?.region
        });

        if (category === '자유주제') {
            router.push({
                pathname: 'Homepage/postpage',
                params: {
                    category: '자유주제',
                    categoryTitle: '화목한 농부들의 자유주제',
                    categoryDesc: '다양한 주제로 소통해 보세요',
                    categoryIcon: require('../../assets/freetopic2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        } else if (category === '농사공부') {
            router.push({
                pathname: 'Homepage/postpage',
                params: {
                    category: '농사공부',
                    categoryTitle: '똑똑한 농부들의 농사공부',
                    categoryDesc: '유익한 정보들을 공유해보세요',
                    categoryIcon: require('../../assets/studyfarming2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        } else if (category === '농사질문') {
            router.push({
                pathname: 'Homepage/postpage',
                params: {
                    category: '농사질문',
                    categoryTitle: '질문은 배움의 시작 농사질문',
                    categoryDesc: '농사에 대한 질문을 남겨보세요',
                    categoryIcon: require('../../assets/farmingquestions2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        }
    };


    const posts = [
        {
            id: '1',
            username: '충북음성 이준호',
            time: '1시간 전',
            text: '충북 음성 싱싱한 복숭아 과일 살 사람 구합니다.',
            profileImage: require('../../assets/leejunho.png'),
            images: [require('../../assets/peach.png'), require('../../assets/mandarin.png')],
        },
    ];

    return (
        <View style={styles.container}>

            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />


            {/* ✅ 드로어는 항상 존재하되 조건부 style만 바꿈 */}
            <View
                style={[
                    styles.drawerOverlay,
                    { display: isDrawerVisible ? 'flex' : 'none' },
                ]}
            >
                {/* 배경 클릭 시 닫기 */}
                <TouchableOpacity
                    style={styles.drawerBackground}
                    onPress={closeDrawer}
                    activeOpacity={1}
                />

                {/* 드로어 슬라이드 메뉴 */}
                <Animated.View
                    style={[
                        styles.drawerStatic,
                        { transform: [{ translateX: drawerAnim }] },
                    ]}
                >
                    <TouchableOpacity onPress={closeDrawer} style={styles.drawerClose}>
                        <Image source={require('../../assets/closeicon.png')} style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>

                    {/* drawerTitle, drawerItem 등은 그대로 유지 */}
                    <Text style={styles.drawerTitle}>정보</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => {
                        router.push({
                            pathname: 'Homepage/profilepage',
                            params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region
                            }
                        });
                    }}>
                        <Image source={require('../../assets/profileicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>프로필</Text>
                    </TouchableOpacity>
                    {/* 장터 */}
                    <Text style={styles.drawerTitle}>장터</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/shopicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>장터</Text>
                    </TouchableOpacity>

                    {/* 농사 정보 */}
                    <Text style={styles.drawerTitle}>농사 정보</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => router.push({ pathname: '/Homepage/directpaymentpage' })}>
                        <Image source={require('../../assets/directdeposit2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>면적 직불금 계산기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/quoteicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>작물 시세</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/weathericon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>날씨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/bugicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>병해충</Text>
                    </TouchableOpacity>

                    {/* 농사 게시판 */}
                    <Text style={styles.drawerTitle}>농사 게시판</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('자유주제')}>
                        <Image source={require('../../assets/freetopic2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>자유주제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('농사공부')}>
                        <Image source={require('../../assets/studyfarming2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사공부</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('농사질문')}>
                        <Image source={require('../../assets/farmingquestions2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사질문</Text>
                    </TouchableOpacity>

                    {/* AI */}
                    <Text style={styles.drawerTitle}>AI</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/chatboticon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>질문하기</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>


            {/* ✅ 상단 검색 바 */}
            <View style={styles.searchBarContainer}>
                {/* 햄버거 버튼 */}
                <TouchableOpacity style={styles.menuIconWrapper} onPress={openDrawer}>
                    <FontAwesome name="bars" size={20} color="#555" />
                </TouchableOpacity>

                {/* 검색창 박스만 회색 배경 */}
                <View style={styles.searchBox}>
                    <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder=" 지금 필요한 농자재 검색"
                        placeholderTextColor="#aaa"
                    />
                </View>

                {/* 종 아이콘 */}
                <TouchableOpacity style={styles.bellIconWrapper}>
                    <Image source={require('../../assets/bellicon.png')} />
                </TouchableOpacity>
            </View>

            {/* 상단 메뉴 */}
            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사질문')}>
                    <Image source={require('../../assets/farmingquestions4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사질문</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사공부')}>
                    <Image source={require('../../assets/studyfarming4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사공부</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('자유주제')}>
                    <Image source={require('../../assets/freetopic4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>자유주제</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/Homepage/directpaymentpage' })}>
                    <Image source={require('../../assets/directdeposit4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>직불금계산</Text>
                </TouchableOpacity>
            </View>

            {/* 추천글 & 이웃글 탭 */}
            <View style={styles.tabContainer}>
                <Text style={styles.activeTab}>인기글</Text>
            </View>

            {/* 게시글 목록 */}
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.post}>
                        <View style={styles.postHeader}>
                            <Image source={item.profileImage} style={styles.profileImage} />
                            <View>
                                <Text style={styles.username}>{item.username}</Text>
                                <Text style={styles.postTime}>{item.time}</Text>
                            </View>
                        </View>
                        <Text style={styles.postText}>{item.text}</Text>
                        <View style={styles.postImages}>
                            {item.images.map((img, index) => (
                                <Image key={index} source={img} style={styles.postImage} />
                            ))}
                        </View>
                    </View>
                )}
            />
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.post}>
                        <View style={styles.postHeader}>
                            <Image source={item.profileImage} style={styles.profileImage} />
                            <View>
                                <Text style={styles.username}>{item.username}</Text>
                                <Text style={styles.postTime}>{item.time}</Text>
                            </View>
                        </View>
                        <Text style={styles.postText}>{item.text}</Text>
                        <View style={styles.postImages}>
                            {item.images.map((img, index) => (
                                <Image key={index} source={img} style={styles.postImage} />
                            ))}
                        </View>
                    </View>
                )}
            />
            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.post}>
                        <View style={styles.postHeader}>
                            <Image source={item.profileImage} style={styles.profileImage} />
                            <View>
                                <Text style={styles.username}>{item.username}</Text>
                                <Text style={styles.postTime}>{item.time}</Text>
                            </View>
                        </View>
                        <Text style={styles.postText}>{item.text}</Text>
                        <View style={styles.postImages}>
                            {item.images.map((img, index) => (
                                <Image key={index} source={img} style={styles.postImage} />
                            ))}
                        </View>
                    </View>
                )}
            />

            {/* ✅ 딤처리 배경 (글쓰기 토글 켜졌을 때만 보임) */}
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

            {/* ✅ 글쓰기 토글 메뉴 (말풍선 모양) */}
            {isWriteToggleVisible && (
                <View style={{
                    position: 'absolute',
                    bottom: 200, // ← X 버튼보다 위로 올라오게
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
                                pathname: "/Homepage/writingpage",
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
                            source={require('../../assets/FarmingQuestions.png')}
                            style={{ width: 42, height: 42, marginRight: 7, marginBottom: 7, marginTop: 10 }}
                        />
                        <Text style={{ fontSize: 20, marginRight: 5, marginBottom: 10, marginTop: 10 }}>
                            농사질문 글쓰기
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
                                pathname: "/Homepage/writingpage",
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
                            source={require('../../assets/studyfarming.png')}
                            style={{ width: 35, height: 35, marginRight: 10, marginLeft: 5, marginBottom: 7 }}
                        />
                        <Text style={{ fontSize: 20, marginBottom: 7 }}>농사공부 글쓰기</Text>
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
                                pathname: "/Homepage/writingpage",
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
                            source={require('../../assets/freetopic.png')}
                            style={{ width: 40, height: 40, marginRight: 10, marginBottom: 15 }}
                        />
                        <Text style={{ fontSize: 20 }}>자유주제 글쓰기</Text>
                    </TouchableOpacity>

                </View>
            )}

            {/* ✅ 글쓰기 플로팅 버튼 */}
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
            <BottomTabNavigator currentTab="홈" onTabPress={(tab) => console.log(tab)} />
        </View>
    );
};

export default HomePage;
