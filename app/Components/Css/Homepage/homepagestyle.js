import { StyleSheet, Dimensions,} from 'react-native';

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
        zIndex: 99,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        margin: 10,
    },
    searchBar2: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        margin: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    menuItem: {
        alignItems: 'center',
    },
    menuIcon: {
        width: 65,
        height: 65,
        marginBottom: 9,
        resizeMode:"cover"
    },
    paperpencilIcon: {
        width: 17,
        height: 17,
        resizeMode: 'contain'
    },
    menuText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 10,
    },
    activeTab: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    inactiveTab: {
        fontSize: 16,
        color: '#888',
    },
    postContainer: {
        flex: 1,
        padding: 10,
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
    iconContainer:{
        flexDirection: 'row',
        alignItems: 'center',
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
        marginLeft: -1,
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
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    navItem: {
        alignItems: 'center',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'white',
        marginTop: 60,
    },

    menuIconWrapper: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f2f4',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginHorizontal: 8,
        height: 40,
    },

    searchIcon: {
        marginRight: 6,
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },

    bellIconWrapper: {
        paddingHorizontal: 4,
    },
    bellIcon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
        marginLeft: 0,
    },
    writeButton: {
        position: 'absolute',
        right: 20,
        bottom: 80, // 하단 탭바 위로 띄우기 (적당히 조절 가능)
        backgroundColor: '#22CC6B', // 네가 보낸 이미지에 맞춘 초록색
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5, // 안드로이드 그림자
        shadowColor: '#000', // iOS 그림자
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginBottom: 40,
    },

    writeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },

    inner: {
        flex: 1,
    },
    close: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
    },
    item: {
        fontSize: 14,
        paddingVertical: 4,
        paddingLeft: 10,
    },

    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        zIndex: 100,
        flexDirection: 'row',
        marginBottom: 0,
    },

    drawerStatic: {
        width: SCREEN_WIDTH * 0.55, // ✅ 화면의 절반 너비로 조정
        backgroundColor: 'white',
        paddingTop: 20,
        paddingHorizontal: 20,
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },

    drawerClose: {
        alignSelf: 'flex-end',
        marginBottom: 0,
        marginTop: 50
    },

    drawerTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 14,
        marginBottom: 1,
        color: '#000',
    },

    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },

    drawerIcon: {
        width: 38,
        height: 38,
        marginRight: 10,
        resizeMode: 'contain',
    },

    drawerText: {
        fontSize: 17,
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 16,
        color: 'black',
    },
    notificationList: {
        flex: 1,
        paddingVertical: 3,
    },
    notificationItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyNotification: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    emptyNotificationText: {
        fontSize: 16,
        color: '#666',
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    actorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    notificationContent: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    highlightText: {
        color: '#22CC6B',
        fontWeight: '500',
    },
    notificationText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    contentText: {
        color: '#666',
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 60, // 검색창 아래 위치
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        maxHeight: 300,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 8,
        marginHorizontal: 16,
    },
    searchResultsList: {
        maxHeight: 300,
    },
    searchResultItem: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    searchResultImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    searchResultInfo: {
        flex: 1,
    },
    searchResultName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    searchResultPrice: {
        fontSize: 14,
        color: '#22CC6B',
        fontWeight: 'bold',
    },
    noResultsText: {
        padding: 16,
        textAlign: 'center',
        color: '#666',
    },
    searchResultImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#f5f5f5', // 이미지가 없을 때 배경색
    },
    searchModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    searchModalContent: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 150,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    searchModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchModalCloseButton: {
        padding: 8,
        marginRight: 8,
    },
    searchModalInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchModalInput: {
        flex: 1,
        height: 40,
        marginLeft: 8,
        fontSize: 16,
    },
    searchLoading: {
        marginTop: 20,
    },
    searchResultsList: {
        flex: 1,
    },
    searchPlaceholder: {
        color: '#aaa',
        marginLeft: 8,
    },
});

