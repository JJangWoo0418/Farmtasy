import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../Components/Css/Homepage/marketinterestpagestyle';
import API_CONFIG from '../../DB/api';
import { router } from 'expo-router';

const MarketInterestPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const phone = route.params?.phone;

    useEffect(() => {
        if (phone) {
            fetchInterestedProducts();
        }
    }, [phone]);

    const fetchInterestedProducts = async () => {
        try {
            // 관심 상품 목록 가져오기 (이미 모든 정보가 포함됨)
            const likesResponse = await fetch(`${API_CONFIG.BASE_URL}/api/market/likes?phone=${phone}`);
            const likesData = await likesResponse.json();

            if (!likesData.success) {
                console.log('관심 상품 목록을 가져오는데 실패했습니다.');
                return;
            }

            setItems(likesData.likes);
        } catch (error) {
            console.error('관심 상품을 가져오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    };

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
                    router.push({
                        pathname: '/Market/marketdetailpage',
                        params: { 
                            productId: item.market_id,  // marketId -> productId로 변경
                            phone: phone
                        }
                    });
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
                <View style={styles.likeContainer}>
                    <Image source={require('../../../assets/heartgreenicon.png')} style={styles.heartgreenIcon} />
                    <Text style={styles.likeCount}>{item.market_like || 0}</Text>
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
                <Text style={styles.headerTitle}>관심 상품</Text>
                <View style={{ width: 24 }} />
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
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={[
                        styles.productListContainer,
                        items.length === 1 && { justifyContent: 'flex-start' }  // 하나일 때는 왼쪽 정렬
                    ]}
                />
            )}
        </View>
    );
};

export default MarketInterestPage;