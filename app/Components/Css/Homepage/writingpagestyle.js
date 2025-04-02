import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    back: {
        fontSize: 24,
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 125
    },
    topicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    topicIcon: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    topicText: {
        fontSize: 20,
        fontWeight: '500',
    },
    topicChangeBtn: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
        marginLeft: 10,
    },
    topicChangeText: {
        fontSize: 13,
        color: '#333',
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        height: 220,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 30,
        marginTop: 10
    },
    cameraIcon: {
        width: 28,
        height: 23,
        marginRight: 8,
        marginLeft:100
    },
    uploadText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#22CC6B',
        paddingVertical: 19,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 160
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
