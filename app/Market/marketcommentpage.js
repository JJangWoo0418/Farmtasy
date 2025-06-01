import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styles from '../Components/Css/Market/marketcommentpagestyle';
import API_CONFIG from '../DB/api';
import { useLocalSearchParams, router } from 'expo-router';

const dummyComments = [
    {
        id: 1,
        user: '충북음성 이준호',
        isAuthor: true,
        profile: require('../../assets/usericon.png'),
        content: '고맙게가 써봄! ㅎㅎ',
        time: '05월 01일 00:40',
        parentId: null,
        replies: [
            {
                id: 2,
                user: '충북음성 이준호',
                isAuthor: true,
                profile: require('../../assets/usericon.png'),
                content: '감사감사 ^^',
                time: '05월 01일 00:40',
                parentId: 1,
                replies: []
            }
        ]
    },
    {
        id: 3,
        user: '충북음성 이준호2',
        isAuthor: false,
        profile: require('../../assets/usericon.png'),
        content: 'ㅎㅎㅎ',
        time: '05월 01일 00:40',
        parentId: null,
        replies: []
    }
];

function buildCommentTree(comments) {
    if (!Array.isArray(comments)) return [];
    const map = {};
    const roots = [];
    comments.forEach(comment => {
        if (!comment || !comment.id) return; // 방어 코드
        map[comment.id] = { ...comment, children: [] };
    });
    comments.forEach(comment => {
        if (!comment || !comment.id) return; // 방어 코드
        if (comment.parentId != null && map[comment.parentId]) {
            map[comment.parentId].children.push(map[comment.id]);
        } else {
            roots.push(map[comment.id]);
        }
    });
    return roots.filter(Boolean);
}

