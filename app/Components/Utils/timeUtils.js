// app/Components/Utils/timeUtils.js
export const getBaseDateTime = () => {
  const now = new Date();

  // 기상청 API는 매 정시 기준, 40분 후부터 데이터를 제공함
  // 예: 12:40 이후 → base_time은 12:00
  let baseDate = now;
  let baseTime = new Date(now.getTime() - 60 * 60 * 1000); // 1시간 전

  const y = baseDate.getFullYear();
  const m = String(baseDate.getMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getDate()).padStart(2, '0');
  const h = String(baseTime.getHours()).padStart(2, '0');
  const min = baseTime.getMinutes();

  const base_date = `${y}${m}${d}`;
  const base_time = `${h}00`;

  return { base_date, base_time };
};
