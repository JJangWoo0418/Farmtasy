import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert, TextInput, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Homepage/postdetailpagestyle'; // 스타일 파일 import

const PostDetailPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { post } = route.params || {}; // postpage.js에서 전달받을 게시글 데이터
    const [isLiked, setIsLiked] = useState(false); // 공감 상태 추가
    const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태 추가
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bookmarkScaleAnim = useRef(new Animated.Value(1)).current;
    const commentAnimations = useRef({}).current;
    const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);
    const commentInputAnim = useRef(new Animated.Value(0)).current;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const modalAnim = useRef(new Animated.Value(0)).current;

    // 임시 댓글 데이터
    const [comments, setComments] = useState([
        { id: 'c1', user: '충북음성 이준호', profile: require('../../assets/leejunho.png'), time: '10분 전', text: '감사감사 ^^', likes: 1, isAuthor: true, isLiked: false },
        { id: 'c2', user: '충북음성 이준호2', profile: require('../../assets/leejunho.png'), time: '12분 전', text: 'ㅎㅎㅎ', likes: 1, isAuthor: false, isLiked: true },
        // Add more comments as needed
    ]);
    const [commentSort, setCommentSort] = useState('인기순'); // 댓글 정렬 상태

    if (!post) {
        // 데이터가 없는 경우 처리 (예: 로딩 표시 또는 에러 메시지)
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../assets/gobackicon.png')} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>게시글 로딩 중...</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.errorText}>게시글 정보를 불러오는데 실패했습니다.</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // 댓글 좋아요 토글 함수
    const handleCommentLike = (commentId) => {
        setComments(prevComments =>
            prevComments.map(comment =>
                comment.id === commentId
                    ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
                    : comment
            )
        );

        if (!commentAnimations[commentId]) {
            commentAnimations[commentId] = new Animated.Value(1);
        }

        Animated.sequence([
            Animated.timing(commentAnimations[commentId], {
                toValue: 1.5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(commentAnimations[commentId], {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        
        // 터지는 듯한 애니메이션
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        
        // 북마크 애니메이션
        Animated.sequence([
            Animated.timing(bookmarkScaleAnim, {
                toValue: 1.5,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(bookmarkScaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const toggleCommentInput = () => {
        setIsCommentInputVisible(!isCommentInputVisible);
        Animated.timing(commentInputAnim, {
            toValue: isCommentInputVisible ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const toggleModal = () => {
        if (isModalVisible) {
            // 모달이 열려있을 때는 애니메이션을 먼저 실행하고 상태를 변경
            Animated.timing(modalAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setIsModalVisible(false);
            });
        } else {
            // 모달이 닫혀있을 때는 상태를 먼저 변경하고 애니메이션 실행
            setIsModalVisible(true);
            Animated.timing(modalAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                {/* 고정된 헤더 */}
                <View style={styles.header}>
                    <View style={{ width: 30 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../assets/gobackicon.png')} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>자유주제</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* 스크롤 가능한 내용 */}
                <ScrollView style={styles.scrollView}>
                    {/* 게시글 내용 */}
                    <View style={styles.postContainer}>
                        <View style={styles.postHeader}>
                            <Image source={post.profile} style={styles.profileImg} />
                            <View style={styles.userInfoContainer}>
                                <Text style={styles.username}>{post.user}</Text>
                                <Text style={styles.userInfo}>고양이가 제일 좋아요 · {post.time}</Text>
                            </View>
                            <TouchableOpacity style={styles.moreBtn} onPress={() => {
                                Alert.alert(
                                    "신고하기",
                                    "무엇을 신고하시겠습니까?",
                                    [
                                        { text: "게시글 신고하기", onPress: () => console.log("게시글 신고하기") },
                                        { text: "유저 신고하기", onPress: () => console.log("유저 신고하기") },
                                        { text: "취소", style: "cancel" }
                                    ],
                                    { cancelable: true }
                                );
                            }}>
                                <Image source={require('../../assets/moreicon.png')} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.postText}>{post.text}</Text>
                        {post.image && <Image source={post.image} style={styles.postImage} resizeMode="cover" />}
                    </View>

                    {/* 좋아요 / 댓글 수 */}
                    <View style={styles.statsRow}>
                        <View style={styles.statsItem}>
                            <Image 
                                source={require('../../assets/heartgreenicon.png')} 
                                style={[styles.statsIcon, { width: 22, height: 22, resizeMode: 'contain' }]} 
                            />
                            <Text style={styles.statsText}>{post.likes}</Text>
                        </View>
                        <View style={styles.statsItem}>
                            <Image 
                                source={require('../../assets/commenticon.png')} 
                                style={[styles.statsIconComment, { resizeMode: 'contain' }]} 
                            />
                            <Text style={styles.statsText}>{post.comments}</Text>
                        </View>
                    </View>

                    {/* 공감 / 댓글 / 저장 버튼 */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleLike}
                        >
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <Image 
                                    source={isLiked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')} 
                                    style={styles.actionIcon} 
                                />
                            </Animated.View>
                            <Text style={styles.actionText}>좋아요</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={toggleCommentInput}>
                            <Image source={require('../../assets/commenticon.png')} style={styles.actionIcon} />
                            <Text style={styles.actionText}>댓글</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={handleBookmark}
                        >
                            <Animated.View style={{ transform: [{ scale: bookmarkScaleAnim }] }}>
                                <Image 
                                    source={isBookmarked ? require('../../assets/bookmarkgreenicon.png') : require('../../assets/bookmarkicon.png')} 
                                    style={styles.actionIcon} 
                                />
                            </Animated.View>
                            <Text style={styles.actionText}>저장</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 댓글 섹션 */}
                    <View style={styles.commentSectionHeader}>
                        <View style={styles.commentSortRow}>
                            {['인기순', '등록순', '최신순'].map(sortType => (
                                <TouchableOpacity key={sortType} style={styles.commentSortButton} onPress={() => setCommentSort(sortType)}>
                                    <View style={[styles.sortDot, commentSort === sortType && styles.activeSortDot]} />
                                    <Text style={[styles.sortText, commentSort === sortType && styles.activeSortText]}>{sortType}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 댓글 목록 */}
                    {comments.map(comment => (
                        <View key={comment.id} style={[styles.commentContainer, comment.user === '충북음성 이준호2' ? { marginLeft: 35 } : null]}>
                            <View style={styles.commentHeader}>
                                <Image source={comment.profile} style={styles.commentProfileImg} />
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.commentUsername}>{comment.user}</Text>
                                        {comment.isAuthor && (
                                            <View style={styles.authorBadge}>
                                                <Text style={styles.authorBadgeText}>작성자</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.commentInfo}>고양이가 제일 좋아요 · {comment.time}</Text>
                                </View>
                                <TouchableOpacity style={styles.commentMoreBtn} onPress={() => {
                                    Alert.alert(
                                        "신고하기",
                                        "유저를 신고하시겠습니까?",
                                        [
                                            { text: "유저 신고하기", onPress: () => console.log("유저 신고하기") },
                                            { text: "취소", style: "cancel" }
                                        ],
                                        { cancelable: true }
                                    );
                                }}>
                                    <Image source={require('../../assets/moreicon.png')} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.commentText}>{comment.text}</Text>
                            <View style={styles.commentActions}>
                                <TouchableOpacity style={styles.commentLikeButton} onPress={() => handleCommentLike(comment.id)}>
                                    <Animated.View style={{ transform: [{ scale: commentAnimations[comment.id] || new Animated.Value(1) }] }}>
                                        <Image
                                            source={comment.isLiked ? require('../../assets/heartgrayicon.png') : require('../../assets/hearticon.png')}
                                            style={[styles.commentLikeIcon, comment.isLiked && styles.commentLikedIcon]} />
                                    </Animated.View>
                                    <Text style={styles.commentLikeText}>{comment.likes}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>

            {/* 댓글 입력 섹션 */}
            <Animated.View style={[styles.commentInputSection, { transform: [{ translateY: commentInputAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
                <TouchableOpacity style={styles.cameraButton} onPress={toggleModal}>
                    <Image source={require('../../assets/cameraicon.png')} style={styles.icon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.commentInput}
                    placeholder="댓글을 입력해 주세요"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Image source={require('../../assets/arrowrighticon.png')} style={styles.icon} />
                </TouchableOpacity>
            </Animated.View>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="none"
                onRequestClose={toggleModal}
            >
                <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }] }]}> 
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>사진 올리기 선택</Text>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                        </View> 
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => console.log('사진 촬영')}>
                                <Image source={require('../../assets/cameraicon2.png')} style={styles.modalIcon} />
                                <Text style={styles.modalButtonText}>사진 촬영</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => console.log('앨범 선택')}>
                                <Image source={require('../../assets/galleryicon.png')} style={styles.modalIcon} />
                                <Text style={styles.modalButtonText}>앨범 선택</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </Modal>
        </View>
    );
};

export default PostDetailPage;
