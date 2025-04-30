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
        marginBottom: 0,
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
        width: 30,
        height: 30,
        borderRadius: 19,
        marginRight: 10,
        marginBottom: 2
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
        width: 23,
        height: 23,
        resizeMode: 'cover',
        marginBottom: 5
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
        marginTop: 5,
    },
    postImages: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 8,
        marginRight: 50,
    },
    postImage: {
        width: 363,
        height: 363,
        marginVertical: 2,
        marginTop: 3,
        marginBottom: 3,
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
        marginLeft: 18,
        marginBottom: 2

    },
    statsIcon: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    statsIconComment: {
        width: 21,
        height: 21,
        marginRight: 5,
        marginLeft: 248,
        marginBottom: 2
    },
    statsText: {
        fontSize: 14,
        color: 'gray',
    },
    statsText2: {
        fontSize: 14,
        color: 'gray',
        marginLeft: 252,
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
        marginBottom: 1
    },
    authorBadgeText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    commentMoreBtn: {
        width: 23,
        height: 23,
        marginLeft: 72,
        marginBottom: 5,
        resizeMode: 'cover'
    },
    commentMoreBtn2: {
        width: 23,
        height: 23,
        marginLeft: 55,
        marginBottom: 5,
        resizeMode: 'cover'
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
    commentAnswerIcon: {
        width: 16,
        height: 16,
        marginRight: 4,
        resizeMode: 'contain',
        marginBottom: 1
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
        marginLeft: 3,
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
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-end',
        maxHeight: '50%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 40,
    },
    modalButton: {
        alignItems: 'center',
    },
    modalIcon: {
        width: 50,
        height: 50,
        marginBottom: 12,
        resizeMode: 'contain',
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        alignItems: 'center',
        marginBottom: 12,

    },
    modalCloseText: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
    modalCloseIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    // ... add more styles if needed for replies, input fields, etc.
});
