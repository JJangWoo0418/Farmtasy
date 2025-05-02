import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 130
    },
    topicBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    topicIcon: {
        width: 60,
        height: 60,
        marginRight: 12,
    },
    topicText: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 5
    },
    topicSub: {
        fontSize: 15,
        color: '#666',
        paddingBottom: 5
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 42,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingBottom: 6,
        paddingTop: 15
    },
    filterText: {
        fontSize: 18,
        color: '#444',
    },
    postBox: {
        padding: 16,
        paddingTop: 15,
        borderBottomWidth: 10,
        borderColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImg: {
        width: 30,
        height: 30,
        borderRadius: 19,
        marginRight: 10,
        marginBottom: 2
    },
    userInfoContainer: {
        flex: 1,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        fontSize: 13,
        color: '#888',
    },
    moreBtn: {
        width: 23,
        height: 23,
        resizeMode: 'cover',
        position: 'absolute',
        right: 0,
        top: -13,
        marginRight: -5,
        marginBottom: 0
    },
    moreBtn2: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
        position: 'absolute',
        right: 0,
        top: -13,
        marginRight: -5,
        marginBottom: 0
    },
    postText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    postImages: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 8,
    },
    postImage: {
        width: 375,
        height: 375,
        marginRight: 10,
        marginBottom: 8,
        marginLeft: -8,
        backgroundColor: '#eee', // 로딩 중에도 영역 보이게
        borderRadius: 0,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    icon: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
        marginRight: 3,
    },
    iconText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 2,
        width: 20,
        textAlign: 'center',
    },
    icon2: {
        width: 24,
        height: 24,
        marginRight: 1,
        resizeMode: 'contain',
    },
    icon3: {
        width: 20,
        height: 24,
        marginRight: 1,
        resizeMode: 'contain',
        marginLeft: 220,
        marginBottom: 5
    },
    writeButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22CC6B',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
    },
    writeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    writeIcon: {
        width: 17,
        height: 17,
        marginLeft: 3,
    },
    filterButton: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    activeFilter: {
        fontWeight: 'bold',
        color: '#000',
    },

    activeBar: {
        marginTop: 4,
        width: 70,
        height: 3,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
        marginTop: 25
    },

    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },

    tabText: {
        fontSize: 16,
        color: '#888',
    },

    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },

    underline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: SCREEN_WIDTH / 4,
        height: 3,
        backgroundColor: '#000',
        borderRadius: 2,
    },

    iconContainer:{
        flexDirection: 'row',
        alignItems: 'center',
    },

    bestCommentPreview: {
        backgroundColor: '#F3F3F3',
        borderRadius: 8,
        marginTop: 14,
        marginBottom: 1,
        padding: 12,
        marginHorizontal: -8
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentProfileImg: {
        width: 29,
        height: 29,
        borderRadius: 16,
        marginRight: 8,
    },
    commentUsername: {
        fontWeight: 'bold',
    },
    commentInfo: {
        color: '#888',
        fontSize: 12,
    },
    bestCommentText: {
        color: '#333',
        fontSize: 15,
        marginVertical: 4,
        marginLeft: 37,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    commentLikeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    commentLikeIcon: {
        width: 18,
        height: 18,
        marginRight: 2,
    },
    commentLikeText: {
        color: '#888',
        fontSize: 13,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    row2: {
        flexDirection: 'row',
        marginLeft: -5,
    },
    row3: {
        flexDirection: 'row',
        marginLeft: 1,
    },
    row4: {
        flexDirection: 'row',
        marginLeft: -5,
    },
    singleImage: {
        width: 363,
        height: 363,
        marginLeft: -1,
        resizeMode: 'cover',
    },
    multiImage: {
        width: 177,
        height: 177,
        margin: 4,
        resizeMode: 'cover',
    },
    squadImage: {
        width: 177,
        height: 177,
        margin: 4,
        resizeMode: 'cover',
    },
    overlay: {
        width: 177,
        height: 177,
        marginLeft: 4,
        marginTop: 4,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    leftLargeImage: {
        width: 236,
        height: 236,
        marginRight: 5,
        resizeMode: 'cover',
        marginBottom: 5
    },
    rightColumn: {
        flexDirection: 'column',
        marginLeft: 4,
    },
    rightSmallImage: {
        width: 114,
        height: 114,
        marginBottom: 8,
        resizeMode: 'cover',
    },
});
