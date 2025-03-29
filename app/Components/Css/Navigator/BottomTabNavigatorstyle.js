import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 5,
        paddingBottom: 20,
    },
    tabItem: {
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    icon: {
        width: 24,
        height: 24,
        marginBottom: 2,
    },
    label: {
        fontSize: 12,
        color: '#333',
    },
    activeTab: {
        backgroundColor: '#eee',
    },
    activeLabel: {
        fontWeight: 'bold',
        color: '#000',
    },
});