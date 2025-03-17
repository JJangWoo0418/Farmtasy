import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#34A853',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
    },
    orgContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    orgRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    orgLogo: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    orgText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    startText: {
        fontSize: 14,
        color: '#34A853',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    kakaoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE500',
        padding: 12,
        borderRadius: 8,
        width: 250,
        justifyContent: 'center',
    },
    kakaoIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    kakaoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C1E1E',
    },
    phoneText: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
    },
});
