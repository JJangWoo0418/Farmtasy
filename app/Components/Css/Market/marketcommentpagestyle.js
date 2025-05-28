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
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2'
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222'
    },
    viewBtn: {
        fontSize: 15,
        color: '#222'
    },
    countText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 18,
        marginTop: 16,
        marginBottom: 8
    },
    list: {
        paddingHorizontal: 10,
        paddingBottom: 80
    },
    commentBox: {
        marginBottom: 18
    },
    commentContainer: {
        paddingHorizontal: 8,
        paddingVertical: 15,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 38, // Align with username
    },
    profileImg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    username: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222'
    },
    authorBadge: {
        backgroundColor: '#eee',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
        marginBottom: 1
    },
    authorBadgeText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    time: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 2
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 8,
        marginLeft: 38, // Align with username
    },
    replyPill: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 59,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f6fa',
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginHorizontal: 0,
        marginBottom: 2,
        zIndex: 2,
    },
    replyPillText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 15
    },
    replyPillCancel: {
        color: '#22CC6B',
        fontWeight: 'bold',
        fontSize: 15
    },
    replyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    replyIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
        resizeMode: 'contain',
        marginBottom: 1
    },
    replyText: {
        fontSize: 14,
        color: '#222'
    },
    replyBox: {
        marginLeft: 38,
        marginTop: 8,
        backgroundColor: '#fafbfc',
        borderRadius: 8,
        padding: 8
    },
    inputSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 14,
        backgroundColor: '#F4F2F8',
    },
    sendBtn: {
        marginLeft: 8
    },
    sendIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    commentInfo: {
        fontSize: 11,
        color: '#999',
        marginLeft: 0,
    },
});