// app/Components/Utils/regionMapper.js

// 위도/경도에 따라 중기예보용 육상 예보 구역(regId)을 반환합니다.
export function getMidLandRegId(lat, lon) {
    if (lat >= 33.0 && lat < 36.0) {
      if (lon < 126.5) return '11B00000'; // 전라남도
      if (lon < 128.0) return '11C20000'; // 충청남도
      return '11H10000'; // 경상남도
    } else if (lat >= 36.0 && lat < 38.5) {
      if (lon < 127.5) return '11C10000'; // 충청북도
      return '11H20000'; // 경상북도
    } else if (lat >= 38.5) {
      return '11D10000'; // 강원도
    } else {
      return '11B00000'; // fallback: 전라남도
    }
}
