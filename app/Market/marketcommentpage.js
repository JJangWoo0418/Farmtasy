import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import styles from '../Components/Css/Market/marketcommentpagestyle';
import API_CONFIG from '../DB/api';
import { useLocalSearchParams } from 'expo-router';

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
    const map = {};
    const roots = [];
    comments.forEach(comment => {
        map[comment.id] = { ...comment, children: [] };
    });
    comments.forEach(comment => {
        if (comment.parentId != null) {
            map[comment.parentId]?.children.push(map[comment.id]);
        } else {
            roots.push(map[comment.id]);
        }
    });
    return roots;
}

const MarketCommentPage = ({ navigation }) => {
    // 플랫 구조로 관리 (DB 연동 시에도 유리)
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState('');
    const [isReplyInputVisible, setIsReplyInputVisible] = useState(false);
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [replyToName, setReplyToName] = useState(null);

    // 트리 구조 변환
    const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
    const { marketId } = useLocalSearchParams();

    // API 호출 후
    useEffect(() => {
        fetch(`${API_CONFIG.BASE_URL}/api/market/comment?market_id=${marketId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setComments(data);
                else setComments([]);
            });
    }, [marketId]);

    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            await fetch(`${API_CONFIG.BASE_URL}/api/market/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    market_comment_content: input,
                    market_id: marketId, // ← 상품 id
                    phone: userPhone,    // ← 유저 phone
                    market_comment_parent_id: isReplyInputVisible ? replyToCommentId : null
                })
            });
            setInput('');
            // 댓글 목록 새로고침 등
        } catch (e) {
            // 에러 처리
        }
    };

    // 댓글/답글 렌더링 (재귀)
    const renderComments = useCallback((comments, depth = 0) => {
        return comments.map(comment => (
            <View key={comment.id} style={[styles.commentContainer, depth > 0 && { marginLeft: 25 * depth, marginTop: 10, paddingLeft: 8, marginBottom: -20 }]}>
                <View style={styles.commentHeader}>
                    <Image source={comment.profile} style={styles.profileImg} />
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.username}>{comment.user}</Text>
                            {comment.isAuthor && (
                                <View style={styles.authorBadge}>
                                    <Text style={styles.authorBadgeText}>작성자</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.time}>{comment.time}</Text>
                    </View>
                </View>
                <Text style={styles.content}>{comment.content}</Text>
                <View style={styles.commentActions}>
                    <TouchableOpacity
                        style={styles.replyBtn}
                        onPress={() => {
                            setIsReplyInputVisible(true);
                            setReplyToCommentId(comment.id);
                            setReplyToName(comment.user);
                        }}
                    >
                        <Image source={require('../../assets/commenticon.png')} style={styles.replyIcon} />
                        <Text style={styles.replyText}>답글쓰기</Text>
                    </TouchableOpacity>
                </View>
                {/* 자식 대댓글 재귀 렌더링 */}
                {comment.children && comment.children.length > 0 && renderComments(comment.children, depth + 1)}
            </View>
        ));
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/gobackicon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>상품 문의</Text>
                <TouchableOpacity>
                    <Text style={styles.viewBtn}>글보기</Text>
                </TouchableOpacity>
            </View>
            {/* 문의 개수 */}
            <Text style={styles.countText}>문의 {commentTree.length}개</Text>
            {/* 문의/댓글 리스트 */}
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {renderComments(commentTree)}
            </ScrollView>
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
                    <View style={styles.inputSection}>
                        <TextInput
                            style={styles.input}
                            placeholder="문의 내용을 입력해 주세요"
                            placeholderTextColor="#999"
                            value={input}
                            onChangeText={setInput}
                        />
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                            <Image source={require('../../assets/arrowrighticon.png')} style={styles.sendIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default MarketCommentPage;