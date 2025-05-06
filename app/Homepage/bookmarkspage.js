import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, Animated, Dimensions, Easing, ActivityIndicator, StyleSheet, Alert, ToastAndroid, Platform } from 'react-native';
import styles from '../Components/Css/Homepage/postpagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_CONFIG from '../DB/api';
import userIcon from '../../assets/usericon.png'; // 실제 경로에 맞게 수정
import Toast from 'react-native-root-toast';

const SCREEN_WIDTH = Dimensions.get('window').width;

// PostItem 컴포넌트 분리 및 memo 적용
const PostItem = memo(({ item, onLike, onBookmark, heartAnimation, bookmarkAnimation, isBookmarked, navigateToDetail, formatDate }) => {
    // 애니메이션 값이 없을 경우 기본값 설정
    const safeHeartAnimation = heartAnimation || new Animated.Value(1);
    const safeBookmarkAnimation = bookmarkAnimation || new Animated.Value(1);

    return (
        <View style={styles.postBox}>
            <TouchableOpacity onPress={navigateToDetail}>
                <View style={styles.postHeader}>
                    <Image
                        source={item.profile_image && item.profile_image !== '프로필 미설정' ? { uri: item.profile_image } : require('../../assets/usericon.png')}
                        style={styles.profileImg}
                    />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.username}>[{item.region || '지역 미설정'}] {item.user}</Text>
                        <Text style={styles.time}>{item.introduction || '소개 미설정'} · {formatDate(item.time)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        Alert.alert(
                            "게시글 신고",
                            "이 게시글을 신고하시겠습니까?",
                            [
                                {
                                    text: "아니요",
                                    style: "cancel"
                                },
                                {
                                    text: "예",
                                    onPress: () => {
                                        Alert.alert(
                                            "신고 완료",
                                            "게시글이 신고되었습니다.",
                                            [{ text: "확인" }],
                                            { cancelable: true }
                                        );
                                    }
                                }
                            ]
                        );
                    }}>
                        <Image source={require('../../assets/moreicon.png')} style={styles.moreBtn} />
                    </TouchableOpacity>
                </View>
                <View activeOpacity={0.8}>
                    <Text style={styles.postText}>{item.text}</Text>
                    {item.image_urls && item.image_urls.length > 0 && (
                        <View style={styles.postImages}>
                            {renderImages(item.image_urls)}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <View style={styles.iconRow}>
                <View style={[styles.iconGroup, styles.likeIconGroup]}>
                    <TouchableOpacity onPress={() => onLike(item.id, item.is_liked)}>
                        <Animated.Image
                            source={item.is_liked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')}
                            style={[
                                styles.icon,
                                { transform: [{ scale: safeHeartAnimation }] }
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
                    <TouchableOpacity onPress={onBookmark}>
                        <Animated.Image
                            source={isBookmarked ? require('../../assets/bookmarkgreenicon.png') : require('../../assets/bookmarkicon.png')}
                            style={[
                                styles.icon3,
                                { transform: [{ scale: safeBookmarkAnimation }] }
                            ]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {item.best_comment_content && (
                <View style={styles.bestCommentPreview}>
                    <View style={styles.commentHeader}>
                        <Image
                            source={item.best_comment_profile && item.best_comment_profile !== '프로필 미설정' ? { uri: item.best_comment_profile } : require('../../assets/usericon.png')}
                            style={styles.commentProfileImg}
                        />
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.commentUsername}>[{item.best_comment_region || '지역 미설정'}] {item.best_comment_user}</Text>
                            <Text style={styles.commentInfo}>{item.best_comment_introduction || '소개 미설정'} · {item.best_comment_time ? formatDate(item.best_comment_time) : ''}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            Alert.alert(
                                "댓글 신고",
                                "이 댓글을 신고하시겠습니까?",
                                [
                                    {
                                        text: "아니요",
                                        style: "cancel"
                                    },
                                    {
                                        text: "예",
                                        onPress: () => {
                                            Alert.alert(
                                                "신고 완료",
                                                "댓글이 신고되었습니다.",
                                                [{ text: "확인" }],
                                                { cancelable: true }
                                            );
                                        }
                                    }
                                ]
                            );
                        }}>
                            <Image source={require('../../assets/moreicon.png')} style={styles.moreBtn2} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.bestCommentText}>{item.best_comment_content}</Text>
                </View>
            )}
        </View>
    );
});

