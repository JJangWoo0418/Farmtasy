import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import styles from '../../Components/Css/Homepage/profilepagestyle';
import { useNavigation, useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import API_CONFIG from '../../DB/api';

const ProfilePage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [showAll, setShowAll] = useState(false);
    const [userData, setUserData] = useState(null);
    const [introduction, setIntroduction] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [postCount, setPostCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        if (route.params?.phone) {
            fetchUserData();
            fetchUserStats();
        }
    }, [route.params?.phone]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/user?phone=${route.params?.phone}`);
            const data = await response.json();
            setUserData(data);
            setIntroduction(data.introduction || '한 줄 프로필이 아직 없습니다');
            setAboutMe(data.about_me || '내 소개가 아직 없습니다');
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/user/stats?phone=${route.params?.phone}`);
            const data = await response.json();
            setPostCount(data.post_count || 0);
            setCommentCount(data.comment_count || 0);
            setLikeCount(data.like_count || 0);
        } catch (error) {
            console.error('사용자 통계 조회 실패:', error);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* 상단 바 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>프로필</Text>
            </View>

            {/* 프로필 정보 */}
            <View style={styles.profileSection}>
                <Image 
                    source={userData?.profile_image ? { uri: userData.profile_image } : require('../../../assets/usericon.png')} 
                    style={styles.profileImg} 
                />
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>[{userData?.region || '지역 미설정'}] {userData?.name || '이름 없음'}</Text>
                    <Text style={styles.profileLevel}>{userData?.introduction || '소개 미설정'}</Text>
                </View>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/profilesettingpage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
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
                    {aboutMe}
                </Text>
                {aboutMe.split('\n').length > 3 && (
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
                        <Text style={styles.activityValue}>{postCount > 0 ? `${postCount}회` : '-'}</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                        <Text style={styles.activityLabel}>댓글 작성</Text>
                        <Text style={styles.activityValueActive}>{commentCount > 0 ? `${commentCount}회` : '-'}</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                        <Text style={styles.activityLabel}>받은 좋아요</Text>
                        <Text style={styles.activityValue}>{likeCount > 0 ? `${likeCount}회` : '-'}</Text>
                    </View>
                </View>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 게시글 활동 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>게시글 활동</Text>
                <TouchableOpacity style={styles.sectionRow} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/bookmarkspage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
                            }
                        });
                    }}>
                    <Image source={require('../../../assets/bookmarkicon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>저장한 글</Text>
                    <Image source={require('../../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/collectionwritingpage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
                            }
                        });
                    }}>
                    <Image source={require('../../../assets/paperpencil2.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>작성한 글</Text>
                    <Image source={require('../../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/commentwritingpage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
                            }
                        });
                    }}>
                    <Image source={require('../../../assets/commenticon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>작성한 댓글</Text>
                    <Image source={require('../../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>

            {/* 장터 활동 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>장터 활동</Text>
                <TouchableOpacity style={styles.sectionRow} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/marketinterestpage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
                            }
                        });
                    }}>
                    <Image source={require('../../../assets/hearticon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>관심 상품</Text>
                    <Image source={require('../../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionRow} onPress={() => {
                        router.push({
                            pathname: 'Homepage/Profile/productssalepage',
                            params: {
                                userData: userData,
                                phone: route.params?.phone,
                                name: userData?.name,
                                region: userData?.region,
                                profile_image: userData?.profile_image,
                                about_me: userData?.about_me,
                                introduction: userData?.introduction,
                            }
                        });
                    }}>
                    <Image source={require('../../../assets/coinicon.png')} style={styles.sectionIcon} />
                    <Text style={styles.sectionText}>판매 중 상품</Text>
                    <Image source={require('../../../assets/arrowrighticon2.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ProfilePage;