function countAllComments(comments) {
    let count = 0;
    function countRecursive(list) {
        list.forEach(comment => {
            if (!comment) return;
            count += 1;
            if (comment.children && comment.children.length > 0) {
                countRecursive(comment.children);
            }
        });
    }
    countRecursive(comments);
    return count;
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hour}:${min}`;
}

const MarketCommentPage = ({ navigation }) => {
    // marketId, userPhone은 props 또는 파라미터로 전달받음
    const { marketId, phone, ownerPhone } = useLocalSearchParams();
    console.log('marketId:', marketId);
    console.log('phone:', phone);

    const [comments, setComments] = useState([]);
    const [input, setInput] = useState('');
    const [isReplyInputVisible, setIsReplyInputVisible] = useState(false);
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [replyToName, setReplyToName] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
    const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글 ID
    const [editingCommentContent, setEditingCommentContent] = useState(''); // 수정 중인 댓글 내용

    // 댓글 수정 함수
    const handleEditComment = async () => {
        if (!editingCommentContent.trim()) {
            Alert.alert('알림', '내용을 입력해주세요.');
            return;
        }
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/comment/${editingCommentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    market_comment_content: editingCommentContent
                })
            });

            if (response.ok) {
                // 댓글 목록 새로고침
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/market/comment?market_id=${marketId}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.comments)) {
                    setComments(data.comments);
                }

                // 수정 모드 종료
                setIsEditing(false);
                setEditingCommentId(null);
                setEditingCommentContent('');

                // 수정 완료 알림
                Alert.alert(
                    "수정 완료",
                    "댓글이 수정되었습니다.",
                    [{ text: "확인" }],
                    { cancelable: true }
                );
            }
        } catch (error) {
            Alert.alert('오류', '댓글 수정에 실패했습니다.');
        }
    };

    // 수정 시작 함수
    const startEditing = (comment) => {
        setIsEditing(true);
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.comment_content);
    };

    // 수정 취소 함수
    const cancelEditing = () => {
        setIsEditing(false);
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    // 댓글 목록 불러오기
    useEffect(() => {
        if (!marketId) return;
        fetch(`${API_CONFIG.BASE_URL}/api/market/comment?market_id=${marketId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.comments)) setComments(data.comments);
                else setComments([]);
            });
    }, [marketId]);

    // 트리 구조 변환
    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
    const totalComments = useMemo(() => countAllComments(commentTree), [commentTree]);

    const onReplyPress = (comment) => {
        setIsReplyInputVisible(true);
        setReplyToCommentId(comment.id);
        setReplyToName(comment.user || comment.phone);
    };

    // 댓글/답글 등록
    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/market/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    market_comment_content: input,
                    market_id: marketId,
                    phone: phone,
                    market_comment_parent_id: isReplyInputVisible ? replyToCommentId : null
                })
            });
            setInput('');

            // **댓글 목록 즉시 새로고침**
            fetch(`${API_CONFIG.BASE_URL}/api/market/comment?market_id=${marketId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.comments)) setComments(data.comments);
                    else setComments([]);
                });
        } catch (e) {
            // 에러 처리
        }
    };

    // 댓글/답글 렌더링 (재귀)
    const renderComments = useCallback((comments, depth = 0) => {
        return comments.filter(Boolean).map(comment => (
            <View key={comment.id} style={[styles.commentContainer, depth > 0 && { marginLeft: 25 * depth, marginTop: 10, paddingLeft: 8, marginBottom: -20 }]}>
                <View style={styles.commentHeader}>
                    <Image
                        source={comment.profile ? { uri: comment.profile } : require('../../assets/usericon.png')}
                        style={styles.profileImg}
                    />
                    <View style={{ flex: 1, position: 'relative' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.username}>
                                [{comment.region || '지역 미설정'}] {comment.user || comment.phone}
                            </Text>
                            {String(comment.phone) === String(ownerPhone) && (
                                <View style={styles.authorBadge}>
                                    <Text style={styles.authorBadgeText}>작성자</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.commentInfo}>
                            {comment.introduction} · {formatDate(comment.time)}
                        </Text>
                        <TouchableOpacity
                            style={depth > 0 ? styles.replyMoreBtn : styles.commentMoreBtn}
                            onPress={() => {
                                // 현재 로그인한 유저가 댓글 작성자인 경우
                                if (String(comment.phone) === String(phone)) {
                                    Alert.alert(
                                        "댓글 관리",
                                        "댓글을 관리하시겠습니까?",
                                        [
                                            {
                                                text: "수정",
                                                onPress: () => startEditing(comment)
                                            },
                                            {
                                                text: "삭제",
                                                style: "destructive",
                                                onPress: async () => {
                                                    Alert.alert(
                                                        "댓글 삭제",
                                                        "정말로 이 댓글을 삭제하시겠습니까?",
                                                        [
                                                            {
                                                                text: "취소",
                                                                style: "cancel"
                                                            },
                                                            {
                                                                text: "삭제",
                                                                style: "destructive",
                                                                onPress: async () => {
                                                                    try {
                                                                        const response = await fetch(`${API_CONFIG.BASE_URL}/api/market/comment/${comment.id}`, {
                                                                            method: 'DELETE',
                                                                        });

                                                                        if (response.ok) {
                                                                            // 댓글 목록 새로고침
                                                                            const res = await fetch(`${API_CONFIG.BASE_URL}/api/market/comment?market_id=${marketId}`);
                                                                            const data = await res.json();
                                                                            if (data.success && Array.isArray(data.comments)) {
                                                                                setComments(data.comments);
                                                                            }

                                                                            // 삭제 완료 알림
                                                                            Alert.alert(
                                                                                "삭제 완료",
                                                                                "댓글이 삭제되었습니다.",
                                                                                [{ text: "확인" }],
                                                                                { cancelable: true }
                                                                            );
                                                                        }
                                                                    } catch (error) {
                                                                        Alert.alert('오류', '댓글 삭제에 실패했습니다.');
                                                                    }
                                                                }
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
                                } else {
                                    // 다른 유저의 댓글인 경우 신고 기능
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
                                }
                            }}
                        >
                            <Image
                                source={require('../../assets/moreicon.png')}
                                style={{ width: 20, height: 20, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.content}>{comment.comment_content}</Text>
                {depth === 0 && (
                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            style={styles.replyBtn}
                            onPress={() => {
                                setIsReplyInputVisible(true);
                                setReplyToCommentId(comment.id);
                                setReplyToName(comment.user || comment.phone);
                            }}
                        >
                            <Image source={require('../../assets/commenticon.png')} style={styles.replyIcon} />
                            <Text style={styles.replyText}>답글쓰기</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
            </View>
        ));
    }, []);

    useEffect(() => {
        console.log('[프론트] comments 상태:', comments);
    }, [comments]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.title}>상품 문의</Text>
                </View>
                {/* 문의 개수 */}
                <SafeAreaView style={styles.container}>
                    <Text style={styles.countText}>문의 {totalComments}개</Text>
                    <ScrollView contentContainerStyle={styles.list}>
                        {renderComments(commentTree)}
                    </ScrollView>
                </SafeAreaView>
                {/* 하단 입력창/안내 UI */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
                    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                        {isReplyInputVisible && (
                            <View style={styles.replyPill}>
                                <Text style={styles.replyPillText}>
                                    {replyToName ? `${replyToName} 에게 답글작성` : '답글 작성'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsReplyInputVisible(false);
                                        setReplyToName(null);
                                        setReplyToCommentId(null);
                                    }}
                                >
                                    <Text style={styles.replyPillCancel}>취소</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {isEditing && (
                            <View style={styles.replyPill}>
                                <Text style={styles.replyPillText}>
                                    댓글 수정
                                </Text>
                                <TouchableOpacity
                                    onPress={cancelEditing}
                                >
                                    <Text style={styles.replyPillCancel}>취소</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.input}
                                placeholder={isEditing ? "댓글을 수정해주세요" : "문의 내용을 입력해 주세요"}
                                placeholderTextColor="#999"
                                value={isEditing ? editingCommentContent : input}
                                onChangeText={isEditing ? setEditingCommentContent : setInput}
                            />
                            <TouchableOpacity
                                style={styles.sendBtn}
                                onPress={isEditing ? handleEditComment : handleSend}
                            >
                                <Image
                                    source={isEditing ? require('../../assets/arrowrighticon.png') : require('../../assets/arrowrighticon.png')}
                                    style={styles.sendIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default MarketCommentPage;