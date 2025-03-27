import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    },
    menuItem: {
        alignItems: 'center',
    },
    menuIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    menuText: {
        fontSize: 14,
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
        borderBottomWidth: 2,
        borderBottomColor: '#000',
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
});