// 이미지 로딩 컴포넌트
const ImageWithLoading = ({ uri, style, loadingStyle }) => {
    const [loading, setLoading] = useState(true);

    return (
        <View style={[
            style,
            { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }
        ]}>
            {loading && (
                <View style={[
                    {
                        position: 'absolute',
                        backgroundColor: '#eee',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    },
                    loadingStyle // 로딩 배경 크기/스타일
                ]}>
                    <ActivityIndicator size="large" color="#22CC6B" />
                </View>
            )}
            <Image
                source={{ uri }}
                style={[style, { position: 'absolute' }]}
                onLoadEnd={() => setLoading(false)}
                resizeMode="cover"
            />
        </View>
    );
};

// 이미지 렌더링 함수 (1~3장, 4장 이상 예시처럼)
const renderImages = (images) => {
    if (!images || images.length === 0) return null;
    if (images.length === 1) {
        return (
            <ImageWithLoading
                uri={images[0]}
                style={styles.singleImage}
                loadingStyle={{ width: 300, height: 300 }} // 로딩 배경 크기 조절
            />
        );
    }
    if (images.length === 2) {
        return (
            <View style={styles.row2}>
                <ImageWithLoading
                    uri={images[0]}
                    style={styles.multiImage}
                    loadingStyle={{ width: 200, height: 200 }}
                />
                <ImageWithLoading
                    uri={images[1]}
                    style={styles.multiImage}
                    loadingStyle={{ width: 200, height: 200 }}
                />
            </View>
        );
    }
    if (images.length === 3) {
        return (
            <View style={styles.row3}>
                <ImageWithLoading
                    uri={images[0]}
                    style={styles.leftLargeImage}
                    loadingStyle={{ width: 236, height: 236 }}
                />
                <View style={styles.rightColumn}>
                    <ImageWithLoading
                        uri={images[1]}
                        style={styles.rightSmallImage}
                        loadingStyle={{ width: 114, height: 114 }}
                    />
                    <ImageWithLoading
                        uri={images[2]}
                        style={styles.rightSmallImage}
                        loadingStyle={{ width: 114, height: 114 }}
                    />
                </View>
            </View>
        );
    }
    // 4장 이상
    return (
        <>
            <View style={styles.row4}>
                <ImageWithLoading
                    uri={images[0]}
                    style={styles.squadImage}
                    loadingStyle={{ width: 180, height: 180 }}
                />
                <ImageWithLoading
                    uri={images[1]}
                    style={styles.squadImage}
                    loadingStyle={{ width: 180, height: 180 }}
                />
            </View>
            <View style={styles.row4}>
                <ImageWithLoading
                    uri={images[2]}
                    style={styles.squadImage}
                    loadingStyle={{ width: 180, height: 180 }}
                />
                <View>
                    <ImageWithLoading
                        uri={images[3]}
                        style={styles.squadImage}
                        loadingStyle={{ width: 180, height: 180 }}
                    />
                    {images.length > 4 && (
                        <View style={styles.overlay}>
                            <Text style={styles.overlayText}>+{images.length - 4}</Text>
                        </View>
                    )}
                </View>
            </View>
        </>
    );
};

