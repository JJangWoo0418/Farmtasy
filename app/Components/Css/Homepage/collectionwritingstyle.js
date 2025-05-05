import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    backIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    headerTextBox: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
    },
    intro: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    time: {
        fontSize: 12,
        color: '#aaa',
        marginLeft: 8,
    },
    content: {
        fontSize: 15,
        color: '#222',
        marginBottom: 8,
        marginTop: 2,
    },
    postImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#f2f2f2',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },
    statsIcon: {
        width: 18,
        height: 18,
        marginRight: 4,
        resizeMode: 'contain',
    },
    statsText: {
        fontSize: 13,
        color: '#444',
    },
    emptyBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#aaa',
    },
});

export default styles;
