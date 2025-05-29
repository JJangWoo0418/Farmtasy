import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Animated, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../Components/Css/Homepage/marketinterestpagestyle';
import API_CONFIG from '../../DB/api';
import { router } from 'expo-router';

const ProductssalePage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const phone = route.params?.phone;
    const [selectedTab, setSelectedTab] = useState('판매중');  // 추가
    const TAB_LIST = ['판매중', '예약중', '거래완료'];  // 추가

    // 애니메이션 관련 상태 추가
    const tabAnimation = useRef(new Animated.Value(0)).current;
    const tabWidth = useRef(0);

    // 탭 변경 시 애니메이션 실행
    const handleTabPress = (tab) => {
        setSelectedTab(tab);
        Animated.spring(tabAnimation, {
            toValue: TAB_LIST.indexOf(tab),
            useNativeDriver: true,
            tension: 50,
            friction: 7
        }).start();
    };

    const handleDelete = async (marketId) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/${marketId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone })
            });
            
            const data = await response.json();
            
            if (data.success) {
                Alert.alert('알림', '상품이 삭제되었습니다.');
                // 목록 새로고침
                fetchInterestedProducts();
            } else {
                Alert.alert('오류', '상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            Alert.alert('오류', '상품 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleStatusChange = async (newStatus, marketId) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/${marketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    market_status: newStatus,
                    phone: phone 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 상태 변경 성공 시 목록 새로고침
                fetchInterestedProducts();
                Alert.alert('알림', '상태가 변경되었습니다.');
            } else {
                Alert.alert('오류', '상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 변경 실패:', error);
            Alert.alert('오류', '상태 변경 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        if (phone) {
            fetchInterestedProducts();
        }
    }, [phone]);

    const fetchInterestedProducts = async () => {
        try {
            // 선택된 탭에 따라 상태 필터링
            const statusMap = {
                '판매중': '판매중',
                '예약중': '예약중',
                '거래완료': '거래완료'
            };
    
            // API 호출 시 상태 파라미터 추가
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/sales?phone=${phone}&status=${statusMap[selectedTab]}`);
            const data = await response.json();
    
            if (!data.success) {
                console.log('상품 목록을 가져오는데 실패했습니다.');
                return;
            }
    
            setItems(data.items);
        } catch (error) {
            console.error('상품을 가져오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // selectedTab이 변경될 때마다 목록 새로고침
    useEffect(() => {
        if (phone) {
            fetchInterestedProducts();
        }
    }, [phone, selectedTab]);  // selectedTab 의존성 추가

    const ProductItem = ({ item }) => {
        const [imageLoading, setImageLoading] = useState(true);
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

        return (
            <TouchableOpacity
            style={styles.productCard}
            onPress={() => {
                Alert.alert(
                    "상품 관리",
                    "원하는 작업을 선택하세요",
                    [
                        {
                            text: "게시글 보기",
                            onPress: () => {
                                router.push({
                                    pathname: '/Market/marketdetailpage',
                                    params: { 
                                        productId: item.market_id,
                                        phone: phone
                                    }
                                });
                            }
                        },
                        {
                            text: "수정하기",
                            onPress: () => {
                                router.push({
                                    pathname: '/Market/marketeditpage',
                                    params: { 
                                        productId: item.market_id,
                                        phone: phone
                                    }
                                });
                            }
                        },
                        {
                            text: "판매중으로 변경",
                            onPress: () => handleStatusChange('판매중', item.market_id)
                        },
                        {
                            text: "예약중으로 변경",
                            onPress: () => handleStatusChange('예약중', item.market_id)
                        },
                        {
                            text: "거래완료로 변경",
                            onPress: () => handleStatusChange('거래완료', item.market_id)
                        },
                        {
                            text: "삭제하기",
                            onPress: () => {
                                Alert.alert(
                                    "상품 삭제",
                                    "정말로 이 상품을 삭제하시겠습니까?",
                                    [
                                        {
                                            text: "취소",
                                            style: "cancel"
                                        },
                                        {
                                            text: "삭제",
                                            style: "destructive",
                                            onPress: () => handleDelete(item.market_id)
                                        }
                                    ]
                                );
                            }
                        },
                        {
                            text: "취소",
                            style: "cancel"
                        }
                    ]
                );
            }}
        >
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                {imageLoading && (
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
                    source={imageUrl ? { uri: imageUrl } : require('../../../assets/cameraicon3.png')}
                    style={styles.productImg}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                />
            </View>
            <Text style={styles.productTitle}>{item.market_name}</Text>
            <Text style={styles.price}>{Number(item.market_price).toLocaleString()}원</Text>
            <View style={styles.productDetails}>
                <Text style={styles.productLocation}>{item.market_category}</Text>
            </View>
        </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle2}>판매 중 상품</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 정렬 탭 추가 */}
            {/* 정렬 탭 수정 */}
            <View style={styles.tabContainer}>
                <View style={styles.tabWrapper}>
                    {TAB_LIST.map((tab, index) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                selectedTab === tab && styles.selectedTab
                            ]}
                            onPress={() => handleTabPress(tab)}
                            onLayout={(event) => {
                                if (index === 0) {
                                    tabWidth.current = event.nativeEvent.layout.width;
                                }
                            }}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === tab && styles.selectedTabText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            {
                                transform: [{
                                    translateX: tabAnimation.interpolate({
                                        inputRange: [0, 1, 2],
                                        outputRange: [0, tabWidth.current, tabWidth.current * 2]
                                    })
                                }]
                            }
                        ]}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>로딩중...</Text>
                </View>
            ) : items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>등록된 관심 상품이 없습니다.</Text>
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.market_id.toString()}
                    renderItem={({ item }) => <ProductItem item={item} />}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper2}
                    contentContainerStyle={[
                        styles.productListContainer,
                        items.length === 1 && { justifyContent: 'flex-start' }
                    ]}
                />
            )}
        </View>
    );
};

export default ProductssalePage;