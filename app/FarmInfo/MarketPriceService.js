import { MARKET_API_KEY } from '../Components/API/apikey';

// 실제 API URL 설정
const BASE_URL = 'http://211.237.50.150:7080/openapi';

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
      const data = await response.text();
      return data;
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
      const data = await response.text();
      return data;
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
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000661_1/1/5?ServiceKey=${MARKET_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('도매시장 코드 조회 오류:', error);
      throw error;
    }
  },

  // 품목 코드 조회
  async getItemCodes() {
    try {
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240626000000000668_1/1/5?ServiceKey=${MARKET_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
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
      const response = await fetch(
        `${BASE_URL}/sample/xml/Grid_20240625000000000654_1/1/5?ServiceKey=${MARKET_API_KEY}&marketCd=${marketCode}&itemCd=${itemCode}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('도매시장 실시간 경락 정보 조회 오류:', error);
      throw error;
    }
  }
};