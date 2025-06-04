import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import styles from '../../../app/Components/Css/Homepage/tutorialstyle';

const features = [
{
name: '지도',
desc: '지도에서는 내 농장 위치를 확인하고, QR 스캔으로 다양한 정보를 얻을 수 있어요.',
},
{
name: '게시판',
desc: '게시판에서는 자유롭게 글을 쓰고, 다른 농부들과 소통할 수 있어요.',
},
{
name: '시세',
desc: '시세 메뉴에서는 다양한 작물의 최신 가격 정보를 확인할 수 있어요.',
},
{
name: '병해충',
desc: '병해충 메뉴에서는 사진으로 병해충을 진단하고, 방제법도 확인할 수 있어요.',
},
{
name: '장터',
desc: '장터에서는 농산물을 사고팔 수 있고, 상품 업로드, 상세 정보, 댓글 기능도 있어요.',
},
{
name: '날씨',
desc: '날씨 메뉴에서는 내 농장 지역의 실시간 날씨 정보를 확인할 수 있어요.',
},
];

const initialMessages = [
{ sender: 'bot', text: '안녕하세요! 👋\nFarmtasy에 오신 걸 환영해요!' },
{ sender: 'bot', text: 'Farmtasy의 주요 기능을 하나씩 소개해줄게!' },
];

export default function Tutorial({ navigation }) {
const [step, setStep] = useState(0); // 0~features.length-1
const [messages, setMessages] = useState([...initialMessages, { sender: 'bot', text: `먼저 '${features[0].name}'부터 시작할까?` }]);
const [showChoices, setShowChoices] = useState(true);
const [finished, setFinished] = useState(false);

const handleChoice = (choice) => {
let newMessages = [...messages];
if (choice === '알고있음') {
    newMessages.push({ sender: 'user', text: '이미 알고 있지~' });
    newMessages.push({ sender: 'bot', text: `오! 이미 알고 있다니 대단해! 그럼 다음 기능으로 넘어갈게.` });
} else {
    newMessages.push({ sender: 'user', text: '좋아, 알려줘!' });
    newMessages.push({ sender: 'bot', text: features[step].desc });
}
// 다음 기능으로 넘어가기
if (step < features.length - 1) {
    newMessages.push({ sender: 'bot', text: `다음은 '${features[step + 1].name}' 기능이야!` });
    setStep(step + 1);
    setMessages(newMessages);
    setShowChoices(true);
} else {
    // 마지막 기능 이후
    newMessages.push({ sender: 'bot', text: '이제 Farmtasy의 다양한 기능을 직접 경험해봐!' });
    setMessages(newMessages);
    setShowChoices(false);
    setFinished(true);
}
};

const handleStart = () => {
navigation.replace('Homepage/homepage');
};

return (
<SafeAreaView style={styles.container}>
    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingVertical: 32 }}>
    {messages.map((msg, idx) => (
        <View
        key={idx}
        style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}
        >
        <Text style={msg.sender === 'bot' ? styles.botText : styles.userText}>{msg.text}</Text>
        </View>
    ))}
    </ScrollView>
    {showChoices && !finished && (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e6e6e6' }]} onPress={() => { setShowChoices(false); handleChoice('알고있음'); }}>
        <Text style={[styles.buttonText, { color: '#333' }]}>이미 알고 있지~</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setShowChoices(false); handleChoice('알고있음아님'); }}>
        <Text style={styles.buttonText}>좋아, 알려줘!</Text>
        </TouchableOpacity>
    </View>
    )}
    {finished && (
    <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>시작하기</Text>
    </TouchableOpacity>
    )}
</SafeAreaView>
);
}