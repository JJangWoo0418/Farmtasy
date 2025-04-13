import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        lineHeight: 35,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        height: 64,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 15,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#22CC6B',
        borderColor: '#22CC6B',
    },
    checkboxText: {
        fontSize: 14,
        color: '#666',
    },
    button: {
        backgroundColor: '#d1d1d1',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 400,
        height: 48,
    },
    buttonActive: {
        backgroundColor: '#22CC6B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default styles;
