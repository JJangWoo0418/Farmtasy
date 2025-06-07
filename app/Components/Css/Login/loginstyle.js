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
    Logo: {
        resizeMode: 'contain',
        width: 346,
        height: 114,
        marginBottom: 70,
        marginTop: 70,
        resizeMethod: "auto"
    },
    Logo2: {
        resizeMode: 'contain',
        width: 350,
        height: 130,
        marginBottom: 50,
        resizeMethod: "auto"
    },
    GreenTalkButton: {
        resizeMode: 'contain',
        width: 172,
        height: 57,
        marginBottom: 10,
        resizeMethod: "auto"
    },
    orgText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 100,
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
        width: 273,
        height: 42,
        marginBottom : 20,
    },
    kakaoText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3C1E1E',
    },
    phoneText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 100,
        textDecorationLine: 'underline'
    },
});
