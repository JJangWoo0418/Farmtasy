import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
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

// 장터 판매글 작성 튜토리얼 이미지 및 설명
const marketWriteImages = [
{
src: require('../../../assets/market_tutorial1.png'), // 첫 번째 사진
desc: '장터 메인 화면에서 원하는 카테고리를 선택할 수 있어요.\n상단의 검색창과 카테고리 버튼을 활용해보세요.',
},
{
src: require('../../../assets/market_tutorial2.png'), // 두 번째 사진
desc: '판매 버튼을 누르면 판매할 품목을 선택할 수 있는 창이 떠요.\n원하는 품목을 골라주세요.',
},
{
src: require('../../../assets/market_tutorial3.png'), // 세 번째 사진
desc: '장터 글쓰기 화면에서 사진을 올리고, 상품명, 가격, 연락처, 상세 설명을 입력해 주세요.',
},
{
src: require('../../../assets/market_tutorial4.png'), // 네 번째 사진
desc: '사진과 정보를 모두 입력했다면, 아래 등록 버튼을 눌러 판매글을 올릴 수 있어요!',
},
];

// 문의하기 튜토리얼 이미지 및 설명
const inquiryImages = [
{
src: require('../../../assets/market_tutorial5.png'), // 첫 번째 문의 사진
desc: '상품 상세 페이지에서 "상품 설명 더보기"와 함께 문의하기 버튼을 볼 수 있어요.\n문의하기를 누르면 판매자에게 직접 질문할 수 있습니다.',
},
{
src: require('../../../assets/market_tutorial6.png'), // 두 번째 문의 사진
desc: '문의 목록에서는 다른 사람들이 남긴 질문과 답변을 확인할 수 있고,\n문의 내용을 입력해 직접 질문도 할 수 있어요.',
},
];

