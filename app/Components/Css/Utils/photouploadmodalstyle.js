import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        zIndex: 110,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 15,
        paddingBottom: 80,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sheetTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    sheetClose: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sheetOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    sheetItem: {
        alignItems: 'center',
    },
    sheetIcon: {
        width: 40,
        height: 40,
        marginBottom: 8,
    },
    sheetIcon3: {
        width: 45,
        height: 40,
        marginBottom: 8,
    },
    sheetLabel: {
        fontSize: 14,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 100,
    },
});
