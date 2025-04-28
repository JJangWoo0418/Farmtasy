import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, Animated, Dimensions, Easing, ActivityIndicator } from 'react-native';
import styles from '../Components/Css/Homepage/postpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_CONFIG from '../DB/api';
import userIcon from '../../assets/usericon.png'; // 실제 경로에 맞게 수정

const SCREEN_WIDTH = Dimensions.get('window').width;

const PostPage = () => {
    const navigation = useNavigation();
    const [selectedFilter, setSelectedFilter] = useState('전체');
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const [heartAnimations, setHeartAnimations] = useState({});
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkAnimations, setBookmarkAnimations] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // ✅ 글쓰기 버튼 애니메이션 관련 상태
    const writeButtonAnim = useRef(new Animated.Value(1)).current;
    const [showText, setShowText] = useState(true);
    const route = useRoute();
    const {
        category = '카테고리 없음',
        categoryTitle = '카테고리 없음',
        categoryDesc = '',
        categoryIcon = require('../../assets/Xicon.png'),
    } = route.params || {};

    // 이미지 로딩 애니메이션 추가
    const RenderImageWithLoading = ({ url }) => {
        const [loading, setLoading] = useState(true);

        return (
            <View
                style={{
                    width: 375,
                    height: 375,
                    marginRight: 10,
                    marginBottom: 8,
                    marginLeft: -8,
                    backgroundColor: '#eee',
                    borderRadius: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}
            >
                {loading && (
                    <ActivityIndicator
                        size="large"
                        color="#22CC6B"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    />
                )}
                <Image
                    source={{ uri: url }}
                    style={{
                        width: 375,
                        height: 375,
                        resizeMode: 'cover',
                    }}
                    onLoadEnd={() => setLoading(false)}
                />
            </View>
        );
    };

    // 게시글 데이터 fetch
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // 카테고리별로 불러오기
                let url = `${API_CONFIG.BASE_URL}/api/post`;
                if (category && category !== '카테고리 없음') {
                    url += `?category=${encodeURIComponent(category)}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error('서버 응답 오류');
                const data = await response.json();

                setPosts(data);
            } catch (err) {
                setError('게시글을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [category]);

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

    const handleTabPress = (item, index) => {
        setSelectedFilter(item);
        Animated.timing(underlineAnim, {
            toValue: index * (SCREEN_WIDTH / 4),
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const triggerHeartAnimation = (postId) => {
        // 애니메이션 값이 없으면 새로 생성
        if (!heartAnimations[postId]) {
            const newAnimation = new Animated.Value(1);
            setHeartAnimations(prev => ({
                ...prev,
                [postId]: newAnimation
            }));
            // 새로 생성된 애니메이션으로 바로 실행
            newAnimation.setValue(0.8);
            Animated.spring(newAnimation, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        } else {
            // 기존 애니메이션 실행
            const currentAnimation = heartAnimations[postId];
            currentAnimation.setValue(0.8);
            Animated.spring(currentAnimation, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        }

        // 좋아요 상태 토글
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // 북마크 애니메이션 트리거 함수 추가
    const triggerBookmarkAnimation = (postId) => {
        // 애니메이션 값 관리 (좋아요와 동일 로직)
        let currentAnimation = bookmarkAnimations[postId];
        if (!currentAnimation) {
            currentAnimation = new Animated.Value(1);
            setBookmarkAnimations(prev => ({
                ...prev,
                [postId]: currentAnimation
            }));
        }

        // 애니메이션 실행
        currentAnimation.setValue(0.8); // 작게 시작
        Animated.spring(currentAnimation, {
            toValue: 1,
            friction: 3, // 탄성 효과 조절
            useNativeDriver: true,
        }).start();

        // 북마크 상태 토글
        setBookmarkedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleLike = (postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );
    };

    const handleBookmark = (postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, isBookmarked: !post.isBookmarked, bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1 }
                    : post
            )
        );
    };

    const renderPost = ({ item }) => {
        console.log('item.image_urls:', item.image_urls); // 추가
        const isLiked = likedPosts[item.id] || false;
        const isBookmarked = bookmarkedPosts[item.id] || false;
        const heartAnimation = heartAnimations[item.id] || new Animated.Value(1);
        const bookmarkAnimation = bookmarkAnimations[item.id] || new Animated.Value(1);

        const navigateToDetail = () => {
            navigation.navigate('Homepage/postdetailpage', { post: item });
        };

        return (
            <View style={styles.postBox}>
                <TouchableOpacity onPress={navigateToDetail}>
                    <View style={styles.postHeader}>
                        <Image
                            source={
                                item.profile
                                    ? { uri: item.profile }
                                    : userIcon
                            }
                            style={styles.profileImg}
                        />
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.username}>{item.user}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <TouchableOpacity style={styles.moreBtn}>
                            <Image source={require('../../assets/moreicon.png')} />
                        </TouchableOpacity>
                    </View>
                    <View activeOpacity={0.8}>
                        <Text style={styles.postText}>{item.text}</Text>
                        {item.image_urls && item.image_urls.flat().length > 0 && (
                            <View style={styles.postImages}>
                                {item.image_urls.flat().map((url, idx) => (
                                    <RenderImageWithLoading key={url + idx} url={url} />
                                ))}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <View style={styles.iconRow}>
                    <View style={[styles.iconGroup, styles.likeIconGroup]}>
                        <TouchableOpacity onPress={() => triggerHeartAnimation(item.id)}>
                            <Animated.Image
                                source={isLiked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')}
                                style={[
                                    styles.icon,
                                    { transform: [{ scale: heartAnimation }] }
                                ]}
                            />
                        </TouchableOpacity>
                        <Text style={styles.iconText}>{isLiked ? item.likes + 1 : item.likes}</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <Image source={require('../../assets/commenticon.png')} style={styles.icon2} />
                        <Text style={styles.iconText}>{item.comments}</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <TouchableOpacity onPress={() => triggerBookmarkAnimation(item.id)}>
                            <Animated.Image
                                source={isBookmarked ? require('../../assets/bookmarkgreenicon.png') : require('../../assets/bookmarkicon.png')}
                                style={[
                                    styles.icon3,
                                    { transform: [{ scale: bookmarkAnimation }] }
                                ]}
                            />
                        </TouchableOpacity>
                        <Text style={styles.iconText}>{isBookmarked ? item.bookmarks + 1 : item.bookmarks}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* FlatList 스크롤 감지 */}
            {/* 로딩/에러 처리 */}
            {loading && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>로딩 중...</Text>
                </View>
            )}
            {error && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{error}</Text>
                </View>
            )}
            {!loading && !error && (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    ListHeaderComponent={
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Image source={require('../../assets/gobackicon.png')} />
                                </TouchableOpacity>
                                <Text style={styles.title}>게시글</Text>
                            </View>
                            {/* 카테고리 설명 부분 */}
                            <View style={styles.topicBox}>
                                <Image source={categoryIcon} style={styles.topicIcon} />
                                <View>
                                    <Text style={styles.topicText}>{categoryTitle}</Text>
                                    <Text style={styles.topicSub}>{categoryDesc}</Text>
                                </View>
                            </View>
                            <View style={styles.searchBox}>
                                <Image source={require('../../assets/searchicon.png')} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="  제목이나 키워드로 게시글 검색"
                                    placeholderTextColor="#aaa"
                                />
                            </View>
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
                                        { transform: [{ translateX: underlineAnim }] },
                                    ]}
                                />
                            </View>
                        </>
                    }
                />
            )}

            {/* 글쓰기 버튼 */}
            <Animated.View
                style={[
                    styles.writeButton,
                    {
                        transform: [
                            {
                                scale: writeButtonAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                }),
                            },
                            {
                                translateY: writeButtonAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [15, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {showText && (
                        <Animated.Text
                            style={[styles.writeButtonText, {
                                opacity: writeButtonAnim,
                            }]}
                        >
                            글쓰기  </Animated.Text>
                    )}
                    <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default PostPage;