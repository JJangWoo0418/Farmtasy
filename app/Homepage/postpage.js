import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
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
            <View style={styles.iconContainer}>
                <Image source={require('../../assets/commenticon.png')} style={styles.icon} />
                <Text style={styles.iconText}>{item.commentCount || 0}</Text>
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
    const TAB_LIST = ['인기순', '최신순', '오래된 순'];
    const TAB_COUNT = TAB_LIST.length;

    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState('인기순');
    const [sortOption, setSortOption] = useState('인기순');
    const underlineAnim = useRef(new Animated.Value(0)).current;
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const writeButtonAnim = useRef(new Animated.Value(1)).current;
    const [showText, setShowText] = useState(true);
    const route = useRoute();
    const userData = route.params?.userData;
    const phone = route.params?.phone;
    const name = route.params?.name;
    const region = route.params?.region || '지역 미설정';
    const profile = userData?.profile;
    const introduction = userData?.introduction;
    const [searchText, setSearchText] = useState('');

    // 애니메이션 객체 useRef로 관리
    const heartAnimationsRef = useRef({});
    const bookmarkAnimationsRef = useRef({});

    const {
        category = '카테고리 없음',
        categoryTitle = '카테고리 없음',
        categoryDesc = '',
        categoryIcon = require('../../assets/Xicon.png'),
    } = route.params || {};

    const tabLabelOpacities = useRef(TAB_LIST.map(() => new Animated.Value(1))).current;
    const underlineWidth = useRef(new Animated.Value(SCREEN_WIDTH / TAB_COUNT)).current;

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

                // 각 게시글의 댓글 수를 가져오기
                const postsWithCommentCount = await Promise.all(
                    data.map(async (post) => {
                        const commentResponse = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}`);
                        const comments = await commentResponse.json();
                        return {
                            ...post,
                            commentCount: Array.isArray(comments) ? comments.length : 0
                        };
                    })
                );

                setPosts(postsWithCommentCount);
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
        setSelectedTabIndex(index);
        setSelectedFilter(item);
        if (item !== '전체') setSortOption(item);
        Animated.timing(underlineAnim, {
            toValue: index * (SCREEN_WIDTH / TAB_COUNT),
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const handleSortPress = (option) => {
        setSortOption(option);
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

    // 검색 필터링
    const filteredPosts = useMemo(() => {
        if (!searchText.trim()) return posts;
        const lower = searchText.trim().toLowerCase();
        return posts.filter(
            post =>
                (post.user && post.user.toLowerCase().includes(lower)) ||
                (post.text && post.text.toLowerCase().includes(lower))
        );
    }, [posts, searchText]);

    // 정렬 적용
    const sortedPosts = useMemo(() => {
        if (!filteredPosts) return [];
        let sorted = [...filteredPosts];
        switch (sortOption) {
            case '인기순':
                sorted.sort((a, b) => b.likes - a.likes);
                break;
            case '최신순':
                sorted.sort((a, b) => new Date(b.time) - new Date(a.time));
                break;
            case '오래된 순':
                sorted.sort((a, b) => new Date(a.time) - new Date(b.time));
                break;
            default:
                sorted.sort((a, b) => new Date(b.time) - new Date(a.time));
        }
        return sorted;
    }, [filteredPosts, sortOption]);

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
                    navigateToDetail={() => {
                        console.log('상세 이동 post:', item);
                        navigation.push('Homepage/postdetailpage', {
                            post: { ...item, phone: item.phone },
                            introduction: item.introduction || '소개 미설정',
                            phone,
                            name,
                            region,
                            profile,
                            introduction
                        });
                    }}
                    formatDate={formatDate}
                />
            );
        },
        [bookmarkedPosts, handleLike, triggerBookmarkAnimation, navigation, phone, name, region, profile, introduction]
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
                    data={sortedPosts}
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
                                    placeholder="  농부(유저)나 내용으로 게시글 검색"
                                    placeholderTextColor="#aaa"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>
                            <View style={styles.tabContainer}>
                                {TAB_LIST.map((item, index) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={styles.tabItem}
                                        onPress={() => handleTabPress(item, index)}
                                    >
                                        <Text style={[styles.tabText, selectedTabIndex === index && styles.activeTabText]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <Animated.View
                                    style={[
                                        styles.underline,
                                        { width: `${100 / TAB_COUNT}%`, transform: [{ translateX: underlineAnim }] },
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
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                        navigation.push('Homepage/writingpage', {
                            category: category,
                            icon: categoryIcon,
                            userData,
                            name,
                            phone,
                            region,
                        });
                    }}
                >
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