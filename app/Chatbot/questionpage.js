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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import API_CONFIG from '../DB/api';
import styles from '../Components/Css/Chatbot/questionpagestyle';

const QuestionPage = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            type: 'ai',
            content: '안녕하세요! 무엇을 도와드릴까요?',
            timestamp: new Date(),
        },
    ]);
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef(null);
    const router = useRouter();

    // 새 메시지가 추가될 때 스크롤 맨 아래로
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    // 이미지 선택 및 메시지 추가
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 거부', '사진 업로드 권한이 필요해요');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.cancelled) {
            const imgMsg = { type: 'image', uri: result.uri, timestamp: new Date() };
            setMessages(prev => [...prev, imgMsg]);
            await sendToAI(imgMsg);
        }
    };

    // OpenAI에 텍스트 혹은 이미지 URL 전송
    const sendToAI = async (message) => {
        setLoading(true);
        try {
            // system 메시지 + 대화 내역 + 새 메시지
            const allMsgs = [
                { role: 'system', content: 'You are a helpful farm management assistant.' },
                ...messages.map(m => ({
                    role: m.type === 'user' ? 'user' : 'assistant',
                    content: m.type === 'image' ? `[Image] ${m.uri}` : m.content
                })),
                {
                    role: message.type === 'user' ? 'user' : 'assistant',
                    content: message.type === 'image' ? `[Image] ${message.uri}` : message.content
                }
            ];

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_CONFIG.OPENAI_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: allMsgs,
                }),
            });

            if (!res.ok) {
                throw new Error(`OpenAI API error: ${res.status}`);
            }

            const json = await res.json();
            const aiText =
                json.choices?.[0]?.message?.content?.trim() ||
                '죄송해요, 응답을 가져올 수 없었어요.';

            setMessages(prev => [
                ...prev,
                { type: 'ai', content: aiText, timestamp: new Date() },
            ]);
        } catch (e) {
            setMessages(prev => [
                ...prev,
                {
                    type: 'ai',
                    content: '오류가 발생했어요… 다시 시도해 주세요.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 텍스트 입력 전송
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
                        {/* 상단 바 */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="chevron-back" size={28} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>질문하기(AI)</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        {/* 채팅 영역 */}
                        <ScrollView
                            ref={scrollViewRef}
                            contentContainerStyle={styles.chatContainer}
                        >
                            {messages.map((msg, idx) => (
                                <View
                                    key={idx}
                                    style={
                                        msg.type === 'ai'
                                            ? styles.aiMessageContainer
                                            : msg.type === 'user'
                                                ? styles.myMessageContainer
                                                : styles.imageMessageContainer
                                    }
                                >
                                    {msg.type === 'image' ? (
                                        <Image source={{ uri: msg.uri }} style={styles.uploadedImage} />
                                    ) : (
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
                                    )}
                                </View>
                            ))}
                            {loading && <ActivityIndicator style={{ marginVertical: 20 }} />}
                        </ScrollView>

                        {/* 하단 입력창 */}
                        <View style={styles.inputBar}>
                            <TouchableOpacity onPress={pickImage}>
                                <Image source={require('../../assets/cameraicon.png')} style={styles.sendicon} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="챗봇에게 궁금한 것을 물어보세요!"
                                placeholderTextColor="#aaa"
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity onPress={handleSend}>
                                <Image source={require('../../assets/arrowrighticon.png')} style={styles.sendicon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default QuestionPage;
