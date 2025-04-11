import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 2,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginBottom: 100,
        marginTop: 15
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,

    },
    scrollView: {
        flex: 1,
        marginTop: 60, // 헤더 높이에 맞게 조정
        marginBottom: 60, // 아래 여백 추가
    },
    postContainer: {
        padding: 16,
        paddingBottom: 0
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    userInfo: {
        fontSize: 12,
        color: '#666',
    },
    moreBtn: {
        marginLeft: 'auto',
        padding: 5, // Easier touch target
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
        marginTop: 5,
    },
    postImage: {
        width: '100%',
        height: 250, // Adjust height as needed
        borderRadius: 10,
        marginVertical: 2,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginLeft: 18
        
    },
    statsIcon: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    statsIconComment: {
        width: 18,
        height: 18,
        marginRight: 5,
        marginLeft: 248
    },
    statsText: {
        fontSize: 14,
        color: '#333',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: 22,
        height: 22,
        marginRight: 6,
        resizeMode: 'contain'
    },
    actionText: {
        fontSize: 15,
        color: '#333',
    },
    commentSectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentSortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    commentSortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    sortDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ccc',
        marginRight: 5,
    },
    activeSortDot: {
        backgroundColor: '#22CC6B',
    },
    sortText: {
        fontSize: 14,
        color: '#666',
    },
    activeSortText: {
        color: '#333',
        fontWeight: 'bold',
    },
    commentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentProfileImg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    commentUsername: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    commentInfo: {
        fontSize: 11,
        color: '#999',
        marginLeft: 0,
    },
    authorBadge: {
        backgroundColor: '#eee',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    authorBadgeText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    commentMoreBtn: {
        marginLeft: 'auto',
        padding: 5,
    },
    commentText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 8,
        marginLeft: 38, // Align with username
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 38, // Align with username
    },
    commentLikeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    commentLikeIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
        resizeMode: 'contain'
    },
    commentLikedIcon: {
        resizeMode: 'contain'
    },
    commentLikeText: {
        fontSize: 13,
        color: '#666',
    },
    commentReplyButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentReplyIcon: {
        width: 14,
        height: 14,
        marginRight: 4,
    },
    commentReplyText: {
        fontSize: 13,
        color: '#666',
    },
    userInfoContainer: {
        flex: 1,
        marginLeft: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    commentInputSection: {
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
    commentInput: {
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
    cameraButton: {
        marginRight: 10,
    },
    sendButton: {
        marginRight: 0,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    // ... add more styles if needed for replies, input fields, etc.
});
