import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, Animated, Dimensions, Easing, ActivityIndicator } from 'react-native';
import styles from '../Components/Css/Homepage/postpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_CONFIG from '../DB/api';
import userIcon from '../../assets/usericon.png'; // 실제 경로에 맞게 수정

const SCREEN_WIDTH = Dimensions.get('window').width;

// PostItem 컴포넌트 분리 및 memo 적용
const PostItem = memo(({ item, onLike, onBookmark, heartAnimation, bookmarkAnimation, isBookmarked, navigateToDetail, formatDate }) => (

    <View style={styles.postBox}>
        <TouchableOpacity onPress={navigateToDetail}>
            <View style={styles.postHeader}>
                <Image
                    source={item.profile ? { uri: item.profile } : userIcon}
                    style={styles.profileImg}
                />
                <View style={styles.userInfoContainer}>
                    <Text style={styles.username}>[{item.region || '지역 미설정'}] {item.user}</Text>
                    <Text style={styles.time}>{item.introduction || '소개 미설정'} · {formatDate(item.time)}</Text>
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
                <TouchableOpacity onPress={() => onLike(item.id, item.isLiked)}>
                    <Animated.Image
                        source={item.isLiked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')}
                        style={[
                            styles.icon,
                            { transform: [{ scale: heartAnimation }] }
                        ]}
                    />
                </TouchableOpacity>
                <Text style={styles.iconText}>{item.likes}</Text>
            </View>
            <View style={styles.iconGroup}>
                <Image source={require('../../assets/commenticon.png')} style={styles.icon2} />
                <Text style={styles.iconText}>{item.comments}</Text>
            </View>
            <View style={styles.iconGroup}>
                <TouchableOpacity onPress={() => onBookmark(item.id)}>
                    <Animated.Image
                        source={isBookmarked ? require('../../assets/bookmarkgreenicon.png') : require('../../assets/bookmarkicon.png')}
                        style={[
                            styles.icon3,
                            { transform: [{ scale: bookmarkAnimation }] }
                        ]}
                    />
                </TouchableOpacity>
            </View>
        </View>
    </View>
));

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

const PostPage = () => {
    const navigation = useNavigation();
    const [selectedFilter, setSelectedFilter] = useState('전체');
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const writeButtonAnim = useRef(new Animated.Value(1)).current;
    const [showText, setShowText] = useState(true);
    const route = useRoute();

    // 애니메이션 객체 useRef로 관리
    const heartAnimationsRef = useRef({});
    const bookmarkAnimationsRef = useRef({});

    const {
        category = '카테고리 없음',
        categoryTitle = '카테고리 없음',
        categoryDesc = '',
        categoryIcon = require('../../assets/Xicon.png'),
        userData,
        phone = '',
        name = '',
        region = '지역 미설정'
    } = route.params || {};

    // 받은 사용자 정보 로깅
    useEffect(() => {
        console.log('PostPage에서 받은 route.params:', route.params);
        console.log('PostPage에서 받은 사용자 정보:', {
            userData,
            phone,
            name,
            region
        });
    }, [route.params]);

    // 날짜 포맷 함수
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${month}월 ${day}일 ${hour}:${min}`;
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

    const handleTabPress = (item, index) => {
        setSelectedFilter(item);
        Animated.timing(underlineAnim, {
            toValue: index * (SCREEN_WIDTH / 4),
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // 북마크 애니메이션 및 상태 토글 useCallback
    const triggerBookmarkAnimation = useCallback((postId) => {
        if (!bookmarkAnimationsRef.current[postId]) {
            bookmarkAnimationsRef.current[postId] = new Animated.Value(1);
        }
        const currentAnimation = bookmarkAnimationsRef.current[postId];
        currentAnimation.setValue(0.8);
        Animated.spring(currentAnimation, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
        setBookmarkedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    }, []);

    // 좋아요 핸들러 useCallback
    const handleLike = useCallback(async (postId, currentLike) => {
        console.log('handleLike 호출:', { postId, currentLike, phone });
        // 하트 애니메이션 동작
        if (!heartAnimationsRef.current[postId]) {
            heartAnimationsRef.current[postId] = new Animated.Value(1);
        }
        Animated.sequence([
            Animated.timing(heartAnimationsRef.current[postId], {
                toValue: 1.5,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(heartAnimationsRef.current[postId], {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
        // 기존 optimistic UI 코드
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked: !currentLike,
                        likes: !currentLike ? post.likes + 1 : post.likes - 1
                    }
                    : post
            )
        );
        setLikedPosts(prev => ({
            ...prev,
            [postId]: !currentLike
        }));
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post/post_like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    like: !currentLike ? 1 : 0,
                    phone
                }),
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || '좋아요 처리 실패');
            }
        } catch (e) {
            console.error('좋아요 처리 중 오류:', e);
            // 에러 발생 시 UI 상태 롤백
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            isLiked: currentLike,
                            likes: currentLike ? post.likes - 1 : post.likes + 1
                        }
                        : post
                )
            );
            setLikedPosts(prev => ({
                ...prev,
                [postId]: currentLike
            }));
        }
    }, [phone]);

    // renderPost useCallback으로 고정
    const renderPost = useCallback(
        ({ item }) => {
            if (!heartAnimationsRef.current[item.id]) {
                heartAnimationsRef.current[item.id] = new Animated.Value(1);
            }
            if (!bookmarkAnimationsRef.current[item.id]) {
                bookmarkAnimationsRef.current[item.id] = new Animated.Value(1);
            }
            const isBookmarked = bookmarkedPosts[item.id] || false;
            return (
                <PostItem
                    item={item}
                    onLike={handleLike}
                    onBookmark={triggerBookmarkAnimation}
                    heartAnimation={heartAnimationsRef.current[item.id]}
                    bookmarkAnimation={bookmarkAnimationsRef.current[item.id]}
                    isBookmarked={isBookmarked}
                    navigateToDetail={() => navigation.navigate('Homepage/postdetailpage', { 
                        post: item,
                        introduction: item.introduction || '소개 미설정'
                    })}
                    formatDate={formatDate}
                />
            );
        },
        [bookmarkedPosts, handleLike, triggerBookmarkAnimation, navigation]
    );

    // keyExtractor useCallback
    const keyExtractor = useCallback((item, index) => item.id ? item.id.toString() : index.toString(), []);

    return (
        <View style={styles.container}>
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
                    keyExtractor={keyExtractor}
                    extraData={bookmarkedPosts}
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
                            글쓰기   
                        </Animated.Text>
                    )}
                    <Image source={require('../../assets/paperpencil.png')} style={styles.writeIcon} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default PostPage;