import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import styles from '../Components/Css/Homepage/postpagestyle';
import { useNavigation } from '@react-navigation/native';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PostPage = () => {
    const navigation = useNavigation();
    const [selectedFilter, setSelectedFilter] = useState('전체');
    const underlineAnim = useRef(new Animated.Value(0)).current;

    const handleTabPress = (item, index) => {
        setSelectedFilter(item);
        Animated.timing(underlineAnim, {
            toValue: index * (SCREEN_WIDTH / 4),
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const posts = [
        {
            id: '1',
            user: '충북음성 이준호',
            time: '1시간 전',
            text: '이런 곳에 산다면.\n얼마나 좋을까.',
            image: require('../../assets/postimage1.png'),
            likes: 20,
            comments: 3,
            bookmarks: 5,
            profile: require('../../assets/leejunho.png'),
        },
        {
            id: '2',
            user: '충북음성 이준호',
            time: '5시간 전',
            text: '고양이가 제일 좋아요.',
            profile: require('../../assets/leejunho.png'),
        },
    ];

    const renderPost = ({ item }) => (
        <View style={styles.postBox}>
            <View style={styles.postHeader}>
                <Image source={item.profile} style={styles.profileImg} />
                <View>
                    <Text style={styles.username}>{item.user}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Image source={require('../../assets/moreicon.png')} />
                </TouchableOpacity>
            </View>
            <Text style={styles.postText}>{item.text}</Text>
            {item.image && <Image source={item.image} style={styles.postImage} />}
            <View style={styles.iconRow}>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/hearticon.png')} style={styles.icon} />
                    <Text style={styles.iconText}>{item.likes}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/commenticon2.png')} style={styles.icon2} />
                    <Text style={styles.iconText}>{item.comments}</Text>
                </View>
                <View style={styles.iconGroup}>
                    <Image source={require('../../assets/bookmarkicon.png')} style={styles.icon3} />
                    <Text style={styles.iconText}>{item.bookmarks}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} />
                </TouchableOpacity>
                <Text style={styles.title}>게시글</Text>
            </View>

            {/* 카테고리 설명 */}
            <View style={styles.topicBox}>
                <Image source={require('../../assets/freetopic2.png')} style={styles.topicIcon} />
                <View>
                    <Text style={styles.topicText}>화목한 농부들의 자유주제</Text>
                    <Text style={styles.topicSub}>다양한 주제로 소통해 보세요</Text>
                </View>
            </View>

            {/* 검색창 */}
            <View style={styles.searchBox}>
                <Image source={require('../../assets/searchicon.png')} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="  제목이나 키워드로 게시글 검색"
                    placeholderTextColor="#aaa"
                />
            </View>

            {/* 필터 탭 */}
            <View style={styles.tabContainer}>
                {['전체', '인기순', '최신순', '오래된 순'].map((item, index) => (
                    <TouchableOpacity
                        key={item}
                        style={styles.tabItem}
                        onPress={() => handleTabPress(item, index)}
                    >
                        <Text style={[styles.tabText, selectedFilter === item && styles.activeTabText]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
                <Animated.View
                    style={[
                        styles.underline,
                        {
                            transform: [{ translateX: underlineAnim }],
                        },
                    ]}
                />
            </View>

            {/* 게시글 리스트 */}
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* 글쓰기 버튼 */}
            <TouchableOpacity style={styles.writeButton}>
                <Text style={styles.writeButtonText}>글쓰기</Text>
                <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
            </TouchableOpacity>
        </View>
    );
};

export default PostPage;