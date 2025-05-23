import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Market/marketstyle';
import BottomTabNavigator from '../Navigator/BottomTabNavigator';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

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

const Marketbuy = () => {
    const [isFolded, setIsFolded] = useState(false);
    const navigation = useNavigation();
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [isWriteToggleVisible, setWriteToggleVisible] = useState(false);
    const route = useRoute();
    const { userData, phone, name, region } = useLocalSearchParams();
    const [isFreeShippingFiltered, setIsFreeShippingFiltered] = useState(false);
    const [isSortOptionsVisible, setIsSortOptionsVisible] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState('최신순');
    const { category: selectedCategory } = useLocalSearchParams();

    // 장바구니 로컬 상태 추가
    const [cartItems, setCartItems] = useState([]);
    const [isCartVisible, setIsCartVisible] = useState(false);

    // 데모 판매 글 데이터
    const demoProducts = [
        {
            id: 1,
            image: require('../../assets/blueberryicon.png'),
            title: '중고하우스파이프 31.8mm 25.4mm',
            price: '99,999원',
            location: '경기',
            size: '31.8mm 25.4mm',
            isFreeShipping: false,
            category: '농자재',
        },
        {
            id: 2,
            image: require('../../assets/blueberryicon.png'),
            title: '땅콩씨앗 30g',
            price: '5,000원',
            location: '강원',
            size: '30g',
            isFreeShipping: true,
            category: '종자/모종',
        },
         {
            id: 3,
            image: require('../../assets/blueberryicon.png'),
            title: '고품질 상토 50L',
            price: '25,000원',
            location: '경북',
            size: '50L',
            isFreeShipping: false,
            category: '비료/상토',
        }
    ];

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

    // 로컬 removeFromCart 함수 구현
    const removeFromCart = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
    };

     // 로컬 getTotalPrice 함수 구현
     const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price.replace(/[^\d]/g, '')) * item.quantity), 0);
    };

    // 선택된 정렬 옵션에 따라 상품 목록 정렬
    const sortedProducts = useMemo(() => {
        let productsToSort = [...demoProducts];

        if (selectedCategory) {
            productsToSort = productsToSort.filter(product => product.category === selectedCategory);
        }

        if (isFreeShippingFiltered) {
            productsToSort = productsToSort.filter(product => product.isFreeShipping);
        }

        switch (selectedSortOption) {
            case '최신순':
                // 데모 데이터의 초기 순서 또는 id 기준으로 정렬 (필요시 수정)
                productsToSort.sort((a, b) => a.id - b.id);
                break;
            case '낮은 가격순':
                productsToSort.sort((a, b) => {
                    const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
                    const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
                    return priceA - priceB;
                });
                break;
            case '높은 가격순':
                productsToSort.sort((a, b) => {
                    const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
                    const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
                    return priceB - priceA;
                });
                break;
            case '추천순':
                // 추천 로직 구현 (현재는 최신순과 동일)
                productsToSort.sort((a, b) => a.id - b.id);
                break;
            default:
                break;
        }

        return productsToSort;
    }, [demoProducts, selectedCategory, isFreeShippingFiltered, selectedSortOption]);

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
                    />
                </View>

                <TouchableOpacity style={styles.bellIconWrapper}>
                    <Image source={require('../../assets/bellicon.png')} />
                </TouchableOpacity>
            </View>

            {/* 카테고리 + 접기/펼치기 버튼 */}
            {!isFolded && (
                <>
                    <View style={styles.categoryWrap}>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.categoryItem}
                                onPress={() => {
                                    router.push({
                                        pathname: "/Market/marketbuy",
                                        params: {
                                            category: cat.label,
                                            userData: route.params?.userData,
                                            name: route.params?.name,
                                            phone: route.params?.phone,
                                            region: route.params?.region
                                        }
                                    });
                                }}
                            >
                                <Image source={cat.icon} style={styles.categoryIcon} />
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
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
                <TouchableOpacity style={styles.latestSortContainer} onPress={() => setIsSortOptionsVisible(true)}>
                    <Text style={styles.latestSortText}>{selectedSortOption}</Text>
                    <FontAwesome name="chevron-down" size={12} color="#555" style={styles.dropdownIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.freeShippingContainer} onPress={() => setIsFreeShippingFiltered(prev => !prev)}>
                    {/* 체크박스는 스타일로 원형 테두리만 표시 */}
                    <View style={styles.checkbox}>
                        {isFreeShippingFiltered && <FontAwesome name="check" size={14} color="#555" />}
                    </View>
                    <Text style={styles.checkboxText}>무료배송 모아보기</Text>
                </TouchableOpacity>
            </View>

            {/* 판매 글 목록 */}
            <ScrollView style={styles.productListContainer}>
                {sortedProducts.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                        <Image source={product.image} style={styles.productImg} />
                        <View style={styles.productInfo}>
                            <Text style={styles.productTitle}>{product.title}</Text>
                            <Text style={styles.price}>{product.price}</Text>
                            <View style={styles.productDetails}>
                                <Text style={styles.productLocation}>{product.location}</Text>
                                <Text style={styles.productSize}>{product.size}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart(product)}>
                            <Text style={styles.cartBtnText}>장바구니 담기</Text>
                        </TouchableOpacity>
                    </View>
                ))}
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
                                pathname: "/Market/Marketupload",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                                pathname: "/Homepage/Post/writingpage",
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
                        {[ '최신순', '추천순', '낮은 가격순', '높은 가격순' ].map(option => (
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
                        <Text style={styles.writeButtonText}>글쓰기  </Text>
                        <Image
                            source={require('../../assets/paperpencil.png')}
                            style={styles.paperpencilIcon}
                        />
                    </View>
                )}
            </TouchableOpacity>

            {/* 장바구니 모달/뷰 다시 추가 */}
            {isCartVisible && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setIsCartVisible(false)}
                    style={styles.overlay}
                >
                    <View style={styles.cartModalContainer}>
                        <View style={styles.cartModalHeader}>
                            <Text style={styles.cartModalTitle}>장바구니</Text>
                            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                                <FontAwesome name="times" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {cartItems.map((item, index) => (
                                <View key={index} style={styles.cartItem}>
                                    <Image source={item.image} style={styles.cartItemImage} />
                                    <View style={styles.cartItemInfo}>
                                        <Text style={styles.cartItemTitle}>{item.title}</Text>
                                        <Text style={styles.cartItemPrice}>{item.price}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeItemButton}>
                                        <FontAwesome name="times-circle" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        {/* 총 가격 표시 */}
                        {cartItems.length > 0 && (
                            <View style={styles.cartTotal}>
                                <Text style={styles.cartTotalText}>총 품목: {cartItems.length}개</Text>
                                <Text style={styles.cartTotalText}>총 가격: {getTotalPrice().toLocaleString()}원</Text>
                            </View>
                        )}
                        {/* 결제하기 버튼 */}
                        {cartItems.length > 0 && (
                            <TouchableOpacity style={styles.checkoutButton} onPress={() => console.log('결제하기 버튼 클릭됨!')}>
                                <Text style={styles.checkoutButtonText}>결제하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            )}

            {/* 장바구니 버튼 다시 추가 */}
            <TouchableOpacity
                style={styles.cartButton}
                onPress={() => setIsCartVisible(true)}
            >
                <FontAwesome name="shopping-cart" size={24} color="white" />
                {cartItems.length > 0 && (
                    <View style={styles.cartItemCountContainer}>
                        <Text style={styles.cartItemCountText}>{cartItems.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <BottomTabNavigator
                currentTab="장터"
                onTabPress={(tab) => {
                    if (tab === '질문하기') {
                        router.push({ pathname: '/Chatbot/questionpage', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    } else if (tab === '홈') {
                        router.push({ pathname: '/Homepage/Home/homepage', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                    else if (tab === '정보') {
                        router.push({ pathname: '/FarmInfo/farminfo', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                        // 필요시 다른 탭도 추가
                    }
                    else if (tab === '장터') {
                        router.push({ pathname: '/Market/market', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                    else if (tab === '내 농장') {
                        router.push({ pathname: '/Map/Map', params: {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            introduction: route.params?.introduction
                        } });
                    }
                }
                }
            />
        </View>
    );
};

export default Marketbuy;