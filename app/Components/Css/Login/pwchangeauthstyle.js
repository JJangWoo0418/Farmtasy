import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    backButton: {
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#000',
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        height: 64,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        width: 12,
        height: 12,
        backgroundColor: '#333',
    },
    checkboxText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
    input2: {
        flex: 1,
        fontSize: 16,
        paddingRight: 10,
    },
    resendText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
        textDecorationLine: 'underline',
        marginTop: 20,
    },
});

export default styles;