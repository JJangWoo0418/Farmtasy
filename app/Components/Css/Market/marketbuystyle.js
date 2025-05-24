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
    selectedCategoryContainer: {
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    selectedCategoryText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    productList: {
        flex: 1,
        padding: 15,
    },
    comingSoonText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    filterRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    latestSortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    latestSortText: {
        fontSize: 14,
        color: '#888',
        marginRight: 5,
    },
    dropdownIcon: {
        marginTop: 0,
    },
    freeShippingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bbb',
        marginRight: 6,
        backgroundColor: '#fff',
    },
    checkboxText: {
        fontSize: 14,
        color: '#888',
    },
});

export default styles; 