// API 요청 및 데이터 처리를 위한 서비스
import { MARKET_API_KEY } from './apikey';
import axios from 'axios';
import { parseString } from 'xml2js';

// XML 파싱을 위한 Promise 래퍼 함수
const parseXMLAsync = (xmlData) => {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const getItemCodes = async () => {
  try {
    const baseUrl = 'http://211.237.50.150:7080/openapi/';
    const apiPath = 'Grid_20240626000000000668_1';
    const pageSize = 100;
    let currentPage = 1;
    let allItems = [];
    
    // 로깅 추가
    console.log('API 요청 시작...');
    console.log('API Key:', MARKET_API_KEY);

    while (true) {
      const url = `${baseUrl}sample/xml/${apiPath}/${currentPage}/${pageSize}?ServiceKey=${MARKET_API_KEY}`;
      console.log(`페이지 ${currentPage} 요청 중...`);
      
      const response = await axios.get(url);
      const result = await parseXMLAsync(response.data);
      
      // 응답 구조 로깅
      console.log('API 응답 구조:', JSON.stringify(result, null, 2));
      
      if (!result.Grid_20240626000000000668_1?.row) {
        console.log('더 이상 데이터가 없습니다.');
        break;
      }

      const items = result.Grid_20240626000000000668_1.row;
      allItems = [...allItems, ...items];
      
      if (items.length < pageSize) {
        break;
      }
      
      currentPage++;
    }

    console.log(`총 ${allItems.length}개의 아이템 코드를 로드했습니다.`);
    return allItems;
    
  } catch (error) {
    console.error('아이템 코드 로드 중 오류 발생:', error);
    throw error;
  }
}; 