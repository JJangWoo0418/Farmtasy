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
    bellIcon: {
        marginLeft: 10,
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
    },
    menuText: {
        fontSize: 15,
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
    post: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    postTime: {
        fontSize: 12,
        color: '#888',
    },
    postText: {
        fontSize: 14,
        marginVertical: 5,
    },
    postImages: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    postImage: {
        width: '48%',
        height: 100,
        borderRadius: 10,
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
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'contain',
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
        marginTop: 40
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
});

