import { XMLParser } from 'fast-xml-parser';

// 실제 API URL 설정
const BASE_URL = 'http://211.237.50.150:7080/openapi';
const MARKET_API_KEY = 'ce6bfb5a5e29d7ae2f0255c456bbd9caf2a617877fff580bc94c789df5e02efa';
const PUBLIC_API_KEY = 'YfeBGPATUkui1910T6LK0sBjiPaha6cQHd0DL8q5GrjcrTyYYqXbP0W0pYwCFAcknGLpNPVKaaQH8hh4rJN2jQ%3D%3D';

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
  ITEM_CODE: 'Grid_20240626000000000668_1',      // 품목 코드
  SETTLEMENT_PRICE: 'Grid_20240625000000000653_1', // 도매시장 정산가격 정보
  REALTIME_PRICE: 'Grid_20240625000000000654_1'  // 도매시장 실시간 경락 정보
};

export const MarketPriceService = {
  // 일일 시세 조회
  async getDailyPrice(cropCode) {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000661_1/1/5?ServiceKey=${MARKET_API_KEY}&delngDe=20240322&prdlstCd=${cropCode}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      const jsonData = await parseXmlToJson(xmlData);
      
      if (!jsonData || !jsonData.Grid_20240625000000000661_1) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData.Grid_20240625000000000661_1;
      
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
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000662_1/1/5?ServiceKey=${MARKET_API_KEY}&prdlstCd=${cropCode}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      const jsonData = await parseXmlToJson(xmlData);
      
      if (!jsonData || !jsonData.Grid_20240625000000000662_1) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData.Grid_20240625000000000662_1;
      
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
      const url = `${BASE_URL}/sample/xml/${GRID_IDS.MARKET_CODE}/1/5?ServiceKey=${MARKET_API_KEY}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      
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
      // 농산물 카테고리 정의
      const CROP_CATEGORIES = ['과일', '채소', '곡류', '서류', '특작', '버섯'];
      
      // 샘플 API 제한으로 인해 페이지당 5개씩 가져오기
      const pageSize = 5;
      let allItems = [];
      let currentPage = 1;
      let hasMoreData = true;

      while (hasMoreData && currentPage <= 20) { // 최대 100개까지 가져오기 (5개 * 20페이지)
        const url = `${BASE_URL}/sample/xml/${GRID_IDS.ITEM_CODE}/${currentPage}/${pageSize}?ServiceKey=${MARKET_API_KEY}`;
        console.log('[DEBUG] 요청 URL:', url);
        
        const response = await fetch(url);
        console.log('[DEBUG] 응답 상태:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlData = await response.text();
        console.log('[DEBUG] XML 응답:', xmlData);
        
        const jsonData = await parseXmlToJson(xmlData);
        
        if (!jsonData || !jsonData[GRID_IDS.ITEM_CODE]) {
          break;
        }
        
        const gridData = jsonData[GRID_IDS.ITEM_CODE];
        
        if (!gridData.row) {
          break;
        }

        // 단일 행인 경우 배열로 변환
        const rows = Array.isArray(gridData.row) ? gridData.row : [gridData.row];
        
        // 농산물 카테고리에 해당하는 항목만 필터링
        const filteredRows = rows.filter(item => 
          item.LARGENAME && CROP_CATEGORIES.includes(item.LARGENAME)
        );
        
        allItems = [...allItems, ...filteredRows];
        
        // 더 이상 데이터가 없거나 5개 미만의 결과가 반환된 경우 중단
        if (rows.length < pageSize) {
          hasMoreData = false;
        }
        
        currentPage++;
      }

      // 검색어가 있는 경우 필터링
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        allItems = allItems.filter(item => 
          (item.GOODNAME && item.GOODNAME.toLowerCase().includes(keyword)) ||
          (item.LARGENAME && item.LARGENAME.toLowerCase().includes(keyword)) ||
          (item.MIDNAME && item.MIDNAME.toLowerCase().includes(keyword))
        );
      }

      // 중복 제거 (동일한 품목 코드를 가진 항목 제거)
      allItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.LARGE + t.MID + t.SMALL === item.LARGE + item.MID + item.SMALL
        ))
      );

      console.log(`총 ${allItems.length}개의 품목 코드 로드됨`);
      console.log('로드된 품목:', allItems.map(item => ({
        name: item.GOODNAME,
        category: item.LARGENAME,
        subCategory: item.MIDNAME
      })));
      
      return allItems;
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

  // 도매시장 정산 가격 정보 조회
  async getSettlementPrices(marketCode, itemCode, date) {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000653_1/1/5?ServiceKey=${MARKET_API_KEY}&marketCd=${marketCode}&itemCd=${itemCode}&saleDate=${date}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('도매시장 정산 가격 조회 오류:', error);
      throw error;
    }
  },

  // 도매시장 실시간 경락 정보 조회
  async getRealTimePrices(marketCode, itemCode) {
    try {
      const url = `${BASE_URL}/sample/xml/${GRID_IDS.REALTIME_PRICE}/1/100?ServiceKey=${PUBLIC_API_KEY}&marketCd=${marketCode}&itemCd=${itemCode}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
      console.log('[DEBUG] 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xmlData = await response.text();
      console.log('[DEBUG] XML 응답:', xmlData);
      
      const jsonData = await parseXmlToJson(xmlData);
      
      if (!jsonData || !jsonData[GRID_IDS.REALTIME_PRICE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.REALTIME_PRICE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row;
    } catch (error) {
      console.error('도매시장 실시간 경락 정보 조회 오류:', error);
      throw error;
    }
  }
};