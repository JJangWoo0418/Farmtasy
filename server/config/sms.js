const coolsms = require('coolsms-node-sdk').default;

// CoolSMS 설정
const messageService = new coolsms(process.env.COOLSMS_API_KEY, process.env.COOLSMS_API_SECRET);

// SMS 발송 함수
async function sendSMS(phone, verificationCode) {
    try {
        const response = await messageService.sendOne({
            to: phone,
            from: process.env.SENDER_PHONE,
            text: `[Farmtasy] 인증번호: ${verificationCode}\n인증번호를 입력해주세요.`
        });

        return response;
    } catch (error) {
        console.error('SMS 발송 실패:', error);
        throw error;
    }
}

module.exports = { sendSMS }; 