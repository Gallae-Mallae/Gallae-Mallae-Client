export interface ContentType {
  code: number;
  name: string;
  cssClass: string; // _category.css에 정의된 태그 클래스와 매칭하기 위함
}

export const contentTypes: ContentType[] = [
  { code: 12, name: "관광지", cssClass: "ATTRACTION" },
  { code: 14, name: "문화시설", cssClass: "CULTURE" },
  { code: 15, name: "축제/공연/행사", cssClass: "FESTIVAL" },
  { code: 25, name: "여행코스", cssClass: "COURSE" },
  { code: 28, name: "레포츠", cssClass: "LEPORTS" },
  { code: 32, name: "숙박", cssClass: "LODGE" },
  { code: 38, name: "쇼핑", cssClass: "SHOPPING" },
  { code: 39, name: "식당", cssClass: "FOOD" },
  { code: 40, name: "카페", cssClass: "CAFE" },
  // 기타는 보통 토글에 없지만 필요하면 추가
];

export function getCategoryDisplayName(code: number): string {
  const type = contentTypes.find((t) => t.code === code);
  return type ? type.name : "기타";
}

// 누락되었던 함수 추가!
export function getCategoryVarName(code: number): string {
  const type = contentTypes.find((t) => t.code === code);
  return type ? type.cssClass : "ETC";
}
