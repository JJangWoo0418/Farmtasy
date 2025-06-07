import React, { useState, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import API_CONFIG from '../DB/api';
import styles from '../Components/Css/Chatbot/questionpagestyle';
import { useLocalSearchParams } from 'expo-router';

const QuestionPage = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            content: '안녕하세요! 팜타지 농장 관리 도우미입니다. 제가 알려드릴 수 있는 정보는 다음과 같습니다:\n\n1. 현재 장터에 판매 중인 제품 정보\n2. 귀하의 농장에 있는 작물 정보\n3. 작물 재배 방법\n4. 농장 관리 팁\n\n어떤 정보가 필요하신가요?',
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);
    const router = useRouter();
    const { phone, name, region, introduction } = useLocalSearchParams();
    console.log('넘어온 phone:', phone);


    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const sendToAI = async (message) => {
        setLoading(true);
        try {
            // 1. 농장 정보 가져오기
            const farmResponse = await fetch(
                `${API_CONFIG.BASE_URL}/api/farm/user?phone=${phone}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.TOKEN}`
                    }
                }
            );
            const farmData = await farmResponse.json();
            console.log('farmData:', farmData);

            // 2. 장터 제품 정보 가져오기 (수정 필요 없음)
            // 2. 장터 제품 정보 가져오기
            const marketResponse = await fetch(
                `${API_CONFIG.BASE_URL}/api/market/products`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.TOKEN}`
                    }
                }
            );
            const marketData = await marketResponse.json();
            console.log('marketData:', marketData); // ← 여기!

            // 게시글 정보 가져오기
            const postsResponse = await fetch(`${API_CONFIG.BASE_URL}/api/posts`);
            const postsData = await postsResponse.json();
            console.log('postsData:', postsData);

            // 1. 요약 데이터 만들기
            const farmSummary = Array.isArray(farmData)
                ? farmData.map(farm => ({
                    farm_name: farm.farm_name,
                    address: farm.address,
                    crops: farm.crops && farm.crops.length > 0
                        ? farm.crops.map(crop => `${crop.crop_name}(${crop.crop_type})`).join(', ')
                        : '작물 없음'
                }))
                : [];

            const marketSummary = Array.isArray(marketData)
                ? marketData.map(market => ({
                    market_name: market.market_name,
                    market_price: market.market_price,
                    market_category: market.market_category
                }))
                : [];

            const postsSummary = Array.isArray(postsData)
                ? postsData.map(post => ({
                    title: post.post_content?.slice(0, 20) + '...', // 내용 앞부분만 요약
                    author: post.name,
                    region: post.region,
                    created_at: post.post_created_at
                }))
                : [];

            // 3. 메시지 구성
            const allMsgs = [
                {
                    role: 'system',
                    content: `당신은 팜타지 농장 관리 도우미입니다.
다음 정보를 참고하여 답변해주세요:

사용자 농장 정보:
${JSON.stringify(farmSummary)}

장터 제품 정보:
${JSON.stringify(marketSummary)}

최근 게시글 정보:
${JSON.stringify(postsSummary)}

응답은 친절하고 전문적으로 해주세요.`
                },
                ...messages.map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                })),
                { role: message.type === 'user' ? 'user' : 'assistant', content: message.content }
            ];

            // 4. OpenAI API 호출
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_CONFIG.OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: allMsgs,
                    temperature: 0.7
                })
            });

            // 5. 응답 처리
            if (!res.ok) throw new Error(res.status);
            const json = await res.json();
            const aiText = json.choices?.[0]?.message?.content?.trim() || '응답을 가져올 수 없었어요.';

            // 6. 메시지 추가
            setMessages(prev => [...prev, { type: 'ai', content: aiText, timestamp: new Date() }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [
                ...prev,
                { type: 'ai', content: '데이터를 가져오는 중 오류가 발생했어요...', timestamp: new Date() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { type: 'user', content: input.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        await sendToAI(userMsg);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {/* 헤더 고정 */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="chevron-back" size={28} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>질문하기(AI)</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        {/* 채팅만 스크롤 가능한 영역 */}
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                ref={scrollViewRef}
                                contentContainerStyle={[styles.chatContainer, { flexGrow: 1 }]}
                                keyboardShouldPersistTaps="handled"
                            >
                                {messages.map((msg, idx) => (
                                    <View
                                        key={idx}
                                        style={
                                            msg.type === 'ai'
                                                ? styles.aiMessageContainer
                                                : styles.myMessageContainer
                                        }
                                    >
                                        <View style={msg.type === 'ai' ? styles.aiBubble : styles.myBubble}>
                                            {msg.type === 'ai' && (
                                                <Image
                                                    source={require('../../assets/chatboticon.png')}
                                                    style={styles.sendicon2}
                                                />
                                            )}
                                            <Text style={msg.type === 'ai' ? styles.aiText : styles.myText}>
                                                {msg.content}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {loading && (
                                    <ActivityIndicator
                                        style={{ marginVertical: 20 }}
                                        color="#22C55E"
                                        size="large"
                                    />
                                )}
                            </ScrollView>
                        </View>

                        {/* 여기에 빠른 질문 버튼 추가 */}
                        <View style={styles.quickQuestions}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity
                                    style={styles.quickQuestionButton}
                                    onPress={() => setInput("장터에 어떤 제품들이 있나요?")}
                                >
                                    <Text style={styles.quickQuestionText}>장터 제품 보기</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickQuestionButton}
                                    onPress={() => setInput("내 농장에 있는 작물 알려줘")}
                                >
                                    <Text style={styles.quickQuestionText}>내 농장 작물</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.quickQuestionButton}
                                    onPress={() => setInput("최근 게시글 보여줘")}
                                >
                                    <Text style={styles.quickQuestionText}>최근 게시글 보기</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>

                        {/* 입력창 고정 */}
                        <View style={styles.inputBar}>
                            <TextInput
                                style={styles.input}
                                placeholder="챗봇에게 궁금한 것을 물어보세요!"
                                placeholderTextColor="#aaa"
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity onPress={handleSend}>
                                <Image
                                    source={require('../../assets/arrowrighticon.png')}
                                    style={styles.sendicon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default QuestionPage;
