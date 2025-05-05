import { XMLParser } from 'fast-xml-parser';
import * as XLSX from 'xlsx';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import itemCodeData from '../Components/Utils/item_code_data.json';
import { MARKET_API_KEY } from '../Components/API/apikey';

// 실제 API URL 설정
const BASE_URL = 'http://211.237.50.150:7080/openapi';

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

// 디버그용: JSON 데이터 확인
console.log('[DEBUG] 로드된 JSON 데이터 샘플:', 
  Array.isArray(itemCodeData) ? itemCodeData.slice(0, 2) : '데이터 형식 오류');

// 하드코딩된 품목 데이터
const ITEM_CODES = { 
  fruits: [
    { '품목코드': '100', '품목명': '사과', '분류명': '과일류' },
    { '품목코드': '101', '품목명': '배', '분류명': '과일류' },
    { '품목코드': '102', '품목명': '복숭아', '분류명': '과일류' },
    { '품목코드': '103', '품목명': '포도', '분류명': '과일류' },
    { '품목코드': '104', '품목명': '감귤', '분류명': '과일류' },
    { '품목코드': '105', '품목명': '단감', '분류명': '과일류' }
  ],
  vegetables: [
    { '품목코드': '200', '품목명': '고추', '분류명': '채소류' },
    { '품목코드': '201', '품목명': '마늘', '분류명': '채소류' },
    { '품목코드': '202', '품목명': '양파', '분류명': '채소류' },
    { '품목코드': '203', '품목명': '무', '분류명': '채소류' },
    { '품목코드': '204', '품목명': '배추', '분류명': '채소류' },
    { '품목코드': '205', '품목명': '당근', '분류명': '채소류' }
  ]
};

