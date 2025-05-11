import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput, Animated, StatusBar, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform, ToastAndroid } from 'react-native';
import styles from '../../Components/Css/Homepage/homepagestyle';
import { FontAwesome } from '@expo/vector-icons';
import BottomTabNavigator from '../../Navigator/BottomTabNavigator';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import API_CONFIG from '../../DB/api';
import { Ionicons } from '@expo/vector-icons';

// 이미지 로딩 컴포넌트
const ImageWithLoading = ({ uri, style, loadingStyle }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <View style={[style, isLoading && { backgroundColor: '#eee' }]}>
            <Image
                source={{ uri }}
                style={[style, { position: 'absolute' }]}
                onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
                <View style={[loadingStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color="#999" />
                </View>
            )}
        </View>
    );
};

const HomePage = () => {
    const navigation = useNavigation();
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [isWriteToggleVisible, setWriteToggleVisible] = useState(false);
    const route = useRoute();
    const { userData, phone, name, region } = useLocalSearchParams();
    const [popularPosts, setPopularPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const heartAnimationsRef = useRef({});
    const bookmarkAnimationsRef = useRef({});

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
                pathname: 'Homepage/Post/postpage',
                params: {
                    category: '자유주제',
                    categoryTitle: '화목한 농부들의 자유주제',
                    categoryDesc: '다양한 주제로 소통해 보세요',
                    categoryIcon: require('../../../assets/freetopic2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        } else if (category === '농사공부') {
            router.push({
                pathname: 'Homepage/Post/postpage',
                params: {
                    category: '농사공부',
                    categoryTitle: '똑똑한 농부들의 농사공부',
                    categoryDesc: '유익한 정보들을 공유해보세요',
                    categoryIcon: require('../../../assets/studyfarming2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        } else if (category === '농사질문') {
            router.push({
                pathname: 'Homepage/Post/postpage',
                params: {
                    category: '농사질문',
                    categoryTitle: '질문은 배움의 시작 농사질문',
                    categoryDesc: '농사에 대한 질문을 남겨보세요',
                    categoryIcon: require('../../../assets/farmingquestions2.png'),
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region || '지역 미설정'
                }
            });
        }
    };

    useEffect(() => {
        fetchPopularPosts();
    }, []);

    const fetchPopularPosts = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/popular?user_phone=${phone}`);
            if (!response.ok) {
                throw new Error('인기 게시글을 가져오는데 실패했습니다.');
            }
            const data = await response.json();
            
            // 데이터 가공
            const processedData = data.map(post => ({
                ...post,
                username: post.username || post.author_name,
                profileImage: post.profileImage || post.author_profile,
                region: post.region || post.author_region,
                introduction: post.introduction || post.author_introduction,
                createdAt: post.createdAt || post.created_at,
                is_liked: post.is_liked === true || post.is_liked === 1,
                is_bookmarked: post.is_bookmarked === true || post.is_bookmarked === 1
            }));
            
            // 북마크/좋아요 상태 초기화
            const initialBookmarks = {};
            const initialLikes = {};
            processedData.forEach(post => {
                initialBookmarks[post.id] = post.is_bookmarked;
                initialLikes[post.id] = post.is_liked;
            });
            
            setPopularPosts(processedData);
            setBookmarkedPosts(initialBookmarks);
            setLikedPosts(initialLikes);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 날짜 포맷팅 함수 수정
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            // 이미 포맷팅된 날짜 문자열인 경우 연도 제거하고 24시간 형식으로 변환
            if (dateString.includes('년') && dateString.includes('월') && dateString.includes('일')) {
                const timeMatch = dateString.match(/(\d+):(\d+)/);
                if (timeMatch) {
                    const hour = parseInt(timeMatch[1]);
                    const minute = timeMatch[2];
                    return dateString
                        .replace(/\d{4}년\s/, '')
                        .replace(/오전\s/, '')
                        .replace(/오후\s/, '')
                        .replace(/\d+:\d+/, `${hour.toString().padStart(2, '0')}:${minute}`);
                }
                return dateString
                    .replace(/\d{4}년\s/, '')
                    .replace(/오전\s/, '')
                    .replace(/오후\s/, '');
            }

            // ISO 형식의 날짜인 경우
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }

            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hour = date.getHours().toString().padStart(2, '0');
            const minute = date.getMinutes().toString().padStart(2, '0');

            return `${month}월 ${day}일 ${hour}:${minute}`;
        } catch (error) {
            return '';
        }
    };

    // 이미지 렌더링 함수
    const renderImages = (images) => {
        if (!images || images.length === 0) return null;
        if (images.length === 1) {
            return (
                <ImageWithLoading
                    uri={images[0]}
                    style={styles.singleImage}
                    loadingStyle={{ width: 300, height: 300 }}
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

    // 게시글 데이터 fetch 시 북마크 상태도 함께 가져오기
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/posts/popular?user_phone=${phone}`);
                const data = await response.json();
                setPosts(Array.isArray(data) ? data : []);
                
                // 북마크/좋아요 상태 초기화
                const initialBookmarks = {};
                const initialLikes = {};
                (Array.isArray(data) ? data : []).forEach(post => {
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
        if (phone) fetchPosts();
    }, [phone]);

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

        try {
            // 상태 즉시 업데이트
            setLikedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            setPopularPosts(prev =>
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
                // 실패 시 상태 되돌리기
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: currentLike
                }));
                setPopularPosts(prev =>
                    prev.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                is_liked: currentLike,
                                likes: post.likes + (currentLike ? 1 : -1)
                            }
                            : post
                    )
                );
                throw new Error('좋아요 처리 실패');
            }
        } catch (error) {
            // 에러 처리 (필요시)
        }
    }, [phone]);

    // 북마크 애니메이션 및 상태 토글 useCallback
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
            // 상태 즉시 업데이트
            setBookmarkedPosts(prev => ({
                ...prev,
                [postId]: !prev[postId]
            }));
            setPopularPosts(prev =>
                prev.map(post =>
                    post.id === postId
                        ? {
                            ...post,
                            is_bookmarked: !post.is_bookmarked
                        }
                        : post
                )
            );

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post_bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    post_id: postId,
                    user_phone: phone
                }),
            });

            if (!response.ok) {
                // 실패 시 상태 되돌리기
                setBookmarkedPosts(prev => ({
                    ...prev,
                    [postId]: !prev[postId]
                }));
                setPopularPosts(prev =>
                    prev.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                is_bookmarked: !post.is_bookmarked
                            }
                            : post
                    )
                );
                throw new Error('북마크 처리 실패');
            }

            const result = await response.json();
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

    // 게시글 렌더링 함수를 useCallback으로 최적화
    const renderPost = useCallback((post) => {
        if (!post) return null;

        // 애니메이션 값 초기화
        if (!heartAnimationsRef.current[post.id]) {
            heartAnimationsRef.current[post.id] = new Animated.Value(1);
        }
        if (!bookmarkAnimationsRef.current[post.id]) {
            bookmarkAnimationsRef.current[post.id] = new Animated.Value(1);
        }

        const isLiked = likedPosts[post.id] || (post.is_liked === true || post.is_liked === 1);
        const isBookmarked = bookmarkedPosts[post.id] || (post.is_bookmarked === true || post.is_bookmarked === 1);

        return (
            <TouchableOpacity 
                key={post.id} 
                style={styles.postBox}
                onPress={() => {
                    navigation.push('Homepage/Post/postdetailpage', {
                        post: {
                            ...post,
                            phone: post.phone,
                            username: post.username,
                            profileImage: post.profileImage,
                            region: post.region,
                            introduction: post.introduction,
                            createdAt: post.createdAt
                        },
                        introduction: post.introduction || '소개 미설정',
                        phone: route.params?.phone,
                        name: route.params?.name,
                        region: route.params?.region,
                        profile: route.params?.userData,
                        introduction: route.params?.introduction,
                        author: {
                            username: post.username,
                            profileImage: post.profileImage,
                            region: post.region,
                            introduction: post.introduction
                        }
                    });
                }}
            >
                <View style={styles.postHeader}>
                    <Image
                        source={post.profileImage ? { uri: post.profileImage } : require('../../../assets/usericon.png')}
                        style={styles.profileImg}
                    />
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.username}>[{post.region || '지역 미설정'}] {post.username || '사용자'}</Text>
                        <Text style={styles.time}>{post.introduction || '소개 미설정'} · {formatDate(post.createdAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={(e) => {
                        e.stopPropagation();
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
                        <Image source={require('../../../assets/moreicon.png')} style={styles.moreBtn} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.postText}>{post.content || ''}</Text>
                {post.image_urls && post.image_urls.length > 0 && (
                    <View style={styles.postImages}>
                        {renderImages(post.image_urls)}
                    </View>
                )}
                <View style={styles.iconRow}>
                    <View style={[styles.iconGroup, styles.likeIconGroup]}>
                        <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            handleLike(post.id, isLiked);
                        }}>
                            <Animated.Image
                                source={isLiked ? require('../../../assets/heartgreenicon.png') : require('../../../assets/hearticon.png')}
                                style={[
                                    styles.icon,
                                    { transform: [{ scale: heartAnimationsRef.current[post.id] }] }
                                ]}
                            />
                        </TouchableOpacity>
                        <Text style={styles.iconText}>{post.likes || 0}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Image source={require('../../../assets/commenticon.png')} style={styles.icon} />
                        <Text style={styles.iconText}>{post.commentCount || 0}</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            handleBookmark(post.id);
                        }}>
                            <Animated.Image
                                source={isBookmarked ? require('../../../assets/bookmarkgreenicon.png') : require('../../../assets/bookmarkicon.png')}
                                style={[
                                    styles.icon3,
                                    { transform: [{ scale: bookmarkAnimationsRef.current[post.id] }] }
                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {post.best_comment_content && (
                    <View style={styles.bestCommentPreview}>
                        <View style={styles.commentHeader}>
                            <Image
                                source={post.best_comment_profile && post.best_comment_profile !== '프로필 미설정' ? { uri: post.best_comment_profile } : require('../../../assets/usericon.png')}
                                style={styles.commentProfileImg}
                            />
                            <View style={styles.userInfoContainer}>
                                <Text style={styles.commentUsername}>[{post.best_comment_region || '지역 미설정'}] {post.best_comment_user || '사용자'}</Text>
                                <Text style={styles.commentInfo}>{post.best_comment_introduction || '소개 미설정'} · {post.best_comment_time ? formatDate(post.best_comment_time) : ''}</Text>
                            </View>
                            <TouchableOpacity onPress={(e) => {
                                e.stopPropagation();
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
                                <Image source={require('../../../assets/moreicon.png')} style={styles.moreBtn2} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.bestCommentText}>{post.best_comment_content}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [handleLike, handleBookmark, likedPosts, bookmarkedPosts, route.params, formatDate, navigation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!popularPosts || popularPosts.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View style={styles.searchBarContainer}>
                    <TouchableOpacity style={styles.menuIconWrapper} onPress={openDrawer}>
                        <FontAwesome name="bars" size={20} color="#555" />
                    </TouchableOpacity>
                    <View style={styles.searchBox}>
                        <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder=" 지금 필요한 농자재 검색"
                            placeholderTextColor="#aaa"
                        />
                    </View>
                    <TouchableOpacity style={styles.bellIconWrapper}>
                        <Image source={require('../../../assets/bellicon.png')} />
                    </TouchableOpacity>
                </View>
                <View style={styles.menuContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사질문')}>
                        <Image source={require('../../../assets/farmingquestions4.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>농사질문</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사공부')}>
                        <Image source={require('../../../assets/studyfarming4.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>농사공부</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('자유주제')}>
                        <Image source={require('../../../assets/freetopic4.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>자유주제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push({
                        pathname: '/Homepage/Home/directpaymentpage', params: {
                        userData: route.params?.userData,
                        phone: route.params?.phone,
                        name: route.params?.name,
                        region: route.params?.region
                        }
                    })}>
                        <Image source={require('../../../assets/directdeposit4.png')} style={styles.menuIcon} />
                        <Text style={styles.menuText}>직불금계산</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.tabContainer}>
                    <Text style={styles.activeTab}>인기글</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 게시글이 없습니다.</Text>
                </View>
                <BottomTabNavigator currentTab="홈" onTabPress={(tab) => console.log(tab)} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View
                style={[
                    styles.drawerOverlay,
                    { display: isDrawerVisible ? 'flex' : 'none' },
                ]}
            >
                <TouchableOpacity
                    style={styles.drawerBackground}
                    onPress={closeDrawer}
                    activeOpacity={1}
                />

                <Animated.View
                    style={[
                        styles.drawerStatic,
                        { transform: [{ translateX: drawerAnim }] },
                    ]}
                >
                    <TouchableOpacity onPress={closeDrawer} style={styles.drawerClose}>
                        <Image source={require('../../../assets/closeicon.png')} style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>

                    <Text style={styles.drawerTitle}>정보</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/profilepage',
                            params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region
                            }
                        });
                    }}>
                        <Image source={require('../../../assets/profileicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>프로필</Text>
                    </TouchableOpacity>
                    <Text style={styles.drawerTitle}>장터</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../../assets/shopicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>장터</Text>
                    </TouchableOpacity>

                    <Text style={styles.drawerTitle}>농사 정보</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => router.push({ pathname: '/Homepage/Home/directpaymentpage' })}>
                        <Image source={require('../../../assets/directdeposit2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>면적 직불금 계산기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../../assets/quoteicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>작물 시세</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../../assets/weathericon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>날씨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../../assets/bugicon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>병해충</Text>
                    </TouchableOpacity>

                    <Text style={styles.drawerTitle}>농사 게시판</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('자유주제')}>
                        <Image source={require('../../../assets/freetopic2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>자유주제</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('농사공부')}>
                        <Image source={require('../../../assets/studyfarming2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사공부</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => goToPostPage('농사질문')}>
                        <Image source={require('../../../assets/farmingquestions2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>농사질문</Text>
                    </TouchableOpacity>

                    <Text style={styles.drawerTitle}>AI</Text>
                    <TouchableOpacity style={styles.drawerItem}>
                        <Image source={require('../../../assets/chatboticon2.png')} style={styles.drawerIcon} />
                        <Text style={styles.drawerText}>질문하기</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={styles.searchBarContainer}>
                <TouchableOpacity style={styles.menuIconWrapper} onPress={openDrawer}>
                    <FontAwesome name="bars" size={20} color="#555" />
                </TouchableOpacity>

                <View style={styles.searchBox}>
                    <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder=" 지금 필요한 농자재 검색"
                        placeholderTextColor="#aaa"
                    />
                </View>

                <TouchableOpacity style={styles.bellIconWrapper}>
                    <Image source={require('../../../assets/bellicon.png')} />
                </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사질문')}>
                    <Image source={require('../../../assets/farmingquestions4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사질문</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('농사공부')}>
                    <Image source={require('../../../assets/studyfarming4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>농사공부</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => goToPostPage('자유주제')}>
                    <Image source={require('../../../assets/freetopic4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>자유주제</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push({
                    pathname: '/Homepage/Home/directpaymentpage', params: {
                    userData: route.params?.userData,
                    phone: route.params?.phone,
                    name: route.params?.name,
                    region: route.params?.region
                    }
                })}>
                    <Image source={require('../../../assets/directdeposit4.png')} style={styles.menuIcon} />
                    <Text style={styles.menuText}>직불금계산</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <Text style={styles.activeTab}>인기글</Text>
            </View>

            <ScrollView>
                {popularPosts.map(post => post && renderPost(post))}
            </ScrollView>

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
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사질문',
                                    icon: require('../../../assets/farmingquestions2.png'),
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
                            source={require('../../../assets/FarmingQuestions.png')}
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
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '농사공부',
                                    icon: require('../../../assets/studyfarming2.png'),
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
                            source={require('../../../assets/studyfarming.png')}
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
                                pathname: "/Homepage/Post/writingpage",
                                params: {
                                    category: '자유주제',
                                    icon: require('../../../assets/freetopic2.png'),
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
                            source={require('../../../assets/freetopic.png')}
                            style={{ width: 40, height: 40, marginRight: 10, marginBottom: 15 }}
                        />
                        <Text style={{ fontSize: 20 }}>자유주제 글쓰기</Text>
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
                        source={require('../../../assets/Xicon.png')}
                    />
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.writeButtonText}>글쓰기  </Text>
                        <Image
                            source={require('../../../assets/paperpencil.png')}
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
