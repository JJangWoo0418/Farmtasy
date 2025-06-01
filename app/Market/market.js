import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Animated, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Market/marketstyle';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import API_CONFIG from '../DB/api';
import { ActivityIndicator } from 'react-native';

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

    const [isFreeShippingFiltered, setIsFreeShippingFiltered] = useState(false);
    const [isSortOptionsVisible, setIsSortOptionsVisible] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState('최신순');

    // 장바구니 로컬 상태 추가
    const [cartItems, setCartItems] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchText, setSearchText] = useState('');

    const [selectedCategory, setSelectedCategory] = useState(null);

    // 알림 관련 상태 추가
    const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    // 알림 모달 열 때 알림 목록 불러오기
    const openNotificationModal = () => {
        setIsNotificationModalVisible(true);
        fetchNotifications();
    };

    // 알림 목록 가져오기
    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/api/notifications?phone=${phone}`);
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('알림 조회 실패:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // 알림 내용 요약 함수
    const getSummary = (text) => {
        if (!text) return '';
        return text.length > 20 ? text.substring(0, 20) + '...' : text;
    };


    // API 호출
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}/api/market`);

                if (response.data && Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error('API 호출 에러:', error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // 카테고리별 상품 조회 함수
    const fetchProductsByCategory = async (category) => {
        try {
            // 디버깅을 위한 로그 추가
            console.log('선택한 카테고리:', category);
            const encodedCategory = encodeURIComponent(category);
            console.log('인코딩된 카테고리:', encodedCategory);

            const response = await axios.get(`${API_CONFIG.BASE_URL}/api/market/category/${encodedCategory}`);
            console.log('응답 데이터:', response.data);

            setProducts(response.data || []);
            setSelectedCategory(category);
        } catch (error) {
            console.error('카테고리별 상품 조회 실패:', error);
            console.error('에러 상세:', error.response?.data); // 에러 응답 데이터 확인
            setProducts([]);
        }
    };

    // 전체 상품 조회 함수
    const fetchAllProducts = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/api/market`);
            setProducts(response.data || []);
            setSelectedCategory(null); // 카테고리 선택 해제
        } catch (error) {
            console.error('전체 상품 조회 실패:', error);
            setProducts([]);
        }
    };

    // 검색어와 카테고리 모두 고려한 필터링
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // 카테고리 필터링
        if (selectedCategory) {
            filtered = filtered.filter(product =>
                product.market_category === selectedCategory
            );
        }

        // 검색어 필터링
        if (searchText.trim()) {
            filtered = filtered.filter(product =>
                (product.market_name || '').toLowerCase().includes(searchText.trim().toLowerCase())
            );
        }

        return filtered;
    }, [products, searchText, selectedCategory]);

    const getGridData = (data) => {
        if (data.length % 2 === 1) {
            return [...data, { isPlaceholder: true, market_id: 'placeholder_' + Math.random() }];
        }
        return data;
    };

    // 로컬 addToCart 함수 구현
    const addToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        let updatedCart;

        if (existingItem) {
            updatedCart = cartItems.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );
        } else {
            updatedCart = [...cartItems, { ...item, quantity: 1 }];
        }
        setCartItems(updatedCart);
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

    // 로컬 removeFromCart 함수 구현
    const removeFromCart = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
    };

    // 로컬 getTotalPrice 함수 구현
    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price.replace(/[^\d]/g, '')) * item.quantity), 0);
    };

    // 정렬된 상품 목록
    const sortedAndFilteredProducts = useMemo(() => {
        let result = [...filteredProducts];

        // 정렬 옵션에 따른 정렬
        switch (selectedSortOption) {
            case '최신순':
                result.sort((a, b) => new Date(b.market_created_at) - new Date(a.market_created_at));
                break;
            case '좋아요 순':
                result.sort((a, b) => (b.market_like || 0) - (a.market_like || 0));
                break;
            case '낮은 가격순':
                result.sort((a, b) => Number(a.market_price) - Number(b.market_price));
                break;
            case '높은 가격순':
                result.sort((a, b) => Number(b.market_price) - Number(a.market_price));
                break;
            default:
                break;
        }

        return result;
    }, [filteredProducts, selectedSortOption]);

    const ProductItem = ({ item, onPress, styles }) => {
        const [loading, setLoading] = React.useState(true);

        let imageUrl = '';
        try {
            let arr = [];
            if (Array.isArray(item.market_image_url)) {
                arr = item.market_image_url;
            } else if (typeof item.market_image_url === 'string') {
                arr = JSON.parse(item.market_image_url);
            }
            imageUrl = Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
        } catch (e) {
            imageUrl = '';
        }

        if (item.isPlaceholder) {
            return <View style={[styles.productCard, { backgroundColor: 'transparent', borderWidth: 0, elevation: 0 }]} />;
        }

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={onPress}
            >
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {loading && (
                        <ActivityIndicator
                            size="large"
                            color="#22CC6B"
                            style={{
                                position: 'absolute',
                                zIndex: 1,
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    )}
                    <Image
                        source={imageUrl ? { uri: imageUrl } : require('../../assets/cameraicon3.png')}
                        style={styles.productImg}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productTitle}>{item.market_name}</Text>
                    <Text style={styles.price}>{item.market_price?.toLocaleString()}원</Text>
                    <View style={styles.productDetails}>
                        <Text style={styles.productLocation}>{item.market_category}</Text>
                    </View>
                    <View style={styles.likeContainer}>
                        <Image source={require('../../assets/heartgreenicon.png')} style={styles.heartgreenIcon} />
                        <Text style={styles.likeCount}>{item.market_like || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderProductItem = ({ item }) => (
        <ProductItem
            item={item}
            onPress={() => {
                router.push({
                    pathname: '/Market/marketdetailpage',
                    params: {
                        productId: item.market_id,
                        phone
                    }
                });
            }}
            styles={styles}
        />
    );

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
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                    />
                </View>

                <TouchableOpacity
                    style={styles.bellIconWrapper}
                    onPress={openNotificationModal}  // 알림 모달 열기 함수 연결
                >
                    <Image source={require('../../assets/bellicon.png')} style={styles.bellIcon} />
                </TouchableOpacity>
            </View>

            {/* 알림 모달 */}
            <Modal
                visible={isNotificationModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsNotificationModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>알림</Text>
                            <TouchableOpacity
                                onPress={() => setIsNotificationModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.notificationList}>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <View
                                        key={`${notification.notification_id}_${index}`}  // 고유한 key 생성
                                        style={styles.notificationItem}
                                    >
                                        <Text style={styles.actorName}>
                                            {notification.actor_name}
                                        </Text>
                                        <Text style={styles.notificationText}>
                                            {notification.type === 'POST_LIKE' && (
                                                <>
                                                    내 게시글에 좋아요를 눌렀습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>"{getSummary(notification.post_content)}"</Text>
                                                </>
                                            )}
                                            {notification.type === 'MARKET_POST_LIKE' && (
                                                <>
                                                    내 장터글에 좋아요를 눌렀습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>"{getSummary(notification.market_name)}"</Text>
                                                </>
                                            )}
                                            {notification.type === 'COMMENT_LIKE' && (
                                                <>
                                                    내 댓글에 좋아요를 눌렀습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>"{getSummary(notification.comment_content)}"</Text>
                                                    {'\n'}
                                                    (게시글 : <Text style={styles.highlightText}>"{getSummary(notification.parent_post_content)}"</Text>)
                                                </>
                                            )}
                                            {notification.type === 'POST_COMMENT' && (
                                                <>
                                                    내 게시글에 댓글을 남겼습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>"{getSummary(notification.comment_content)}"</Text>
                                                    {'\n'}(게시글 : <Text style={styles.highlightText}>"{getSummary(notification.post_content)}"</Text>)
                                                </>
                                            )}
                                            {notification.type === 'COMMENT_REPLY' && (
                                                <>
                                                    내 댓글에 답글을 남겼습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>
                                                        "{getSummary(notification.comment_content)}"  {/* 다른 사람이 작성한 답글 내용 */}
                                                    </Text>
                                                    {'\n'}
                                                    (내 댓글 : <Text style={styles.highlightText}>"{getSummary(notification.parent_comment_content)}"</Text>)
                                                    {'\n'}
                                                    (게시글 : <Text style={styles.highlightText}>"{getSummary(notification.parent_post_content)}"</Text>)
                                                </>
                                            )}
                                            {notification.type === 'MARKET_COMMENT' && (
                                                <>
                                                    내 장터글에 댓글을 남겼습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>"{getSummary(notification.market_comment_content)}"</Text>
                                                    {'\n'}(장터글 : <Text style={styles.highlightText}>"{getSummary(notification.market_name)}"</Text>)
                                                </>
                                            )}
                                            {notification.type === 'MARKET_COMMENT_REPLY' && (
                                                <>
                                                    내 장터 댓글에 답글을 남겼습니다 :{'\n'}
                                                    <Text style={styles.highlightText}>
                                                        "{getSummary(notification.market_comment_content)}"  {/* 다른 사람이 작성한 답글 내용 */}
                                                    </Text>
                                                    {'\n'}
                                                    (내 댓글 : <Text style={styles.highlightText}>"{getSummary(notification.parent_market_comment_content)}"</Text>)
                                                    {'\n'}
                                                    (장터글 : <Text style={styles.highlightText}>"{getSummary(notification.market_name)}"</Text>)
                                                </>
                                            )}
                                        </Text>
                                        <Text style={styles.notificationTime}>
                                            {formatDate(notification.created_at)}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyNotification}>
                                    <Text style={styles.emptyNotificationText}>
                                        새로운 알림이 없습니다.
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* 카테고리 + 접기/펼치기 버튼 */}
            {!isFolded && (
                <>
                    <View style={styles.categoryWrap}>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat.label && styles.selectedCategory
                                ]}
                                onPress={() => fetchProductsByCategory(cat.label)}
                            >
                                <Image source={cat.icon} style={styles.categoryIcon} />
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 0 }}>
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

            {/* 최신순 및 무료배송 모아보기 */}
            <View style={styles.filterRowContainer}>
                <View style={styles.filterButtonsContainer}>
                    <TouchableOpacity
                        style={styles.latestSortContainer}
                        onPress={() => setIsSortOptionsVisible(true)}
                    >
                        <Text style={styles.latestSortText}>{selectedSortOption}</Text>
                        <FontAwesome name="chevron-down" size={12} color="#555" style={styles.dropdownIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            !selectedCategory && styles.selectedFilterButton
                        ]}
                        onPress={fetchAllProducts}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            !selectedCategory && styles.selectedFilterButtonText
                        ]}>전체 보기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 판매 글 목록 (전체) */}
            <FlatList
                data={getGridData(sortedAndFilteredProducts)}
                keyExtractor={item => item.market_id.toString()}
                renderItem={renderProductItem}
                numColumns={2}
                columnWrapperStyle={{
                    justifyContent: 'space-between',
                    paddingHorizontal: 2,
                    marginBottom: 2,
                    marginLeft: 1
                }}
                contentContainerStyle={styles.productListContainer}
                ListEmptyComponent={
                    isLoading
                        ? <Text style={{ textAlign: 'center', marginTop: 30 }}>상품을 불러오는 중입니다...</Text>
                        : <Text style={{ textAlign: 'center', marginTop: 30 }}>등록된 상품이 없습니다.</Text>
                }
            />

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
                                    category: '농수산물',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '농자재',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '생활잡화',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '농기계',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '비료/상토',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '제초용품',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '종자/모종',
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
                                pathname: "/Market/Marketupload",
                                params: {
                                    category: '기타',
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

            {/* 정렬 옵션 모달/뷰 */}
            {isSortOptionsVisible && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsSortOptionsVisible(false)}
                    style={styles.overlay}
                >
                    <View style={styles.sortOptionsContainer}>
                        <View style={styles.sortOptionsHeader}>
                            <Text style={styles.sortOptionsTitle}>정렬</Text>
                            <TouchableOpacity onPress={() => setIsSortOptionsVisible(false)}>
                                <FontAwesome name="times" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>
                        {['최신순', '좋아요 순', '낮은 가격순', '높은 가격순'].map(option => (
                            <TouchableOpacity
                                key={option}
                                style={styles.sortOptionItem}
                                onPress={() => {
                                    setSelectedSortOption(option);
                                    setIsSortOptionsVisible(false);
                                }}
                            >
                                <Text style={styles.sortOptionText}>{option}</Text>
                                {selectedSortOption === option && <FontAwesome name="check" size={16} color="#22CC6B" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
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
                        <Text style={styles.writeButtonText}>판매</Text>
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
                        router.push({
                            pathname: '/Chatbot/questionpage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    } else if (tab === '홈') {
                        router.push({
                            pathname: '/Homepage/Home/homepage', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '정보') {
                        router.push({
                            pathname: '/FarmInfo/farminfo', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                        // 필요시 다른 탭도 추가
                    }
                    else if (tab === '장터') {
                        router.push({
                            pathname: '/Market/market', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                    else if (tab === '내 농장') {
                        router.push({
                            pathname: '/Map/Map', params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                introduction: route.params?.introduction
                            }
                        });
                    }
                }
                }
            />
        </View>
    );
};

export default Market;