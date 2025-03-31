import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Dimensions, Animated, ScrollView } from 'react-native';
import styles from '../Components/Css/Homepage/homepagestyle';
import { FontAwesome } from '@expo/vector-icons';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { useNavigation } from '@react-navigation/native';

const HomePage = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('추천글');

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
            {/* ✅ 상단 검색 바 */}
            <View style={styles.searchBarContainer}>
                {/* 햄버거 버튼 */}
                <TouchableOpacity style={styles.menuIconWrapper}>
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
