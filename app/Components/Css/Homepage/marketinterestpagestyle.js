// marketinterestpagestyle.js
import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 120
    },
    headerTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 108
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    productListContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 80,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 2,
        marginBottom: 2,
        marginLeft: 1
    },
    columnWrapper2: {
        justifyContent: 'space-between',
        paddingHorizontal: 2,
        marginBottom: 2,
        marginLeft: 1,
        marginTop: 5
    },
    productCard: {
        flex: 1,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        minWidth: 0,
        marginTop: -5,
        width: (width - 40) / 2  // 화면 너비에서 여백을 뺀 후 2로 나눔
    },
    productImg: {
        width: (width - 80) / 2,  // 카드 너비에 맞춤
        height: (width - 80) / 2,  // 정사각형 이미지
        borderRadius: 8,
        resizeMode: 'cover',
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    productTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
        width: '100%',
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
        marginTop: 2,
        width: '100%',
    },
    productDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        width: '100%',
    },
    productLocation: {
        fontSize: 12,
        color: '#888',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    productListContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 80,
        flexDirection: 'row',  // 추가
        flexWrap: 'wrap',     // 추가
        justifyContent: 'space-between'  // 추가
    },
    productCard: {
        width: (width - 40) / 2,  // 고정 너비 설정
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#F2F2F2',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        marginTop: -5,
    },
    productImg: {
        width: (width - 80) / 2,
        height: (width - 80) / 2,
        borderRadius: 8,
        resizeMode: 'cover',
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    tabContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',

    },
    tabWrapper: {
        flexDirection: 'row',
        position: 'relative',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    selectedTabText: {
        color: '#22CC6B',
        fontWeight: 'bold',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        width: '33.33%',  // 탭 개수에 따라 조정
        backgroundColor: '#22CC6B',
        zIndex: 0,
    },
});