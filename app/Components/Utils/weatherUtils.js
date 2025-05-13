// CSV 파일에서 과거 기온 데이터를 읽어오는 함수수
export const getHistoricalTemperature = async (date) => {
  try {
    const response = await fetch('../Utils/ta_20250420034032.csv');
    const csvText = await response.text();
    
    // CSV 파싱
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    // 같은 월/일의 과거 데이터 필터링
    const targetMonth = date.getMonth() + 1;
    const targetDay = date.getDate();
    
    const historicalData = lines.slice(1).map(line => {
      const [dateStr, region, avgTemp, minTemp, maxTemp] = line.split(',');
      const [year, month, day] = dateStr.split('-').map(Number);
      
      return {
        date: new Date(year, month - 1, day),
        region,
        avgTemp: parseFloat(avgTemp),
        minTemp: parseFloat(minTemp),
        maxTemp: parseFloat(maxTemp)
      };
    }).filter(data => 
      data.date.getMonth() + 1 === targetMonth && 
      data.date.getDate() === targetDay
    );
    
    // 평균값 계산
    const avgMinTemp = historicalData.reduce((sum, data) => sum + data.minTemp, 0) / historicalData.length;
    const avgMaxTemp = historicalData.reduce((sum, data) => sum + data.maxTemp, 0) / historicalData.length;
    
    return {
      minTemp: Math.round(avgMinTemp * 10) / 10,
      maxTemp: Math.round(avgMaxTemp * 10) / 10
    };
  } catch (error) {
    console.error('과거 기온 데이터 읽기 오류:', error);
    return null;
  }
}; 