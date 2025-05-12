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
        alignItems: 'flex-start',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    aiBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 12,
        borderWidth: 2,
        borderColor: '#686868',
        maxWidth: '80%',    // 화면 가로의 80% 이내로 제한
        flexShrink: 1,
    },
    aiText: {
        color: '#222',
        fontSize: 15,
        marginLeft: 10,
        flexShrink: 1,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    myBubble: {
        backgroundColor: '#22C55E',
        borderRadius: 10,
        padding: 16,
        maxWidth: '80%',
        flexShrink: 1,
    },
    myText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        flexShrink: 1,
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
        width: 30,
        height: 30,
        resizeMode: 'contain'
    }
});