const Bookmarkspage = () => {
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

    // 게시글 데이터 fetch 시 좋아요/북마크 상태도 함께 가져오기
    useEffect(() => {
        const fetchBookmarkedPosts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/post_bookmarks/user/${phone}`);
                const data = await response.json();
                // 북마크된 글만 posts에 저장
                setPosts(Array.isArray(data.bookmarks) ? data.bookmarks : []);
                // 북마크/좋아요 상태 초기화
                const initialBookmarks = {};
                const initialLikes = {};
                (Array.isArray(data.bookmarks) ? data.bookmarks : []).forEach(post => {
                    initialBookmarks[post.id] = post.is_bookmarked === true || post.is_bookmarked === 1;
                    initialLikes[post.id] = post.is_liked === true || post.is_liked === 1;
                });
                setBookmarkedPosts(initialBookmarks);
                setLikedPosts(initialLikes);
            } catch (e) {
                setPosts([]);
                setBookmarkedPosts({});
                setLikedPosts({});
            } finally {
                setLoading(false);
            }
        };
        if (phone) fetchBookmarkedPosts();
    }, [phone]);

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

    // 북마크 애니메이션 및 상태 토글 useCallback (좋아요와 동일하게)
    const handleBookmark = useCallback(async (postId) => {
        if (!bookmarkAnimationsRef.current[postId]) {
            bookmarkAnimationsRef.current[postId] = new Animated.Value(1);
        }
        Animated.sequence([
            Animated.timing(bookmarkAnimationsRef.current[postId], {
                toValue: 1.5,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(bookmarkAnimationsRef.current[postId], {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post_bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    user_phone: phone
                }),
            });

            if (!response.ok) {
                throw new Error('북마크 처리 실패');
            }

            const result = await response.json();
            setBookmarkedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));

            // 알림
            if (Platform.OS === 'android') {
                ToastAndroid.show(
                    result.is_bookmarked
                        ? '북마크 리스트에 추가되었습니다.'
                        : '북마크가 해제되었습니다.',
                    ToastAndroid.SHORT
                );
            } else {
                Alert.alert(
                    result.is_bookmarked
                        ? '북마크 리스트에 추가되었습니다.'
                        : '북마크가 해제되었습니다.'
                );
            }
        } catch (error) {
            // 에러 처리 (필요시)
        }
    }, [phone]);

    // 좋아요 핸들러 useCallback (북마크와 동일하게)
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

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post/post_like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    like: !currentLike,
                    phone
                }),
            });

            if (!response.ok) {
                throw new Error('좋아요 처리 실패');
            }

            // likedPosts만 즉시 갱신
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            // posts의 likes, is_liked도 즉시 갱신
            setPosts(prev =>
                prev.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            is_liked: !currentLike,
                            likes: post.likes + (!currentLike ? 1 : -1)
                        }
                        : post
                )
            );
        } catch (error) {
            // 에러 처리 (필요시)
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
            // 애니메이션 값 초기화
            if (!heartAnimationsRef.current[item.id]) {
                heartAnimationsRef.current[item.id] = new Animated.Value(1);
            }
            if (!bookmarkAnimationsRef.current[item.id]) {
                bookmarkAnimationsRef.current[item.id] = new Animated.Value(1);
            }

            return (
                <View key={item.id} style={styles.postContainer}>
                    <PostItem
                        item={{ ...item, is_liked: likedPosts[item.id] || false }}
                        onLike={() => handleLike(item.id, likedPosts[item.id] || false)}
                        onBookmark={() => handleBookmark(item.id)}
                        heartAnimation={heartAnimationsRef.current[item.id]}
                        bookmarkAnimation={bookmarkAnimationsRef.current[item.id]}
                        isBookmarked={bookmarkedPosts[item.id] || false}
                        navigateToDetail={() => {
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
                </View>
            );
        },
        [handleLike, handleBookmark, navigation, phone, name, region, profile, introduction, bookmarkedPosts, likedPosts]
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
                                <Text style={styles.title}>저장한 글</Text>
                            </View>
                        </>
                    }
                />
            )}
        </View>
    );
};

export default Bookmarkspage;