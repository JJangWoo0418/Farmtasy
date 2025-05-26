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
    filterButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 양쪽 끝으로 정렬
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    latestSortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 80, // 최소 너비 설정
        marginBottom: 5,
        marginLeft: 10
    },
    latestSortText: {
        fontSize: 16,
        color: '#222',
        marginRight: 4,
        fontWeight: 'bold',
    },
    dropdownIcon: {
        marginTop: 2,
    },
    freeShippingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginTop: 10
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
        flex: 1,
        marginHorizontal: 5,      // 카드 좌우 간격
        marginVertical: 10,       // 카드 위아래 간격
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1,         // 테두리 두께
        borderColor: '#F2F2F2',   // 테두리 색상 (연한 회색)
        padding: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 3,
        minWidth: 0,
        marginTop: -5
    },
    productImg: {
        width: 150,
        height: 150,
        borderRadius: 8,
        resizeMode: 'cover',
        marginBottom: 8,
        backgroundColor: '#eee',
    },
    productInfo: {
        width: '100%',
        alignItems: 'flex-start',
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
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 2,
        marginTop: 2
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
        bottom: 80,
        backgroundColor: '#22CC6B',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
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
    paperpencilIcon: {
        width: 17,
        height: 17,
        marginLeft: 3,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#555',
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxText: {
        fontSize: 14,
    },
    productListContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    productDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    productLocation: {
        fontSize: 12,
        color: '#888',
    },
    productSize: {
        fontSize: 12,
        color: '#777',
    },
    cartBtnText: {
        color: '#00C471',
        fontSize: 12,
        fontWeight: 'bold',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        zIndex: 999,
    },
    sortOptionsContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sortOptionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sortOptionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    sortOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sortOptionText: {
        fontSize: 16,
        color: '#222',
    },
    cartButton: {
        position: 'absolute',
        left: 20,
        bottom: 80,
        backgroundColor: '#FF4D4F',
        padding: 12,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#FF4D4F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginBottom: 40,
        zIndex: 556,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemCountContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF4D4F',
    },
    cartModalContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    cartModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cartModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    cartItemImage: {
        width: 50,
        height: 50,
        borderRadius: 5,
        marginRight: 10,
    },
    cartItemInfo: {
        flex: 1,
    },
    removeItemButton: {
        marginLeft: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemTitle: {
        fontSize: 14,
        color: '#222',
        marginBottom: 4,
    },
    cartItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
    },
    cartTotal: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    cartTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    checkoutButton: {
        backgroundColor: '#00C471',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    productListContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 80,
    },
    productTitle: {
        fontSize: 15,
        marginBottom: 2,
        color: '#222',
        marginTop: 5
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#D9D9D9',
        minWidth: 80, // 최소 너비 설정
        alignItems: 'center', // 텍스트 중앙 정렬
        marginRight: 5,
        marginBottom: 7
    },
    selectedFilterButton: {
        backgroundColor: '#22CC6B',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    selectedFilterButtonText: {
        color: '#fff',
    },
});

export default styles; 