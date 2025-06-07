import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222'
    },
    chatContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    aiMessageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    aiBubble: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 15,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',         // 추가
        wordBreak: 'break-all',   // 웹이면 추가, RN은 필요 없음
    },
    aiText: {
        color: '#000',
        marginLeft: 5,
        flexShrink: 1,        // 추가
        flexWrap: 'wrap',     // 추가
    },
    myMessageContainer: {
        flexDirection: 'row-reverse',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    myBubble: {
        backgroundColor: '#22C55E',
        padding: 10,
        borderRadius: 15,
        maxWidth: '80%',
        alignItems: 'center',
        flexWrap: 'wrap',         // 추가
        alignSelf: 'flex-end',
    },
    myText: {
        color: '#fff',
        flexShrink: 1,        // 추가
        flexWrap: 'wrap',     // 추가
    },
    // 이미지 메시지 컨테이너
    imageMessageContainer: {
        alignItems: 'center',
        marginVertical: 8,
    },
    uploadedImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 4,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingTop: 20,
        borderTopWidth: 2,
        borderColor: '#eee',
        backgroundColor: '#fff'
    },
    input: {
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: '#F4F2F8',
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 12,
        fontSize: 14,
        color: '#222'
    },
    sendicon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    sendicon2: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
        marginBottom: 30,
        marginTop: -15,
    },
    quickQuestions: {
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    quickQuestionButton: {
        backgroundColor: '#22C55E',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    quickQuestionText: {
        color: 'white',
        fontSize: 14,
    },
    
});

