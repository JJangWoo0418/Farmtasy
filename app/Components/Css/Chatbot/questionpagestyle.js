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
        borderColor: '#eee',
        marginTop: -10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginLeft: 4,
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
        padding: 14,
        borderRadius: 18,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginVertical: 6,
        marginHorizontal: 8,
        // 그림자 효과 (iOS/Android)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    aiText: {
        color: '#222',
        fontSize: 16,
        lineHeight: 22,
        marginLeft: 0,
        flexShrink: 1,
        flexWrap: 'wrap',
        fontWeight: 'bold',
    },
    myMessageContainer: {
        flexDirection: 'row-reverse',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    myBubble: {
        backgroundColor: '#22C55E',
        padding: 14,
        borderRadius: 18,
        maxWidth: '80%',
        alignItems: 'center',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        marginVertical: 6,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    myText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 22,
        flexShrink: 1,
        flexWrap: 'wrap',
        fontWeight: 'bold',
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

