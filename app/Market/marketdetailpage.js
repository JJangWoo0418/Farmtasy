import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../Components/Css/Market/marketdetailpagestyle';

const product = {
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
    return (
        <View style={styles.container}>
            {/* 상단 네비게이션 */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <FontAwesome name="chevron-left" size={22} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>장터</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.headerIconBtn}>
                        <FontAwesome name="share-alt" size={20} color="#222" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconBtn}>
                        <FontAwesome name="ellipsis-v" size={20} color="#222" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* 프로필 */}
                <View style={styles.profileRow}>
                    <Image source={product.profileImg} style={styles.profileImg} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileRegion}>{product.region} <Text style={styles.profileName}>{product.name}</Text></Text>
                        <Text style={styles.profileTime}>고양이가 제일 좋아요 · {product.time}</Text>
                    </View>
                </View>

                {/* 상품명, 가격 */}
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.price}>{product.price.toLocaleString()}원</Text>

                {/* 상세 설명 */}
                <Text style={styles.content}>{product.content}</Text>

                {/* 상품 이미지들 */}
                {product.images.map((img, idx) => (
                    <Image key={idx} source={img} style={styles.productImg} />
                ))}
            </ScrollView>

            {/* 하단 고정 버튼 */}
            <View style={styles.bottomBar}>
                <View style={styles.inquiryBox}>
                    <FontAwesome name="heart-o" size={22} color="#222" />
                    <Text style={styles.inquiryText}>상품 문의 {product.inquiryCount}개</Text>
                </View>
                <TouchableOpacity style={styles.inquiryBtn}>
                    <Text style={styles.inquiryBtnText}>문의하기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callBtn}>
                    <Text style={styles.callBtnText}>전화하기</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.noticeText}>
                판매자가 등록한 상품의 홍보/상담/거래와 관련된 의무 및 책임 등은 모두 판매자에게 있습니다.
            </Text>
        </View>
    );
};

export default MarketDetailPage;