// 도매시장 정산가격 정보 조회 (시세)
export async function getDailyPrice({ saledate, whsalcd, large, mid, small, cmpcd }) {
  console.log('[DEBUG] 시세 조회 파라미터:', { saledate, whsalcd, large, mid, small, cmpcd });

  // Grid ID를 반드시 문자열로 고정
  let url = `${BASE_URL}/${MARKET_API_KEY}/xml/Grid_20240625000000000653_1/1/100`;
  url += `?AUCNGDE=${saledate}`;
  url += `&WHSALCD=${whsalcd}`;
  if (large) url += `&LARGE=${large}`;
  if (mid) url += `&MID=${mid}`;
  if (small) url += `&SMALL=${small}`;
  if (cmpcd) url += `&CMPCD=${cmpcd}`;

  console.log(`[DEBUG] 시세 조회 날짜(AUCNGDE): ${saledate}`);
  console.log('[DEBUG] 시세 조회 URL:', url);

  try {
    const response = await fetch(url);
    console.log('[DEBUG] 시세 조회 응답 상태:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new XMLParser();
    const result = parser.parse(xmlText);
    console.log('[DEBUG] 시세 조회 파싱 결과:', result);

    // row 추출 및 배열화
    const grid = result['Grid_20240625000000000653_1'];
    let rows = grid && grid.row;
    if (!Array.isArray(rows)) {
      rows = rows ? [rows] : [];
    }
    if (rows.length === 0) {
      throw new Error('시세 데이터를 찾을 수 없습니다.');
    }
    return rows;
  } catch (error) {
    console.error('[ERROR] 시세 데이터 로드 실패:', error);
    throw error;
  }
}

const MarketPriceService = {
  getDailyPrice,
  // 품종별 일일 시세 조회
  async getVarietyPrice(cropCode, varietyCode) {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.GRADE_CODE}/1/100?prdlstCd=${cropCode}`;
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
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.GRADE_CODE}/1/100?startDate=${startDate}&endDate=${endDate}&prdlstCd=${cropCode}`;
      console.log('[DEBUG] 요청 URL:', url);
      
      const response = await fetch(url);
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
  async getRegionalPrices({ saledate, whsalcd, large, mid, small, cmpcd }) {
    // 필수 파라미터 체크
    if (!saledate || !whsalcd) {
      console.error('필수 파라미터 누락:', { saledate, whsalcd });
      return null;
    }

    let url = `${BASE_URL}/${MARKET_API_KEY}/xml/Grid_0000001/1/100?SALEDATE=${saledate}&WHSALCD=${whsalcd}`;
    
    // 선택 파라미터 추가
    if (large) url += `&LARGE=${large}`;
    if (mid) url += `&MID=${mid}`;
    if (small) url += `&SMALL=${small}`;
    if (cmpcd) url += `&CMPCD=${cmpcd}`;

    console.log('전국 시세 API 요청 URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const xmlData = await response.text();
      const jsonData = await parseXmlToJson(xmlData);
      
      if (!jsonData || !jsonData[GRID_IDS.SETTLEMENT_PRICE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.SETTLEMENT_PRICE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row.map(item => ({
        AUCNGDE: item.AUCNGDE,
        MRKTNM: item.MARKETNAME || item.MRKTNM,
        ITEM_NAME: item.ITEMNAME || item.ITEM_NAME,
        AVGPRI: item.AVGP || item.AVGPRI,
        MAXPRC: item.MAXP || item.MAXPRC,
        MINPRC: item.MINP || item.MINPRC,
        AUCTQY: item.VOLUME || item.AUCTQY
      }));
    } catch (error) {
      console.error('전국 시세 조회 실패:', error);
      return null;
    }
  },

  // 도매시장 코드 조회
  async getMarketCodes() {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.MARKET_CODE}/1/100`;
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

  // 품목 코드 조회 (JSON 데이터 사용)
  async getItemCodes(searchKeyword = '') {
    try {
      console.log('[DEBUG] 품목 코드 조회 시작');
      console.log('[DEBUG] 사용자 선택 품목:', searchKeyword);
      console.log('[DEBUG] 전체 데이터 개수:', itemCodeData.length);
      
      // 데이터 구조 분석
      const categories = new Set();
      itemCodeData.forEach(item => {
        categories.add(`${item.categoryCode}:${item.categoryName}`);
      });
      console.log('[DEBUG] 전체 카테고리 목록:', Array.from(categories));
      
      // 과일류와 채소류 카테고리 정의
      const fruitCategories = ['6:과실류', '8:과일과채류'];
      const vegetableCategories = [
        '9:과채류',
        '10:엽경채류',
        '11:근채류',
        '12:조미채소류',
        '13:양채류',
        '14:산채류'
      ];
      
      console.log('[DEBUG] 사용할 카테고리:', {
        과일: fruitCategories,
        채소: vegetableCategories
      });
      
      // 과일류와 채소류로 분류
      const categorizedItems = {
        fruits: itemCodeData.filter(item => 
          fruitCategories.includes(`${item.categoryCode}:${item.categoryName}`)
        ),
        vegetables: itemCodeData.filter(item => 
          vegetableCategories.includes(`${item.categoryCode}:${item.categoryName}`)
        )
      };
      
      // 검색어가 없는 경우 전체 데이터 반환
      if (!searchKeyword || typeof searchKeyword !== 'string') {
        return categorizedItems;
      }
      
      // 검색어가 있는 경우 필터링
      const keyword = searchKeyword.toLowerCase();
      const filteredData = {
        fruits: categorizedItems.fruits.filter(item => 
          (item.itemName || '').toLowerCase().includes(keyword) ||
          (item.varietyName || '').toLowerCase().includes(keyword)
        ),
        vegetables: categorizedItems.vegetables.filter(item => 
          (item.itemName || '').toLowerCase().includes(keyword) ||
          (item.varietyName || '').toLowerCase().includes(keyword)
        )
      };
      
      console.log('[DEBUG] 검색어:', keyword);
      console.log('[DEBUG] 검색 결과:', {
        fruits: filteredData.fruits.map(item => ({
          categoryName: item.categoryName,
          itemName: item.itemName,
          varietyName: item.varietyName
        })),
        vegetables: filteredData.vegetables.map(item => ({
          categoryName: item.categoryName,
          itemName: item.itemName,
          varietyName: item.varietyName
        }))
      });
      
      return filteredData;
    } catch (error) {
      console.error('[ERROR] 품목 코드 조회 오류:', error);
      throw error;
    }
  },

  // 등급 코드 조회
  async getGradeCodes() {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.GRADE_CODE}/1/100`;
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
      console.error('등급 코드 조회 오류:', error);
      throw error;
    }
  },

  // 산지 코드 조회
  async getOriginCodes() {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.ORIGIN_CODE}/1/100`;
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
      
      if (!jsonData || !jsonData[GRID_IDS.ORIGIN_CODE]) {
        throw new Error('API 응답이 비어있습니다.');
      }
      
      const gridData = jsonData[GRID_IDS.ORIGIN_CODE];
      
      if (!gridData.row || !Array.isArray(gridData.row)) {
        throw new Error('API 응답에 유효한 데이터가 없습니다.');
      }
      
      return gridData.row;
    } catch (error) {
      console.error('산지 코드 조회 오류:', error);
      throw error;
    }
  },

  // 도매시장 정산 가격 조회
  async getSettlementPrices(marketCode, itemCode, date) {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.SETTLEMENT_PRICE}/1/100?AUCNGDE=${date}`;
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
  async getRealTimePrices(marketCode, itemCode, date) {
    try {
      const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.REALTIME_PRICE}/1/100?AUCNGDE=${date}`;
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

export default MarketPriceService;