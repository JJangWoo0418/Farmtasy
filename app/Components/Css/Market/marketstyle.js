import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
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
    categoryWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryItem: {
        width: width / 4 - 24,
        alignItems: 'center',
        marginVertical: 8,
        marginHorizontal: 8,
    },
    categoryIcon: {
        width: 50,
        height: 50,
        marginBottom: 4,
    },
    categoryLabel: {
        fontSize: 15,
        color: '#222',
        fontWeight: 'bold',
    },
    foldBtn: {
        alignSelf: 'center',
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 1,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    foldBtnText: {
        color: '#222',
        fontSize: 16,
        fontWeight: 'bold',
    },
    foldBtnDivider: {
        width: 1,
        height: 18,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 10,
    },
    foldBtnHDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        flex: 1,
        alignSelf: 'center',
    },
    specialWrap: {
        flex: 1,
    },
    specialTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#222',
        marginLeft: 20,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        padding: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    productImg: {
        width: 80,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    productInfo: {
        flex: 1,
    },
    timerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timerIcon: {
        width: 14,
        height: 14,
        marginRight: 3,
        tintColor: '#FF4D4F',
    },
    timerText: {
        color: '#FF4D4F',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productTitle: {
        fontSize: 14,
        color: '#222',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    discount: {
        color: '#FF4D4F',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 6,
    },
    originalPrice: {
        color: '#BDBDBD',
        fontSize: 12,
        textDecorationLine: 'line-through',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    freeShip: {
        color: '#00C471',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cartBtn: {
        marginLeft: 8,
        padding: 6,
        borderRadius: 20,
        backgroundColor: '#F5F5F7',
    },
    cartIcon: {
        width: 22,
        height: 22,
        tintColor: '#00C471',
    },
    sellBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#00C471',
        borderRadius: 22,
        paddingHorizontal: 36,
        paddingVertical: 12,
        shadowColor: '#00C471',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sellBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    writeIcon: {
        width: 17,
        height: 17,
        marginLeft: 3,
    },
    writeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 22,
    },
    paperpencilIcon: {
        width: 17,
        height: 17,
    },
});

export default styles; 