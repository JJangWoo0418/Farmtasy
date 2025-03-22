// ✅ registerauthstyle.js
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    backButton: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
        marginTop: 20,
    },
    codeInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        height: 64,
        marginBottom: 20,
        justifyContent: 'space-between'
    },
    codeInput: {
        flex: 1,
        fontSize: 16,
        paddingRight: 10,
    },
    timer: {
        fontSize: 14,
        color: '#555',
    },
    button: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
        textDecorationLine: 'underline',
        marginTop: 20,
    },
});
