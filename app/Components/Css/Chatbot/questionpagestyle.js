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
        flex: 1, 
        padding: 20 
    },
    aiMessageContainer: {
        alignItems: 'flex-start', 
        marginBottom: 16 
    },
    aiBubble: {
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: 'white', 
        borderRadius: 10, 
        padding: 12, 
        borderWidth: 2, 
        borderColor: '#686868'
    },
    aiText: { 
        color: '#222', 
        fontSize: 15 ,
        marginLeft: 15
    },
    myMessageContainer: { 
        alignItems: 'flex-end' 
    },
    myBubble: {
        backgroundColor: '#22C55E', 
        borderRadius: 10, 
        padding: 16, 
        maxWidth: '80%'
    },
    myText: { 
        color: '#fff', 
        fontSize: 15,
        fontWeight: 'bold' 
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
        paddingHorizontal:6, 
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

