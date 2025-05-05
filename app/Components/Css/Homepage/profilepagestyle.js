import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 3,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    backBtn: {
        padding: 4,
        marginRight: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginRight: 32, // 뒤로가기 버튼 공간 확보
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    profileImg: {
        width: 50,
        height: 50,
        borderRadius: 32,
        backgroundColor: '#eee',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
    },
    profileLevel: {
        fontSize: 13,
        color: '#888',
    },
    editBtn: {
        backgroundColor: '#22CC6B',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        position: 'absolute',
        top: 23,
        right: 20,
    },
    editBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    activitySection: {
        paddingHorizontal: 20,
        marginTop: 8,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 16,
        marginTop: 12,
    },
    activityBox: {
        flexDirection: 'row',
        backgroundColor: '#ededed',
        borderRadius: 12,
        paddingVertical: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    activityItem: {
        flex: 1,
        alignItems: 'center',
    },
    activityDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#ccc',
    },
    activityLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 2,
    },
    activityValue: {
        color: '#111',
        fontWeight: 'bold',
        fontSize: 16,
    },
    activityValueActive: {
        color: '#111',
        fontWeight: 'bold',
        fontSize: 16,
    },
    divider: {
        height: 8,
        backgroundColor: '#F5F5F7',
        marginTop: 16,
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 10,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sectionIcon: {
        width: 22,
        height: 22,
        marginRight: 14,
        resizeMode: 'contain',
    },
    sectionText: {
        flex: 1,
        fontSize: 15,
        color: '#222',
    },
    arrowIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#B0B0B0',
    },
    introSection: {
        marginTop: 24,
        marginHorizontal: 20,
    },
    introTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
    },
    introText: {
        fontSize: 15,
        color: '#222',
        lineHeight: 22,
    },
    introMore: {
        color: '#888',
        fontSize: 13,
        marginTop: 12,
    },
    introCard: {
        marginHorizontal: 20,
        marginTop: 0,
    },
});

export default styles;
