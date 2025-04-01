import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Animated, StatusBar} from 'react-native';
import styles from '../Components/Css/Homepage/homepagestyle';
import { FontAwesome } from '@expo/vector-icons';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('추천글');
    const [isDrawerVisible, setDrawerVisible] = useState(false);

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
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/profileicon.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>프로필</Text>
                    </TouchableOpacity>
                    {/* 장터 */}
                    <Text style={styles.drawerTitle}>장터</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/shopicon.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>장터</Text>
                    </TouchableOpacity>

                    {/* 농사 정보 */}
                    <Text style={styles.drawerTitle}>농사 정보</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/directdeposit.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>면적 직불금 계산기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/mapicon.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>작물 시세</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/weathericon.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>날씨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/bugicon.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>병해충</Text>
                    </TouchableOpacity>

                    {/* 농사 게시판 */}
                    <Text style={styles.drawerTitle}>농사 게시판</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/freetopic.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>자유주제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/studyfarming.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사공부</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/FarmingQuestions.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사질문</Text>
                    </TouchableOpacity>

                    {/* AI */}
                    <Text style={styles.drawerTitle}>AI</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../assets/chatboticon.png')} style={styles.drawerIcon} />
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
                <TouchableOpacity style={styles.menuItem}>
                    <Image source={require('../../assets/FarmingQuestions.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사질문</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Image source={require('../../assets/studyfarming.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사공부</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Image source={require('../../assets/freetopic.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>자유주제</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Image source={require('../../assets/directdeposit.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>직불금계산</Text>
                </TouchableOpacity>
            </View>

            {/* 추천글 & 이웃글 탭 */}
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setActiveTab('추천글')}>
                    <Text style={activeTab === '추천글' ? styles.activeTab : styles.inactiveTab}>추천글</Text>
                </TouchableOpacity>
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
            <TouchableOpacity
                style={styles.writeButton}
                onPress={() => {
                    // 글쓰기 화면으로 이동하거나 팝업 열기 등
                    navigation.navigate('WritePost'); // 예시
                }}
            >
                <Text style={styles.writeButtonText}>글쓰기</Text>
            </TouchableOpacity>

            <BottomTabNavigator currentTab="홈" onTabPress={(tab) => console.log(tab)} />
        </View>
    );
};

export default HomePage;
