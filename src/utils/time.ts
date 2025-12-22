/* 백엔드 문자열("10:30:00") -> 프론트 숫자(630분), ScheduleBlock 위치 계산할 때 사용 */
export const timeToMinutes = (timeStr: string | undefined | null): number => {

  if (!timeStr) return 0;

  const parts = timeStr.split(':');
  
  const hours = parts[0] ? Number(parts[0]) : 0;
  const minutes = parts[1] ? Number(parts[1]) : 0;

  return hours * 60 + minutes;
};

/* 프론트 숫자(630분) -> 백엔드 문자열("10:30:00"), 일정 드롭하거나 리사이징해서 서버에 저장할 때 사용 */
export const minutesToTimeString = (totalMinutes: number): string => {

  const normalizedMinutes = Math.max(0, totalMinutes % 1440);
  
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};
