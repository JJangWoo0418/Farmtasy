import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 25,
        marginTop: 15
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#CACACA',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    loginText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    passwordChange: {
        marginTop: 35,
        marginBottom: 80,
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    orText: {
        marginHorizontal: 10,
        fontSize: 14,
        color: '#666',
    },
    signupButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#E3F8DC',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1
        
    },
    signupText: {
        fontSize: 16,
        color: '#1A8917',
        fontWeight: 'bold',
    },
});

export default styles;