export default function Tutorial({ navigation }) {
const [step, setStep] = useState(0); // 0~features.length-1
const [messages, setMessages] = useState([...initialMessages, { sender: 'bot', text: `먼저 '${features[0].name}'부터 시작할까?` }]);
const [showChoices, setShowChoices] = useState(true);
const [finished, setFinished] = useState(false);
const [marketWriteStep, setMarketWriteStep] = useState(-1); // -1: 아직 아님, 0~3: 사진 튜토리얼 단계
const [showMarketWriteAsk, setShowMarketWriteAsk] = useState(false);
const [inquiryStep, setInquiryStep] = useState(-1); // -1: 아직 아님, 0~1: 문의 튜토리얼 단계
const [showInquiryAsk, setShowInquiryAsk] = useState(false);

const handleChoice = (choice) => {
let newMessages = [...messages];
// 장터 기능 진입 시 분기
if (features[step].name === '장터') {
    if (choice === '알고있음') {
        newMessages.push({ sender: 'user', text: '이미 알고 있지~' });
        newMessages.push({ sender: 'bot', text: `오! 이미 알고 있다니 대단해! 그럼 다음 기능으로 넘어갈게.` });
        // 다음 기능으로
        if (step < features.length - 1) {
            newMessages.push({ sender: 'bot', text: `다음은 '${features[step + 1].name}' 기능이야!` });
            setStep(step + 1);
            setMessages(newMessages);
            setShowChoices(true);
        } else {
            newMessages.push({ sender: 'bot', text: '이제 Farmtasy의 다양한 기능을 직접 경험해봐!' });
            setMessages(newMessages);
            setShowChoices(false);
            setFinished(true);
        }
    } else {
        newMessages.push({ sender: 'user', text: '좋아, 알려줘!' });
        newMessages.push({ sender: 'bot', text: features[step].desc });
        // 장터 설명 후 판매글 작성법 질문
        newMessages.push({ sender: 'bot', text: '다음은 장터 페이지야. 혹시 판매글 쓰는 방법에 대해서 궁금해?' });
        setMessages(newMessages);
        setShowChoices(false);
        setShowMarketWriteAsk(true);
    }
    return;
}
// 일반 기능 분기
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

// 장터 판매글 작성법 예/아니오 분기
const handleMarketWriteAsk = (answer) => {
let newMessages = [...messages];
if (answer === '예') {
    newMessages.push({ sender: 'user', text: '예' });
    setMessages(newMessages);
    setMarketWriteStep(0);
    setShowMarketWriteAsk(false);
} else {
    newMessages.push({ sender: 'user', text: '아니오' });
    // 문의하기 기능 질문으로 바로 이동
    newMessages.push({ sender: 'bot', text: '그럼 문의하기 기능도 알고 있니?' });
    setMessages(newMessages);
    setShowMarketWriteAsk(false);
    setShowInquiryAsk(true);
}
};

// 장터 판매글 작성법 사진 튜토리얼 진행
const handleMarketWriteNext = () => {
let newMessages = [...messages];
if (marketWriteStep < marketWriteImages.length - 1) {
    setMarketWriteStep(marketWriteStep + 1);
} else {
    // 사진 설명 끝나면 문의하기 기능 질문
    newMessages.push({ sender: 'bot', text: '이제 장터 판매글 작성 방법을 알았으니, 문의하기 기능도 알고 있니?' });
    setMessages(newMessages);
    setMarketWriteStep(-1);
    setShowInquiryAsk(true);
}
};

// 문의하기 예/아니오 분기
const handleInquiryAsk = (answer) => {
let newMessages = [...messages];
if (answer === '예') {
    newMessages.push({ sender: 'user', text: '예' });
    setMessages(newMessages);
    setInquiryStep(0);
    setShowInquiryAsk(false);
} else {
    newMessages.push({ sender: 'user', text: '아니오' });
    newMessages.push({ sender: 'bot', text: '알겠어! 그럼 다음 기능으로 넘어갈게.' });
    // 다음 기능으로
    if (step < features.length - 1) {
        newMessages.push({ sender: 'bot', text: `다음은 '${features[step + 1].name}' 기능이야!` });
        setStep(step + 1);
        setMessages(newMessages);
        setShowChoices(true);
        setShowInquiryAsk(false);
    } else {
        newMessages.push({ sender: 'bot', text: '이제 Farmtasy의 다양한 기능을 직접 경험해봐!' });
        setMessages(newMessages);
        setShowInquiryAsk(false);
        setFinished(true);
    }
}
};

// 문의하기 사진 튜토리얼 진행
const handleInquiryNext = () => {
let newMessages = [...messages];
if (inquiryStep < inquiryImages.length - 1) {
    setInquiryStep(inquiryStep + 1);
} else {
    // 사진 설명 끝나면 다음 기능으로
    if (step < features.length - 1) {
        newMessages.push({ sender: 'bot', text: '이제 문의하기 기능도 알았으니, 다음 기능으로 넘어갈게!' });
        newMessages.push({ sender: 'bot', text: `다음은 '${features[step + 1].name}' 기능이야!` });
        setStep(step + 1);
        setMessages(newMessages);
        setShowChoices(true);
        setInquiryStep(-1);
    } else {
        newMessages.push({ sender: 'bot', text: '이제 Farmtasy의 다양한 기능을 직접 경험해봐!' });
        setMessages(newMessages);
        setInquiryStep(-1);
        setFinished(true);
    }
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
    {/* 장터 판매글 작성법 사진 튜토리얼 */}
    {marketWriteStep >= 0 && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Image source={marketWriteImages[marketWriteStep].src} style={{ width: 260, height: 480, borderRadius: 16, marginBottom: 16 }} resizeMode="cover" />
        <View style={styles.botBubble}>
            <Text style={styles.botText}>{marketWriteImages[marketWriteStep].desc}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleMarketWriteNext}>
            <Text style={styles.buttonText}>{marketWriteStep === marketWriteImages.length - 1 ? '문의하기 기능' : '다음'}</Text>
        </TouchableOpacity>
        </View>
    )}
    {/* 문의하기 사진 튜토리얼 */}
    {inquiryStep >= 0 && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Image source={inquiryImages[inquiryStep].src} style={{ width: 260, height: 480, borderRadius: 16, marginBottom: 16 }} resizeMode="cover" />
        <View style={styles.botBubble}>
            <Text style={styles.botText}>{inquiryImages[inquiryStep].desc}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleInquiryNext}>
            <Text style={styles.buttonText}>{inquiryStep === inquiryImages.length - 1 ? '다음 기능' : '다음'}</Text>
        </TouchableOpacity>
        </View>
    )}
    </ScrollView>
    {/* 일반 기능 분기 선택지 */}
    {showChoices && !finished && marketWriteStep === -1 && !showMarketWriteAsk && inquiryStep === -1 && !showInquiryAsk && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e6e6e6' }]} onPress={() => { setShowChoices(false); handleChoice('알고있음'); }}>
            <Text style={[styles.buttonText, { color: '#333' }]}>이미 알고 있지~</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setShowChoices(false); handleChoice('알고있음아님'); }}>
            <Text style={styles.buttonText}>좋아, 알려줘!</Text>
        </TouchableOpacity>
        </View>
    )}
    {/* 장터 판매글 작성법 예/아니오 선택지 */}
    {showMarketWriteAsk && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e6e6e6' }]} onPress={() => handleMarketWriteAsk('아니오')}>
            <Text style={[styles.buttonText, { color: '#333' }]}>아니오</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleMarketWriteAsk('예')}>
            <Text style={styles.buttonText}>예</Text>
        </TouchableOpacity>
        </View>
    )}
    {/* 문의하기 예/아니오 선택지 */}
    {showInquiryAsk && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e6e6e6' }]} onPress={() => handleInquiryAsk('아니오')}>
            <Text style={[styles.buttonText, { color: '#333' }]}>아니오</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleInquiryAsk('예')}>
            <Text style={styles.buttonText}>예</Text>
        </TouchableOpacity>
        </View>
    )}
    {/* 튜토리얼 종료 */}
    {finished && (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
    )}
</SafeAreaView>
);
}