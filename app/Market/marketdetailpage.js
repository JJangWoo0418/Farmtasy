import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Platform, Share, Linking, Animated, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../Components/Css/Market/marketdetailpagestyle';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import API_CONFIG from '../DB/api';

const product = {
    id: '12345', // 판매글 고유 ID 공유 기능을 위한 것.
    region: '충북음성',
    name: '이준호',
    profileImg: require('../../assets/usericon.png'),
    time: '1시간 전',
    title: '로타리장착 국제기시동경운기 판매',
    price: 1000000,
    content: `1.판매물품 : 로타리장착 국제기시동경운기 판매합니다.
2.판매지역 및 직거래 : 충남 금산군 추부면. 금산로2816-11
3.생산년도 : 모름년식 판매
4.판매가격 : 100만원
5.전화번호 : 010-7922-7114
6.기타사항기록 : 로타리장착 경운기 입니다.
상차작업비 별도입니다.
국제 기시동 경운기입니다.
실사용시동잘됨, 상태 매우좋습니다.
7.참조 : 빠른 답을 원하신다면, 전화나 문자가 빠릅니다.
화물, 택배 착불 입니다.
가격절충 안됩니다. 반품 × 환불 ×
카드(부가세별도)결제가능.
경운기 조금정리한다고 수리안된거 사셔서
고생하지 마시고 2의 새거처럼 완벽하게
수리된거 사셔서 마음편히 쓰세요.
6개월 A/S 해드립니다.
더많은농기계를 보고싶으시다면
네이버에서 도윤농기계 검색하세요.`,
    images: [
        require('../../assets/장터 샘플 이미지2.png'),
        require('../../assets/장터 샘플 이미지3.jpg'),
    ],
    inquiryCount: 0,
};

const MarketDetailPage = () => {
    const navigation = useNavigation();
    const [showFullContent, setShowFullContent] = useState(false);
    const TRUNCATE_LENGTH = 300;
    const INITIAL_IMAGE_COUNT = 1;

    const params = useLocalSearchParams();
    const productId = params.productId;

    const [product, setProduct] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const heartScale = useRef(new Animated.Value(1)).current;

    const handleMorePress = () => {
        Alert.alert(
            '신고하기',
            '신고 항목을 선택하세요.',
            [
                { text: '작성자 신고', onPress: () => Alert.alert('알림', '작성자 신고가 접수되었습니다.') },
                { text: '게시글 신고', onPress: () => Alert.alert('알림', '게시글 신고가 접수되었습니다.') },
                { text: '취소', style: 'cancel' }
            ]
        );
    };

    const handleHeartPress = () => {
        // 애니메이션
        Animated.sequence([
            Animated.timing(heartScale, {
                toValue: 1.3,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(heartScale, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();

        setIsLiked(prev => !prev);
        // 서버에 좋아요 상태 저장/삭제 요청이 필요하다면 여기에 추가
    };

    const handleShare = async () => {
        try {
            // 판매글 링크 생성 (실제 서비스의 도메인으로 변경 필요)
            const productUrl = `https://farmtasy.com/market/${product.id}`;

            const shareMessage = `${product.title}\n\n${productUrl}`;

            await Share.share({
                message: shareMessage,
                title: product.title,
                url: productUrl // iOS에서 사용
            });
        } catch (error) {
            console.log('공유하기 에러:', error);
        }
    };

    useEffect(() => {
        if (!productId) return;
        const fetchProductDetail = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/${productId}`);
                const data = await response.json();
                setProduct(data);
            } catch (e) {
                Alert.alert('에러', '상품 정보를 불러오지 못했습니다.');
            }
        };
        fetchProductDetail();
    }, [productId]);

    // ... (handleMorePress, handleHeartPress, handleShare 등 기존 코드)

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>상품 정보를 불러오는 중입니다...</Text>
            </View>
        );
    }

    // 이미지 배열 파싱 (DB에서 문자열로 올 수도 있음)
    let images = [];
    try {
        if (Array.isArray(product.market_image_url)) {
            images = product.market_image_url;
        } else if (typeof product.market_image_url === 'string') {
            images = JSON.parse(product.market_image_url);
        }
    } catch (e) {
        images = [];
    }

    return (
        <View style={styles.container}>
            {/* 상단 네비게이션 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={require('../../assets/gobackicon.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>장터</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare}>
                        <Image source={require('../../assets/shareicon.png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconBtn} onPress={handleMorePress}>
                        <Image source={require('../../assets/moreicon.png')} style={{ width: 22, height: 22, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 70 }}>
                {/* 상품명, 가격 */}
                <Text style={styles.title}>{product.market_name}</Text>
                <Text style={styles.price}>{Number(product.market_price).toLocaleString()}원</Text>

                {/* 상세 설명 */}
                <Text style={styles.content}>
                    {showFullContent || !product.market_content || product.market_content.length <= TRUNCATE_LENGTH
                        ? product.market_content
                        : `${product.market_content.substring(0, TRUNCATE_LENGTH)}...`}
                </Text>

                {/* 상품 이미지들 */}
                {images.slice(0, showFullContent ? images.length : INITIAL_IMAGE_COUNT).map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.productImg} />
                ))}

                {/* 더보기/접기 버튼 */}
                {(product.market_content && product.market_content.length > TRUNCATE_LENGTH) && (
                    <TouchableOpacity onPress={() => setShowFullContent(!showFullContent)} style={styles.viewMoreButton}>
                        <Text style={styles.viewMoreButtonText}>
                            {showFullContent ? '상품 설명 접기' : '상품 설명 더보기'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* 판매자 책임 고지 문구 (스크롤되도록 ScrollView 안으로 이동) */}
                <Text style={styles.noticeText}>
                    판매자가 등록한 상품의 홍보/상담/거래와 관련된 의무 및 책임 등은 모두 판매자에게 있습니다.
                </Text>

                {/* 상품 문의 개수 및 작은 문의하기 버튼 섹션 (스크롤 영역 안) */}
                <View style={styles.inquiryBox}>
                    {/* 여기서 하트 아이콘 제거 */}
                    {/* <FontAwesome name="heart-o" size={22} color="#222" /> */}
                    {/* 상품 문의 개수 텍스트 */}
                    <Text style={styles.inquiryCountText}>상품 문의 {product.inquiryCount}개</Text>
                    {/* 문의하기 버튼 */}
                    <TouchableOpacity style={styles.inquiryDetailBtn}>
                        <Text style={styles.inquiryDetailBtnText}>문의하기</Text>
                        <Image source={require('../../assets/arrowrighticon2.png')} style={{ width: 12, height: 12, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* 하단 고정 버튼 - 하트 아이콘과 주문하기 버튼 포함 */}
            <View style={styles.bottomBar}>
                {/* 하단 고정 바에 하트 버튼 추가 */}
                <TouchableOpacity style={styles.heartBox} onPress={handleHeartPress}>
                    <Animated.Image
                        source={isLiked
                            ? require('../../assets/heartgreenicon.png') // 채워진 하트
                            : require('../../assets/hearticon.png')      // 빈 하트
                        }
                        style={[
                            { width: 22, height: 22, resizeMode: 'contain' },
                            { transform: [{ scale: heartScale }] }
                        ]}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderBtn}>
                    <Text style={styles.orderBtnText}>전화하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderBtn2}>
                    <Text style={styles.orderBtnText2}>문자하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MarketDetailPage;