import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import styles from '../Components/Css/Chatbot/questionpagestyle';
import { useRouter } from 'expo-router';

const QuestionPage = () => {
    const [input, setInput] = useState('');
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
                                <Ionicons name="chevron-back" size={28} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>질문하기(AI)</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        {/* 채팅 영역 */}
                        <View style={styles.chatContainer}>
                            {/* AI 답변 */}
                            <View style={styles.aiMessageContainer}>
                                <View style={styles.aiBubble}>
                                    <Image source={require('../../assets/chatboticon.png')} style={styles.sendicon} />
                                    <Text style={styles.aiText}>안녕하세요! 무엇을 도와드릴까요?</Text>
                                </View>
                            </View>
                            {/* 내 질문 */}
                            <View style={styles.myMessageContainer}>
                                <View style={styles.myBubble}>
                                    <Text style={styles.myText}>사과나무를 어떻게 키워야해?</Text>
                                </View>
                            </View>
                        </View>

                        {/* 하단 입력창 */}
                        <View style={styles.inputBar}>
                            <TouchableOpacity>
                                <Image source={require('../../assets/cameraicon.png')} style={styles.sendicon} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="  챗봇에게 궁금한 것을 물어보세요!"
                                value={input}
                                onChangeText={setInput}
                                placeholderTextColor="#aaa"
                            />
                            <TouchableOpacity>
                                <Image source={require('../../assets/arrowrighticon.png')} style={styles.sendicon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default QuestionPage;