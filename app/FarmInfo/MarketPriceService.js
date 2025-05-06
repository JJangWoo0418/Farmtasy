import { XMLParser } from 'fast-xml-parser';
import * as XLSX from 'xlsx';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import itemCodeData from '../Components/Utils/item_code_data.json';
import { MARKET_API_KEY } from '../Components/API/apikey';
import axios from 'axios';

// 실제 API URL 설정
const BASE_URL = 'http://211.237.50.150:7080/openapi';
const API_BASE_URL = BASE_URL; // axios용 추가

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
  REALTIME_PRICE: 'Grid_20240625000000000654_1',  // 도매시장 실시간 경락 정보
  DAILY_PRICE: 'Grid_20240625000000000653_1'     // 일별 시세 조회를 위한 가상의 그리드 ID
};

// 디버그용: JSON 데이터 확인
console.log('[DEBUG] 로드된 JSON 데이터 샘플:', 
  Array.isArray(itemCodeData) ? itemCodeData.slice(0, 2) : '데이터 형식 오류');

// 선택된 itemCode, varietyCode 기반으로 cmpcd 찾는 함수 수정
const findCmpcd = (itemCode, varietyCode) => {
  const normalizedItemCode = String(itemCode).padStart(2, '0');
  const normalizedVarietyCode = String(varietyCode).padStart(2, '0');
  const matched = itemCodeData.find(item => 
    item.itemCode === normalizedItemCode &&
    item.varietyCode === normalizedVarietyCode
  );
  console.log('[DEBUG] findCmpcd 검색:', { normalizedItemCode, normalizedVarietyCode, matched });
  return matched?.cmpcd || null;
};

// 일별 시세 조회 함수
export async function getDailyPrice({ saledate, whsalcd, large, mid, small }) {
  try {
    // 소분류(small) 파라미터 필수 체크
    if (!small) {
      throw new Error('품종(소분류)을 선택해주세요. 품종별 시세를 확인하기 위해서는 반드시 필요합니다.');
    }

    // 현재 날짜와 선택된 날짜 비교
    const today = new Date();
    const selectedDate = new Date(saledate);
    
    // 미래 날짜인 경우 어제 날짜로 조회
    if (selectedDate > today) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      saledate = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    }

    // URL 파라미터 조립 (소분류 필수 포함)
    const url = `${BASE_URL}/${MARKET_API_KEY}/xml/${GRID_IDS.DAILY_PRICE}/1/100?SALEDATE=${saledate}&WHSALCD=${whsalcd}&LARGE=${large}&MID=${mid}&SMALL=${small}`;
    console.log('[DEBUG] 시세 조회 URL:', url);

    const response = await fetch(url);
    console.log('[DEBUG] 시세 조회 응답 상태:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();
    console.log('[DEBUG] XML 응답:', xmlData);

    const jsonData = await parseXmlToJson(xmlData);
    console.log('[DEBUG] 파싱된 JSON:', jsonData);

    const rows = jsonData?.Grid_20240625000000000653_1?.row;
    if (!rows) {
      console.log('[DEBUG] row 데이터 없음');
      throw new Error(`선택하신 ${getCropName(large, mid, small).cropName}의 ${saledate} 날짜 시세 데이터가 없습니다. 해당 작물의 출하 시기가 아닐 수 있습니다.`);
    }

    if (!Array.isArray(rows)) {
      rows = [rows];
    }

    if (rows.length === 0) {
      console.log('[DEBUG] 조회된 데이터 없음');
      throw new Error(`선택하신 ${getCropName(large, mid, small).cropName}의 ${saledate} 날짜 시세 데이터가 없습니다. 해당 작물의 출하 시기가 아닐 수 있습니다.`);
    }

    return rows;
  } catch (error) {
    console.error('[ERROR] 시세 데이터 로드 실패:', error);
    throw error;
  }
}

// 작물 이름, 품목명, 품종명 동적 조회 함수
function getCropName(large, mid, small) {
  // itemCodeData에서 코드 일치하는 항목 찾기
  const found = itemCodeData.find(item =>
    item.categoryCode?.toString() === large?.toString() &&
    item.itemCode?.toString() === mid?.toString() &&
    item.varietyCode?.toString() === small?.toString()
  );
  if (found) {
    return {
      cropName: found.categoryName,
      itemName: found.itemName,
      varietyName: found.varietyName
    };
  }
  // 일치하는 항목이 없으면 빈 값 반환
  return {
    cropName: '',
    itemName: '',
    varietyName: ''
  };
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