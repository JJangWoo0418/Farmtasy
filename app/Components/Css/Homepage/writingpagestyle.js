import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 70,
        marginLeft: 20

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
        marginLeft: 20,
        marginTop: 10
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
        marginHorizontal: 20
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
        marginHorizontal: 20
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 30,
        marginTop: 10,
        marginHorizontal: 20
    },
    cameraIcon: {
        width: 28,
        height: 23,
        marginRight: 8,
        marginLeft: 100
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
        marginTop: 160,
        marginHorizontal: 20
    },
    submitText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        zIndex: 110, // dim보다 더 위에 있어야 함
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 15, // 안드로이드용 그림자
        paddingBottom: 80,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sheetTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    
        marginBottom: 10
    },
    sheetClose: {
        fontSize: 20,
        fontWeight: 'bold',
    
        marginBottom: 10
    },
    sheetOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20
    },
    sheetItem: {
        alignItems: 'center',
    },
    sheetIcon: {
        width: 40,
        height: 40,
        marginBottom: 8,
    },
    sheetIcon3: {
        width: 45,
        height: 40,
        marginBottom: 8,
    },
    sheetIcon2: {
        width: 37,
        height: 37,
        marginBottom: 6,
        marginTop: 5.5
    },
    sheetLabel: {
        fontSize: 14,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 100, // 반드시 높게
    },

});
