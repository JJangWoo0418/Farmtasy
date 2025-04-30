import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../Components/Css/Homepage/postdetailpagestyle'; // 스타일 파일 import
import API_CONFIG from '../DB/api';

const PostDetailPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { post, introduction, phone, name, region, profile } = route.params || {}; // postpage.js에서 전달받을 게시글 데이터
    const [isLiked, setIsLiked] = useState(false); // 공감 상태 추가
    const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태 추가
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bookmarkScaleAnim = useRef(new Animated.Value(1)).current;
    const commentAnimations = useRef({}).current;
    const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);
    const commentInputAnim = useRef(new Animated.Value(0)).current;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const modalAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [comments, setComments] = useState([]); // 서버에서 불러온 댓글로 초기화
    const [commentInput, setCommentInput] = useState(''); // 일반 댓글 입력값
    const [replyInput, setReplyInput] = useState(''); // 대댓글 입력값
    const [isReplyInputVisible, setIsReplyInputVisible] = useState(false); // 대댓글 입력창 표시 여부
    const [replyToCommentId, setReplyToCommentId] = useState(null); // 대댓글 대상 댓글 id

    // 임시 댓글 데이터
    const [commentSort, setCommentSort] = useState('인기순'); // 댓글 정렬 상태

    // 날짜 포맷 함수 추가
    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${month}월 ${day}일 ${hour}:${min}`;
    };

    // 댓글 목록 불러오기
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}`);
                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            } catch (e) {
                setComments([]); // 에러 시 빈 배열
            }
        };
        if (post?.id) fetchComments();
    }, [post?.id]);

    // 댓글 작성
    const handleSendComment = async () => {
        if (!commentInput.trim()) return;
        await fetch(`${API_CONFIG.BASE_URL}/api/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comment_content: commentInput,
                post_id: post.id,
                phone,
                name,
                region,
                profile,
                introduction,
                comment_parent_id: null
            })
        });
        setCommentInput('');
        // 댓글 목록 새로고침
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
    };

    // 대댓글(답글) 작성
    const handleSendReply = async () => {
        if (!replyInput.trim()) return;
        const payload = {
            comment_content: replyInput,
            post_id: post.id,
            phone,
            name,
            region,
            profile,
            introduction,
            comment_parent_id: replyToCommentId
        };
        console.log('대댓글 전송 데이터:', payload);
        await fetch(`${API_CONFIG.BASE_URL}/api/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        setReplyInput('');
        setIsReplyInputVisible(false);
        setReplyToCommentId(null);
        // 댓글 목록 새로고침
        const res = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}`);
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
    };

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
        }).start(() => {
            if (!isCommentInputVisible && scrollViewRef.current) {
                // 댓글 입력창이 열릴 때 스크롤을 아래로 밀기
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        });
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

    console.log('comments:', comments);

    // 댓글 트리 구조로 변환 함수
    function buildCommentTree(comments) {
        const map = {};
        const roots = [];
        comments.forEach(comment => {
            map[comment.id] = { ...comment, children: [] };
        });
        comments.forEach(comment => {
            if (comment.comment_parent_id != null) {
                map[comment.comment_parent_id]?.children.push(map[comment.id]);
            } else {
                roots.push(map[comment.id]);
            }
        });
        return roots;
    }

    // 대댓글(답글) 컴포넌트 분리
    function ReplyComment({ comment, depth, children, post, handleCommentLike, setIsReplyInputVisible, setReplyToCommentId, commentAnimations }) {
        return (
            <View
                style={[
                    styles.commentContainer,
                    { marginLeft: 25 * depth, marginTop: 10, paddingLeft: 8, marginBottom: -20 }
                ]}
            >
                <View style={styles.commentHeader}>
                    <Image source={comment.profile ? { uri: comment.profile } : require('../../assets/usericon.png')} style={styles.commentProfileImg} />
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.commentUsername}>{comment.user}</Text>
                            {comment.phone === post.phone && (
                                <View style={styles.authorBadge}>
                                    <Text style={styles.authorBadgeText}>작성자</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.commentInfo}>{comment.introduction || '소개 미설정'} · {formatDate(comment.time)}</Text>
                    </View>
                    <TouchableOpacity style={styles.commentMoreBtn2} onPress={() => {
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
                        <Image source={require('../../assets/moreicon.png')} style={styles.commentMoreBtn2} />
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
                    <TouchableOpacity style={styles.commentLikeButton} onPress={() => {
                        setIsReplyInputVisible(true);
                        setReplyToCommentId(comment.id);
                    }}>
                        <Image source={require('../../assets/commenticon.png')} style={styles.commentAnswerIcon} />
                        <Text style={styles.replyText}>답글쓰기</Text>
                    </TouchableOpacity>
                </View>
                {/* 자식 대댓글 재귀 렌더링 */}
                {children}
            </View>
        );
    }

    // 댓글 트리 재귀 렌더링 함수
    function renderComments(comments, depth = 0) {
        return comments.map(comment =>
            depth > 0 ? (
                <ReplyComment
                    key={comment.id}
                    comment={comment}
                    depth={depth}
                    post={post}
                    handleCommentLike={handleCommentLike}
                    setIsReplyInputVisible={setIsReplyInputVisible}
                    setReplyToCommentId={setReplyToCommentId}
                    commentAnimations={commentAnimations}
                >
                    {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
                </ReplyComment>
            ) : (
                <View key={comment.id} style={styles.commentContainer}>
                    {/* 일반 댓글 UI */}
                    <View style={styles.commentHeader}>
                        <Image source={comment.profile ? { uri: comment.profile } : require('../../assets/usericon.png')} style={styles.commentProfileImg} />
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.commentUsername}>{comment.user}</Text>
                                {comment.phone === post.phone && (
                                    <View style={styles.authorBadge}>
                                        <Text style={styles.authorBadgeText}>작성자</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.commentInfo}>{comment.introduction || '소개 미설정'} · {formatDate(comment.time)}</Text>
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
                            <Image source={require('../../assets/moreicon.png')} style={styles.commentMoreBtn} />
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
                        <TouchableOpacity style={styles.commentLikeButton} onPress={() => {
                            setIsReplyInputVisible(true);
                            setReplyToCommentId(comment.id);
                        }}>
                            <Image source={require('../../assets/commenticon.png')} style={styles.commentAnswerIcon} />
                            <Text style={styles.replyText}>답글쓰기</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 자식 대댓글 재귀 렌더링 */}
                    {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
                </View>
            )
        );
    }

    // 댓글 트리 구조로 변환
    const commentTree = buildCommentTree(comments);

    // 총 댓글 수 계산 함수
    const calculateTotalComments = (comments) => {
        let total = 0;
        const countComments = (commentList) => {
            commentList.forEach(comment => {
                total++;
                if (comment.children && comment.children.length > 0) {
                    countComments(comment.children);
                }
            });
        };
        countComments(comments);
        return total;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
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
                    <ScrollView 
                        ref={scrollViewRef}
                        style={styles.scrollView} 
                        contentContainerStyle={{ paddingBottom: isCommentInputVisible ? 60 : 0 }}
                    >
                        {/* 게시글 내용 */}
                        <View style={styles.postContainer}>
                            <View style={styles.postHeader}>
                                <Image 
                                    source={post.profile ? { uri: post.profile } : require('../../assets/usericon.png')} 
                                    style={styles.profileImg} 
                                />
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.username}>[{post.region || '지역 미설정'}] {post.user}</Text>
                                    <Text style={styles.userInfo}>{post.introduction || '소개 미설정'} · {formatDate(post.time)}</Text>
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
                                    <Image source={require('../../assets/moreicon.png')} style={styles.moreBtn} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.postText}>{post.text}</Text>
                            {post.image_urls && post.image_urls.flat().length > 0 && (
                                <View style={styles.postImages}>
                                    {post.image_urls.flat().map((url, idx) => (
                                        <Image 
                                            key={url + idx} 
                                            source={{ uri: url }} 
                                            style={styles.postImage} 
                                            resizeMode="cover" 
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* 좋아요 / 댓글 수 */}
                        <View style={styles.statsRow}>
                            <View style={styles.statsItem}>
                                <Image 
                                    source={isLiked ? require('../../assets/heartgreenicon.png') : require('../../assets/hearticon.png')} 
                                    style={[styles.statsIcon, { width: 22, height: 22, resizeMode: 'contain' }]} 
                                />
                                <Text style={styles.statsText}>{post.likes}</Text>
                            </View>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsText2}>댓글 </Text>
                                <Text style={styles.statsText}>{calculateTotalComments(commentTree)}</Text>
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
                        {renderComments(commentTree)}
                    </ScrollView>
                </SafeAreaView>
                {/* 댓글 입력 섹션 */}
                <Animated.View style={[styles.commentInputSection, { transform: [{ translateY: commentInputAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>                
                    <TextInput
                        style={styles.commentInput}
                        placeholder="댓글을 입력해 주세요"
                        placeholderTextColor="#999"
                        value={commentInput}
                        onChangeText={setCommentInput}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
                        <Image source={require('../../assets/arrowrighticon.png')} style={styles.icon} />
                    </TouchableOpacity>
                </Animated.View>

                {/* 대댓글 입력 섹션 */}
                {isReplyInputVisible && (
                    <Animated.View style={[styles.commentInputSection, { bottom: 0 }]}>                
                        <TextInput
                            style={styles.commentInput}
                            placeholder="답글을 입력해 주세요"
                            placeholderTextColor="#999"
                            value={replyInput}
                            onChangeText={setReplyInput}
                            autoFocus
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendReply}>
                            <Image source={require('../../assets/arrowrighticon.png')} style={styles.icon} />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="none"
                onRequestClose={toggleModal}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={toggleModal}
                >
                    <Animated.View 
                        style={[
                            styles.modalContainer, 
                            { 
                                transform: [{ 
                                    translateY: modalAnim.interpolate({ 
                                        inputRange: [0, 1], 
                                        outputRange: [300, 0] 
                                    }) 
                                }] 
                            }
                        ]}
                    > 
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>사진 올리기 선택</Text>
                                <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal}>
                                    <Text style={styles.modalCloseText}>✕</Text>
                                </TouchableOpacity>
                            </View> 
                            <ScrollView>
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
                            </ScrollView>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default PostDetailPage;
