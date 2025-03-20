import axios from 'axios';

const W3W_API_KEY = 'LBPB0057'; // 발급받은 API 키로 교체

// 좌표를 3단어 주소로 변환
export const getThreeWordAddress = async (lat, lng) => {
    try {
        const response = await axios.get(
            `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}`
        );
        return response.data.words; // 3단어 주소 반환
    } catch (error) {
        console.error('Error fetching 3-word address:', error);

        // 오류 메시지 반환
        if (error.response && error.response.status === 402) {
            return 'API 호출 한도를 초과했습니다. 유료 플랜으로 업그레이드하세요.';
        } else {
            return '주소를 가져오는 중 오류가 발생했습니다.';
        }
    }
};

// 3단어 주소를 좌표로 변환
export const getCoordinatesFromWords = async (words) => {
    try {
        const response = await axios.get(
            `https://api.what3words.com/v3/convert-to-coordinates?words=${words}&key=${W3W_API_KEY}`
        );
        return response.data.coordinates;
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        throw error;
    }
};