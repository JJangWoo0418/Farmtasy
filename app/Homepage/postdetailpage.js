import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Homepage/postdetailpagestyle'; // 스타일 파일 import

const PostDetailPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { post } = route.params || {}; // postpage.js에서 전달받을 게시글 데이터
    const [isLiked, setIsLiked] = useState(false); // 공감 상태 추가
    const scaleAnim = useRef(new Animated.Value(1)).current;

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
                        <Text>게시글 정보를 불러오는데 실패했습니다.</Text>
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

    return (
        <SafeAreaView style={styles.container}>
            {/* 고정된 헤더 */}
            <View style={styles.header}>
                <View style={{ width: 30 }}> {/* 뒤로가기 버튼의 너비와 동일하게 설정 */}
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../assets/gobackicon.png')} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>자유주제</Text>
                <View style={{ width: 30 }} /> {/* 오른쪽에도 동일한 너비의 빈 공간 추가 */}
            </View>

            {/* 스크롤 가능한 내용 */}
            <ScrollView style={styles.scrollView}>
                {/* 게시글 내용 */}
                <View style={styles.postContainer}>
                    <View style={styles.postHeader}>
                        <Image source={post.profile} style={styles.profileImg} />
                        <View>
                            <Text style={styles.username}>{post.user}</Text>
                            <Text style={styles.userInfo}>고양이가 제일 좋아요 · {post.time}</Text>
                        </View>
                        <TouchableOpacity style={styles.moreBtn}>
                            <Image source={require('../../assets/moreicon.png')} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.postText}>{post.text}</Text>
                    {post.image && <Image source={post.image} style={styles.postImage} resizeMode="cover" />}
                </View>

                {/* 좋아요 / 댓글 수 */}
                <View style={styles.statsRow}>
                    <View style={styles.statsItem}>
                        <Image source={require('../../assets/heartgreenicon.png')} style={styles.statsIcon} />
                        <Text style={styles.statsText}>{post.likes}</Text>
                    </View>
                    <View style={styles.statsItem}>
                        <Image source={require('../../assets/commenticon2.png')} style={styles.statsIconComment} />
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
                        <Text style={styles.actionText}>공감</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Image source={require('../../assets/commenticon2.png')} style={styles.actionIcon} />
                        <Text style={styles.actionText}>댓글</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Image source={require('../../assets/bookmarkgreenicon.png')} style={styles.actionIcon} />
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
                    <View key={comment.id} style={styles.commentContainer}>
                        <View style={styles.commentHeader}>
                            <Image source={comment.profile} style={styles.commentProfileImg} />
                            <Text style={styles.commentUsername}>{comment.user}</Text>
                            <Text style={styles.commentInfo}>· {comment.time}</Text>
                            {comment.isAuthor && (
                                <View style={styles.authorBadge}>
                                    <Text style={styles.authorBadgeText}>작성자</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.commentMoreBtn}>
                                <Image source={require('../../assets/moreicon.png')} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.commentText}>{comment.text}</Text>
                        <View style={styles.commentActions}>
                            <TouchableOpacity style={styles.commentLikeButton} onPress={() => handleCommentLike(comment.id)}>
                                <Image
                                    source={comment.isLiked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')}
                                    style={[styles.commentLikeIcon, comment.isLiked && styles.commentLikedIcon]} />
                                <Text style={styles.commentLikeText}>{comment.likes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentReplyButton}>
                                <Image source={require('../../assets/commenticon2.png')} style={styles.commentReplyIcon} />
                                <Text style={styles.commentReplyText}>답글쓰기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PostDetailPage;
