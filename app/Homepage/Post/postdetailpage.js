import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, Animated, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../Components/Css/Homepage/postdetailpagestyle'; // 스타일 파일 import
import API_CONFIG from '../../DB/api';

const PostDetailPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { post, introduction, phone, name, region, profile } = route.params || {}; // postpage.js에서 전달받을 게시글 데이터
    const [isLiked, setIsLiked] = useState(post.is_liked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);
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
    const [replyToName, setReplyToName] = useState(null); // 대댓글 대상 유저 이름

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
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}&user_phone=${phone}`);
                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            } catch (e) {
                setComments([]); // 에러 시 빈 배열
            }
        };
        if (post?.id && phone) {
            fetchComments();
        }
    }, [post?.id, phone]);

    // 댓글 트리 구조로 변환 함수를 useMemo로 최적화
    const commentTree = useMemo(() => {
        // 일반 댓글만 필터링
        const parentComments = comments.filter(comment => !comment.comment_parent_id);
        const childComments = comments.filter(comment => comment.comment_parent_id);

        // 일반 댓글의 좋아요 수와 대댓글 좋아요 수를 합산하는 함수
        const calculateTotalLikes = (parentComment) => {
            let totalLikes = parentComment.likes || 0;
            // 해당 댓글의 대댓글들의 좋아요 수 합산
            const childLikes = childComments
                .filter(child => child.comment_parent_id === parentComment.id)
                .reduce((sum, child) => sum + (child.likes || 0), 0);
            return totalLikes + childLikes;
        };

        // 일반 댓글 정렬
        const sortedParentComments = [...parentComments].sort((a, b) => {
            switch (commentSort) {
                case '인기순':
                    const aTotalLikes = calculateTotalLikes(a);
                    const bTotalLikes = calculateTotalLikes(b);
                    return bTotalLikes - aTotalLikes;
                case '등록순':
                    return new Date(a.time) - new Date(b.time);
                case '최신순':
                    return new Date(b.time) - new Date(a.time);
                default:
                    const defaultATotalLikes = calculateTotalLikes(a);
                    const defaultBTotalLikes = calculateTotalLikes(b);
                    return defaultBTotalLikes - defaultATotalLikes;
            }
        });

        // 대댓글은 시간순 정렬
        const sortedChildComments = [...childComments].sort((a, b) =>
            new Date(a.time) - new Date(b.time)
        );

        // 정렬된 댓글들을 합치기
        const sortedComments = [...sortedParentComments, ...sortedChildComments];
        return buildCommentTree(sortedComments);
    }, [comments, commentSort]);

    // 댓글 작성 함수를 useCallback으로 최적화
    const handleSendComment = useCallback(async () => {
        if (!commentInput.trim()) return;
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/comment`, {
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
                    comment_parent_id: isReplyInputVisible && replyToCommentId ? replyToCommentId : null
                })
            });

            if (!response.ok) {
                throw new Error('댓글 작성 실패');
            }

            setCommentInput('');
            // 답글 모드 해제는 하지 않음!

            // 댓글 목록 새로고침
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}&user_phone=${phone}`);
            const data = await res.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            Alert.alert('오류', '댓글 작성에 실패했습니다.');
        }
    }, [commentInput, post.id, phone, name, region, profile, introduction, isReplyInputVisible, replyToCommentId]);

    // 대댓글 작성 함수를 useCallback으로 최적화
    const handleSendReply = useCallback(async () => {
        if (!replyInput.trim()) return;
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment_content: replyInput,
                    post_id: post.id,
                    phone,
                    name,
                    region,
                    profile,
                    introduction,
                    comment_parent_id: replyToCommentId
                })
            });

            if (!response.ok) {
                throw new Error('대댓글 작성 실패');
            }

            setReplyInput('');
            setIsReplyInputVisible(false);
            setReplyToCommentId(null);
            // 댓글 목록 새로고침
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}&user_phone=${phone}`);
            const data = await res.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            Alert.alert('오류', '대댓글 작성에 실패했습니다.');
        }
    }, [replyInput, post.id, phone, name, region, profile, introduction, replyToCommentId]);

    // 댓글 좋아요 함수를 useCallback으로 최적화
    const handleCommentLike = useCallback(async (commentId) => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/comment/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commentId,
                    like: !comments.find(c => c.id === commentId)?.isLiked,
                    phone
                }),
            });

            if (!response.ok) {
                throw new Error('댓글 좋아요 처리 실패');
            }

            // 댓글 목록 새로고침
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/comment?post_id=${post.id}&user_phone=${phone}`);
            const data = await res.json();
            setComments(Array.isArray(data) ? data : []);

            // 애니메이션
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
        } catch (error) {
        }
    }, [comments, post.id, phone]);

    // 좋아요 처리 함수
    const handleLike = async () => {
        // 애니메이션
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.5,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post/post_like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    like: !isLiked,
                    phone
                }),
            });

            if (!response.ok) {
                throw new Error('좋아요 처리 실패');
            }

            // 좋아요 상태와 카운트 업데이트
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
        }
    };

    const handleBookmark = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/post/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    phone,
                    bookmark: !isBookmarked
                })
            });

            if (!response.ok) {
                throw new Error('북마크 처리 실패');
            }

            const data = await response.json();
            if (data.success) {
                setIsBookmarked(data.is_bookmarked);

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
            }
        } catch (error) {
            // 에러 발생 시에도 알림 없이 조용히 처리
        }
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

    // 대댓글 컴포넌트를 useMemo로 최적화
    const ReplyCommentComponent = useMemo(() => {
        return function ReplyComment({ comment, depth, children, post, handleCommentLike, setIsReplyInputVisible, setReplyToCommentId, commentAnimations }) {
            return (
                <View
                    style={[
                        styles.commentContainer,
                        { marginLeft: 25 * depth, marginTop: 10, paddingLeft: 8, marginBottom: -20 }
                    ]}
                >
                    <View style={styles.commentHeader}>
                        <Image source={comment.profile ? { uri: comment.profile } : require('../../../assets/usericon.png')} style={styles.commentProfileImg} />
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.commentUsername}>[{comment.region || '지역 미설정'}] {comment.user}</Text>
                                {String(comment.phone) === String(post.phone) && (
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
                            <Image source={require('../../../assets/moreicon.png')} style={styles.commentMoreBtn2} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{comment.comment_content}</Text>
                    <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.commentLikeButton} onPress={() => handleCommentLike(comment.id)}>
                            <Animated.View style={{ transform: [{ scale: commentAnimations[comment.id] || new Animated.Value(1) }] }}>
                                <Image
                                    source={comment.isLiked ? require('../../../assets/heartgrayicon.png') : require('../../../assets/hearticon.png')}
                                    style={[styles.commentLikeIcon, comment.isLiked && styles.commentLikedIcon]} />
                            </Animated.View>
                            <Text style={styles.commentLikeText}>{comment.likes}</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 자식 대댓글 재귀 렌더링 */}
                    {children}
                </View>
            );
        };
    }, []);

    // 댓글 렌더링 함수를 useCallback으로 최적화
    const renderComments = useCallback((comments, depth = 0) => {
        return comments.map(comment => {
            return depth > 0 ? (
                <ReplyCommentComponent
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
                </ReplyCommentComponent>
            ) : (
                <View key={comment.id} style={styles.commentContainer}>
                    {/* 일반 댓글 UI */}
                    <View style={styles.commentHeader}>
                        <Image source={comment.profile ? { uri: comment.profile } : require('../../../assets/usericon.png')} style={styles.commentProfileImg} />
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.commentUsername}>[{comment.region || '지역 미설정'}] {comment.user}</Text>
                                {String(comment.phone) === String(post.phone) && (
                                    <View style={styles.authorBadge}>
                                        <Text style={styles.authorBadgeText}>작성자</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.commentInfo}>{comment.introduction || '소개 미설정'} · {formatDate(comment.time)}</Text>
                        </View>
                        <TouchableOpacity style={styles.commentMoreBtn} onPress={() => {
                            Alert.alert(
                                "댓글 신고",
                                "이 댓글을 신고하시겠습니까?",
                                [
                                    {
                                        text: "아니요",
                                        style: "cancel"
                                    },
                                    {
                                        text: "예",
                                        onPress: () => {
                                            Alert.alert(
                                                "신고 완료",
                                                "댓글이 신고되었습니다.",
                                                [{ text: "확인" }],
                                                { cancelable: true }
                                            );
                                        }
                                    }
                                ]
                            );
                        }}>
                            <Image source={require('../../../assets/moreicon.png')} style={styles.commentMoreBtn} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.commentText}>{comment.comment_content}</Text>
                    <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.commentLikeButton} onPress={() => handleCommentLike(comment.id)}>
                            <Animated.View style={{ transform: [{ scale: commentAnimations[comment.id] || new Animated.Value(1) }] }}>
                                <Image
                                    source={comment.isLiked ? require('../../../assets/heartgrayicon.png') : require('../../../assets/hearticon.png')}
                                    style={[styles.commentLikeIcon, comment.isLiked && styles.commentLikedIcon]} />
                            </Animated.View>
                            <Text style={styles.commentLikeText}>{comment.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentLikeButton} onPress={() => {
                            setIsReplyInputVisible(true);
                            setReplyToCommentId(comment.id);
                            setReplyToName(comment.user);
                        }}>
                            <Image source={require('../../../assets/commenticon.png')} style={styles.commentAnswerIcon} />
                            <Text style={styles.replyText}>답글쓰기</Text>
                        </TouchableOpacity>
                    </View>
                    {/* 자식 대댓글 재귀 렌더링 */}
                    {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
                </View>
            )
        });
    }, [post, handleCommentLike, setIsReplyInputVisible, setReplyToCommentId, commentAnimations]);

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

    useEffect(() => {
        setIsBookmarked(post.is_bookmarked);
    }, [post.is_bookmarked]);

    if (!post) {
        // 데이터가 없는 경우 처리 (예: 로딩 표시 또는 에러 메시지)
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
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



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <View style={{ flex: 1 }}>
                <SafeAreaView style={styles.container}>
                    {/* 고정된 헤더 */}
                    <View style={styles.header}>
                        <View style={{ width: 30 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Image source={require('../../../assets/gobackicon.png')} style={styles.backIcon} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.headerTitle}>{post.category || '자유주제'}</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    {/* 스크롤 가능한 내용 */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: isCommentInputVisible ? 60 : isReplyInputVisible ? 100 : 80 }}
                    >
                        {/* 게시글 내용 */}
                        <View style={styles.postContainer}>
                            <View style={styles.postHeader}>
                                <Image
                                    source={post.profile_image ? { uri: post.profile_image } : require('../../../assets/usericon.png')}
                                    style={styles.profileImg}
                                />
                                <View style={styles.userInfoContainer}>
                                    <Text style={styles.username}>[{post.region || '지역 미설정'}] {post.user}</Text>
                                    <Text style={styles.userInfo}>{post.introduction || '소개 미설정'} · {formatDate(post.time)}</Text>
                                </View>
                                <TouchableOpacity style={styles.moreBtn} onPress={() => {
                                    Alert.alert(
                                        "게시글 신고",
                                        "이 게시글을 신고하시겠습니까?",
                                        [
                                            {
                                                text: "아니요",
                                                style: "cancel"
                                            },
                                            {
                                                text: "예",
                                                onPress: () => {
                                                    Alert.alert(
                                                        "신고 완료",
                                                        "게시글이 신고되었습니다.",
                                                        [{ text: "확인" }],
                                                        { cancelable: true }
                                                    );
                                                }
                                            }
                                        ]
                                    );
                                }}>
                                    <Image source={require('../../../assets/moreicon.png')} style={styles.moreBtn} />
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
                                    source={require('../../../assets/heartgreenicon.png')}
                                    style={[styles.statsIcon, { width: 22, height: 22, resizeMode: 'contain' }]}
                                />
                                <Text style={styles.statsText}>{likeCount}</Text>
                            </View>
                            <View style={styles.statsItem}>
                                <Text style={styles.statsText2}>댓글 </Text>
                                <Text style={styles.statsText}>{calculateTotalComments(commentTree)}</Text>
                            </View>
                        </View>

                        {/* 공감 / 댓글 / 저장 버튼 */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                    <Image
                                        source={isLiked ? require('../../../assets/heartgreenicon.png') : require('../../../assets/hearticon.png')}
                                        style={styles.actionIcon}
                                    />
                                </Animated.View>
                                <Text style={styles.actionText}>좋아요</Text>
                            </TouchableOpacity>
                            <View style={{
                                width: 1,
                                height: 24,
                                backgroundColor: '#eee',
                                marginHorizontal: 12,
                            }} />
                            <TouchableOpacity
                                style={styles.actionButton2}
                                onPress={handleBookmark}
                            >
                                <Animated.View style={{ transform: [{ scale: bookmarkScaleAnim }] }}>
                                    <Image
                                        source={isBookmarked ? require('../../../assets/bookmarkgreenicon.png') : require('../../../assets/bookmarkicon.png')}
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
                {/* absolute 입력창/안내 UI */}
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                    {isReplyInputVisible && (
                        <View style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 59, // 입력창 높이만큼 위로
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#f5f6fa',
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            marginHorizontal: 0,
                            marginBottom: 2,
                            zIndex: 2,
                        }}>
                            <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>
                                {replyToName ? `${replyToName} 에게 답글작성` : '답글 작성'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsReplyInputVisible(false);
                                    setReplyToName(null);
                                    setReplyToCommentId(null);
                                }}
                            >
                                <Text style={{ color: '#22CC6B', fontWeight: 'bold', fontSize: 15 }}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.commentInputSection}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="댓글을 입력해 주세요"
                            placeholderTextColor="#999"
                            value={commentInput}
                            onChangeText={setCommentInput}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendComment}>
                            <Image source={require('../../../assets/arrowrighticon.png')} style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default PostDetailPage;
