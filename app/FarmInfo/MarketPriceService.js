import { XMLParser } from 'fast-xml-parser';

// 실제 API URL 설정
const BASE_URL = 'http://211.237.50.150:7080/openapi';
const MARKET_API_KEY = 'ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa';

// XML을 JSON으로 변환하는 유틸리티 함수
const parseXmlToJson = async (xmlString) => {
  try {
    const parser = new XMLParser();
    const result = parser.parse(xmlString);
    return result;
  } catch (error) {
    console.error('[ERROR] XML 파싱 오류:', error);
    throw error;
  }
};

// Grid ID 상수 정의
const GRID_IDS = {
  MARKET_CODE: 'Grid_20240625000000000661_1',    // 도매시장 코드
  GRADE_CODE: 'Grid_20240626000000000663_1',     // 등급 코드
  ORIGIN_CODE: 'Grid_20240626000000000667_1',    // 산지 코드
  ITEM_CODE: 'Grid_20240625000000000661_1',      // 농산물 품목 코드 (수정)
  SETTLEMENT_PRICE: 'Grid_20240625000000000653_1', // 도매시장 정산가격 정보
  REALTIME_PRICE: 'Grid_20240625000000000654_1'  // 도매시장 실시간 경락 정보
};

export const MarketPriceService = {
  // 일일 시세 조회
  async getDailyPrice(cropCode) {
    try {
      const url = `${BASE_URL}/xml/${GRID_IDS.MARKET_CODE}/1/100?ServiceKey=${MARKET_API_KEY}&delngDe=20240322&prdlstCd=${cropCode}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
      
      if (!jsonData || !jsonData[GRID_IDS.MARKET_CODE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.MARKET_CODE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row;
    } catch (error) {
      console.error('일일 시세 조회 오류:', error);
      throw error;
    }
  },

  // 품종별 일일 시세 조회
  async getVarietyPrice(cropCode, varietyCode) {
    try {
      const url = `${BASE_URL}/xml/${GRID_IDS.GRADE_CODE}/1/100?ServiceKey=${MARKET_API_KEY}&prdlstCd=${cropCode}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
      
      if (!jsonData || !jsonData[GRID_IDS.GRADE_CODE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.GRADE_CODE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row;
    } catch (error) {
      console.error('품종별 시세 조회 오류:', error);
      throw error;
    }
  },

  // 시세 비교 (과거 vs 현재)
  async comparePrices(cropCode, startDate, endDate) {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000663_1/1/5?ServiceKey=${MARKET_API_KEY}&startDate=${startDate}&endDate=${endDate}&prdlstCd=${cropCode}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('시세 비교 조회 오류:', error);
      throw error;
    }
  },

  // 지역별 시세 조회
  async getRegionalPrices(cropCode, region) {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000664_1/1/5?ServiceKey=${MARKET_API_KEY}&delngDe=20240322&prdlstCd=${cropCode}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('지역별 시세 조회 오류:', error);
      throw error;
    }
  },

  // 도매시장 코드 조회
  async getMarketCodes() {
    try {
      const url = `http://211.237.50.150:7080/openapi/ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa/xml/${GRID_IDS.MARKET_CODE}/1/100`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
      
      if (!jsonData || !jsonData[GRID_IDS.MARKET_CODE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.MARKET_CODE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row;
    } catch (error) {
      console.error('도매시장 코드 조회 오류:', error);
      throw error;
    }
  },

  // 품목 코드 조회
  async getItemCodes(searchKeyword = '') {
    try {
      let allItems = [];
      let currentPage = 1;
      const pageSize = 100;

      try {
        // API URL 구조 수정: ServiceKey를 경로에 포함
        const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.ITEM_CODE}/${currentPage}/${pageSize}`;
        console.log('[DEBUG] 농산물 품목 코드 조회 URL:', url);
        
        const response = await fetch(url);
        console.log('[DEBUG] 응답 상태:', response.status);
        
        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }
        
        const xmlData = await response.text();
        console.log('[DEBUG] XML 응답:', xmlData);
        
        const jsonData = await parseXmlToJson(xmlData);
        console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
        
        // Grid ID에 맞는 응답 데이터 확인
        const gridData = jsonData[GRID_IDS.ITEM_CODE];
        if (!gridData || !gridData.row || !Array.isArray(gridData.row)) {
          throw new Error('API 응답에 유효한 데이터가 없습니다.');
        }
        
        // 전체 데이터를 일단 저장
        allItems = gridData.row;
        
        // 검색 키워드가 있는 경우 필터링
        if (searchKeyword) {
          allItems = allItems.filter(item => 
            item.CODENAME?.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }
        
        // 시장 코드와 이름으로 매핑
        const marketItems = allItems.map(item => ({
          marketCode: item.CODEID,
          marketName: item.CODENAME
        }));
        
        console.log('[DEBUG] 시장 코드 결과:', marketItems);
        return marketItems;
        
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        throw error;
      }
    } catch (error) {
      console.error('품목 코드 조회 오류:', error);
      throw error;
    }
  },

  // 등급 코드 조회
  async getGradeCodes() {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240626000000000663_1/1/5?ServiceKey=${MARKET_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('등급 코드 조회 오류:', error);
      throw error;
    }
  },

  // 산지 코드 조회
  async getOriginCodes() {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240626000000000667_1/1/5?ServiceKey=${MARKET_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('산지 코드 조회 오류:', error);
      throw error;
    }
  },

  // 도매시장 정산 가격 조회
  async getSettlementPrices(marketCode, itemCode, date) {
    try {
      const url = `${BASE_URL}/${GRID_IDS.SETTLEMENT_PRICE}/1/100?ServiceKey=ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa&marketCd=${marketCode}&itemCd=${itemCode}&saleDate=${date}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
      
      if (!jsonData || !jsonData[GRID_IDS.SETTLEMENT_PRICE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.SETTLEMENT_PRICE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      // 평균가, 최고가, 최저가, 거래량 계산
      const prices = gridData.row.map(item => ({
        marketName: item.MARKETNAME,
        itemName: item.ITEMNAME,
        avgPrice: parseInt(item.AVGP),
        maxPrice: parseInt(item.MAXP),
        minPrice: parseInt(item.MINP),
        volume: parseInt(item.VOLUME)
      }));
      
      return prices;
    } catch (error) {
      console.error('도매시장 정산 가격 조회 오류:', error);
      throw error;
    }
  },

  // 도매시장 실시간 경락 정보 조회
  async getRealTimePrices(marketCode, itemCode) {
    try {
      const url = `${BASE_URL}/${GRID_IDS.REALTIME_PRICE}/1/100?ServiceKey=ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa&marketCd=${marketCode}&itemCd=${itemCode}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      console.log('[DEBUG] 파싱된 JSON:', JSON.stringify(jsonData, null, 2));
      
      if (!jsonData || !jsonData[GRID_IDS.REALTIME_PRICE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.REALTIME_PRICE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      // 시간대별 낙찰가 정보 정리
      const prices = gridData.row.map(item => ({
        marketName: item.MARKETNAME,
        itemName: item.ITEMNAME,
        time: item.TIME,
        price: parseInt(item.PRICE),
        grade: item.GRADE
      }));
      
      return prices;
    } catch (error) {
      console.error('도매시장 실시간 경락 정보 조회 오류:', error);
      throw error;
    }
  }
};