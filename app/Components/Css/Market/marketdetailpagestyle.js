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
        paddingTop: 10,
        paddingBottom: 12,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        marginLeft: 50,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconBtn: {
        marginLeft: 16,
    },
    scrollArea: {
        flex: 1,
        paddingHorizontal: 18,
        backgroundColor: '#fff',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 8,
    },
    profileImg: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: 10,
    },
    userInfoContainer: {
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        color: '#888',
        fontSize: 13,
        marginTop: 2,
    },
    profileInfo: {
        flex: 1,
    },
    profileRegion: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
    },
    profileTime: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginTop: 10,
        marginBottom: 6,
        borderTopWidth: 1,
        borderColor: '#B2B2B2',
        paddingTop: 15,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 14,
        borderBottomWidth: 1,
        borderColor: '#B2B2B2',
        paddingBottom: 15,
    },
    content: {
        fontSize: 15,
        color: '#222',
        lineHeight: 22,
        marginBottom: 18,
        whiteSpace: 'pre-line',
    },
    productImg: {
        width: 357,
        height: 357,
        marginBottom: 14,
        backgroundColor: '#eee',
    },
    noticeText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#888',
        paddingVertical: 6,
        paddingHorizontal: 18,
        marginTop: 20,
    },
    inquiryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingVertical: 15,
        borderTopColor: '#B2B2B2',
        paddingHorizontal: -20,
        borderBottomColor: '#B2B2B2',
    },
    inquiryCountText: {
        fontSize: 16,
        color: '#222',
        marginRight: 10,
        fontWeight: 'bold',
    },
    inquiryDetailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inquiryDetailBtnText: {
        fontSize: 14,
        color: '#888',
        marginRight: 4,
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        zIndex: 10,
    },
    bottomHeartBtn: {
        padding: 10,
        marginRight: 10,
    },
    orderBtn: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 14,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        borderWidth: 2,
        borderColor: '#22CC6B',
    },
    orderBtn2: {
        backgroundColor: '#22CC6B',
        borderRadius: 8,
        paddingVertical: 14,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    orderBtnText: {
        color: '#22CC6B',
        fontWeight: 'bold',
        fontSize: 15,
    },
    orderBtnText2: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    viewMoreButton: {
        marginTop: 10,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#22CC6B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewMoreButtonText: {
        color: '#22CC6B',
        fontSize: 15,
        fontWeight: 'bold',
    },
    heartBox: {
        width: 40, // 정사각형 크기
        height: 40,
        borderWidth: 2,
        borderColor: '#222', // 테두리 색상
        borderRadius: 10,    // 모서리 둥글게 (원하면 0으로)
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // 배경색
        padding: 10,
        marginRight: 5,
    },
});

export default styles;