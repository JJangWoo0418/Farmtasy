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
      const CROP_CATEGORIES = {
        '과일류': ['사과', '배', '복숭아', '포도', '감귤', '단감'],
        '채소류': ['배추', '무', '양파', '마늘', '대파', '얼갈이배추', '양배추', '시금치', '상추', '수박', '오이', '호박', '토마토'],
        '특용작물': ['참깨', '땅콩', '들깨', '느타리버섯', '팽이버섯', '새송이버섯'],
        '곡류': ['쌀', '찹쌀', '보리', '콩', '팥', '녹두', '메밀'],
        '서류': ['감자', '고구마']
      };

      let allItems = [];
      let currentPage = 1;
      const pageSize = 5; // API 제한으로 인해 5개로 고정

      // 전체 데이터를 가져올 때까지 반복
      while (currentPage <= 10) { // 최대 50개 항목까지만 조회 (5개 * 10페이지)
        const url = `${BASE_URL}/sample/xml/${GRID_IDS.ITEM_CODE}/${currentPage}/${pageSize}?ServiceKey=${MARKET_API_KEY}`;
        console.log('[DEBUG] 페이지 요청:', currentPage);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlData = await response.text();
        const jsonData = await parseXmlToJson(xmlData);
        
        if (!jsonData || !jsonData[GRID_IDS.ITEM_CODE] || !jsonData[GRID_IDS.ITEM_CODE].row) {
          break;
        }

        const rows = Array.isArray(jsonData[GRID_IDS.ITEM_CODE].row) 
          ? jsonData[GRID_IDS.ITEM_CODE].row 
          : [jsonData[GRID_IDS.ITEM_CODE].row];

        // 농산물 카테고리에 해당하는 항목만 필터링
        const filteredRows = rows.filter(item => {
          // 대분류 체크
          for (const [category, subcategories] of Object.entries(CROP_CATEGORIES)) {
            if (item.LARGENAME && item.LARGENAME.includes(category)) {
              return true;
            }
            // 중분류/품목명 체크
            if (item.MIDNAME && subcategories.some(sub => item.MIDNAME.includes(sub))) {
              return true;
            }
            if (item.GOODNAME && subcategories.some(sub => item.GOODNAME.includes(sub))) {
              return true;
            }
          }
          return false;
        });

        if (filteredRows.length > 0) {
          allItems = [...allItems, ...filteredRows];
          console.log(`[DEBUG] 필터링된 항목 수:`, filteredRows.length);
        }

        // 검색어가 있는 경우 추가 필터링
        if (searchKeyword) {
          const keyword = searchKeyword.toLowerCase();
          allItems = allItems.filter(item => 
            (item.GOODNAME && item.GOODNAME.toLowerCase().includes(keyword)) ||
            (item.MIDNAME && item.MIDNAME.toLowerCase().includes(keyword)) ||
            (item.LARGENAME && item.LARGENAME.toLowerCase().includes(keyword))
          );
        }

        // 다음 페이지로
        currentPage++;
        
        // API 응답에서 총 개수가 현재까지 조회한 개수보다 작으면 중단
        const totalCount = jsonData[GRID_IDS.ITEM_CODE].totalCnt;
        if (currentPage * pageSize >= totalCount) {
          break;
        }

        // 잠시 대기하여 API 호출 제한 방지
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 중복 제거
      allItems = allItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.LARGE + t.MID + t.SMALL === item.LARGE + item.MID + item.SMALL
        ))
      );

      console.log(`총 ${allItems.length}개의 품목 코드 로드됨`);
      console.log('로드된 품목:', allItems.map(item => ({
        name: item.GOODNAME,
        category: item.LARGENAME,
        subCategory: item.MIDNAME,
        code: item.LARGE + item.MID + item.SMALL
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