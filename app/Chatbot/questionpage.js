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
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import API_CONFIG from '../DB/api';
import styles from '../Components/Css/Chatbot/questionpagestyle';

const QuestionPage = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { type: 'ai', content: '안녕하세요! 무엇을 도와드릴까요?', timestamp: new Date() }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const sendToAI = async (message) => {
        setLoading(true);
        try {
            const allMsgs = [
                { role: 'system', content: 'You are a helpful farm management assistant.' },
                ...messages.map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.content
                })),
                { role: message.type === 'user' ? 'user' : 'assistant', content: message.content }
            ];

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_CONFIG.OPENAI_KEY}`
                },
                body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: allMsgs })
            });
            if (!res.ok) throw new Error(res.status);
            const json = await res.json();
            const aiText = json.choices?.[0]?.message?.content?.trim() || '응답을 가져올 수 없었어요.';
            setMessages(prev => [...prev, { type: 'ai', content: aiText, timestamp: new Date() }]);
        } catch {
            setMessages(prev => [
                ...prev,
                { type: 'ai', content: '오류가 발생했어요…', timestamp: new Date() }
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
                                                    style={styles.sendicon}
                                                />
                                            )}
                                            <Text style={msg.type === 'ai' ? styles.aiText : styles.myText}>
                                                {msg.content}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {loading && <ActivityIndicator style={{ marginVertical: 20 }} color="#22C55E"      // 원하는 초록색
                                    size="large"         // 크기도 조절 가능
                                />}
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
