import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        marginTop: -20,
    },
    backIcon: {
        width: 28,
        height: 28,
        marginRight: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginRight: 36, // 아이콘 공간 확보
    },
    desc: {
        fontSize: 22,
        color: '#222',
        marginBottom: 24,
        marginTop: 20,
        lineHeight: 24,
        fontWeight: '400',
        fontWeight: 'bold',
    },
    highlight: {
        color: '#22CC6B',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 26,
        marginBottom: 8,
        color: '#222',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    unit: {
        fontSize: 16,
        color: '#888',
        marginLeft: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 5,
        
    },
    toggleBtn: {
        flex: 1,
        borderWidth: 3,
        borderColor: '#ABABAB',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginRight: 22, // 버튼 사이 간격 넉넉하게!
        backgroundColor: '#fff',
    },
    toggleBtnActive: {
        borderColor: '#22CC6B',
        backgroundColor: '#F6FFF9',
    },
    toggleText: {
        fontSize: 16,
        color: '#888',
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: '#22CC6B',
    },
    infoText: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        marginBottom: 24,
        textAlign: 'center',
    },
    calcBtn: {
        backgroundColor: '#22CC6B',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 90,
    },
    calcBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    inputWrapper: {
        position: 'relative',
        width: '100%',
        marginBottom: 12,
    },
    inputWithUnit: {
        borderWidth: 3,
        borderColor: '#ABABAB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        paddingRight: 40, // 평 단위 공간 확보
        marginTop: 5,
    },
    unitInInput: {
        position: 'absolute',
        right: 16,
        top: 8,
        bottom: 0,
        textAlignVertical: 'center',
        color: 'black',
        fontSize: 16,
        height: '100%',
        textAlign: 'center',
        lineHeight: 44, // 입력창 높이에 맞게 조정(필요시)
    },
});