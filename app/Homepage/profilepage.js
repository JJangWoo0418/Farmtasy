import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import styles from '../Components/Css/Homepage/profilepagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';

const ProfilePage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [showAll, setShowAll] = useState(false);
    const introduction = `40여년 조선소 근무후\n퇴직하여 조그만 한 텃밭\n장만 하여 소일거리 하며\n먹거리 채소는 조금씩 가꾸고 있는 올해 12년차 ^^`;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* 상단 바 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>프로필</Text>
            </View>

            {/* 프로필 정보 */}
            <View style={styles.profileSection}>
                <Image source={require('../../assets/usericon.png')} style={styles.profileImg} />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>[충남 아산] 홍길동</Text>
                    <Text style={styles.profileLevel}>저는 초보자예요</Text>
                </View>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                        console.log('프로필 수정 이동 params:', {
                            userData: route.params?.userData,
                            phone: route.params?.phone,
                            name: route.params?.name,
                            region: route.params?.region,
                            profile_image: route.params?.profile_image,
                            about_me: route.params?.about_me,
                            introduction: route.params?.introduction,
                        });
                        router.push({
                            pathname: 'Homepage/profilesettingpage',
                            params: {
                                userData: route.params?.userData,
                                phone: route.params?.phone,
                                name: route.params?.name,
                                region: route.params?.region,
                                profile_image: route.params?.profile_image,
                                about_me: route.params?.about_me,
                                introduction: route.params?.introduction,
                            }
                        });
                    }}
                >
                    <Text style={styles.editBtnText}>프로필 수정</Text>
                </TouchableOpacity>
            </View>

            {/* 내 소개 UI */}
            <View style={styles.introCard}>
                <Text style={styles.activityTitle}>내 소개</Text>
                <Text style={styles.introText} numberOfLines={showAll ? undefined : 3}>
                    {introduction}
                </Text>
                {introduction.split('\n').length > 3 && (
                    <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                        <Text style={styles.introMore}>{showAll ? '닫기' : '더보기'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 활동 */}
            <View style={styles.activitySection}>
                <Text style={styles.activityTitle}>활동</Text>
                <View style={styles.activityBox}>
                    <View style={styles.activityItem}>
                        <Text style={styles.activityLabel}>게시글 작성</Text>
                        <Text style={styles.activityValue}>-</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                        <Text style={styles.activityLabel}>댓글 작성</Text>
                        <Text style={styles.activityValueActive}>1회</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                        <Text style={styles.activityLabel}>받은 좋아요</Text>
                        <Text style={styles.activityValue}>-</Text>
                    </View>
                </View>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 게시글 활동 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>게시글 활동</Text>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/bookmarkicon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>저장한 글</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/paperpencil2.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>작성한 글</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/commenticon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>작성한 댓글</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>

            {/* 장터 활동 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>장터 활동</Text>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/hearticon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>관심 상품</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/coinicon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>판매 중 상품</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/bagicon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>구매 내역</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>

            {/* 내 농장 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>내 농장</Text>
                <TouchableOpacity style={styles.sectionRow}>
                    <Image source={require('../../assets/mapicon3.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>내 농장 지역</Text>
                    <Image source={require('../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>

            
        </ScrollView>
    );
};

export default ProfilePage;
