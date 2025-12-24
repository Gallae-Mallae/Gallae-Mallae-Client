import imgAttraction from '@/assets/images/관광지.png';
import imgCulture from '@/assets/images/문화시설.png';
import imgFestival from '@/assets/images/축제.png';
import imgCourse from '@/assets/images/여행코스.png';
import imgLeports from '@/assets/images/레포츠.png';
import imgLodge from '@/assets/images/숙박.png';
import imgShopping from '@/assets/images/쇼핑.png';
import imgFood from '@/assets/images/음식.png';
import imgCafe from '@/assets/images/카페.png';
import imgDefault from '@/assets/images/example_place.png';

export function getCategoryVarName(code: number): string {
  switch (String(code)) {
    case "12":
      return "ATTRACTION"; // 관광지
    case "14":
      return "CULTURE"; // 문화시설
    case "15":
      return "FESTIVAL"; // 축제/공연/행사
    case "25":
      return "COURSE"; // 여행코스
    case "28":
      return "LEPORTS"; // 레포츠
    case "32":
      return "LODGE"; // 숙박
    case "38":
      return "SHOPPING"; // 쇼핑
    case "39":
      return "FOOD"; // 식당
    case "40":
      return "CAFE"; // 카페
    default:
      return "default";
  }
}

export function getCategoryDisplayName(code: number): string {
  switch (String(code)) {
    case "12":
      return "관광지";
    case "14":
      return "문화시설";
    case "15":
      return "축제/공연/행사";
    case "25":
      return "여행코스";
    case "28":
      return "레포츠";
    case "32":
      return "숙박";
    case "38":
      return "쇼핑";
    case "39":
      return "식당";
    case "40":
      return "카페";
    default:
      return "기타";
  }
}

export function getCategoryDefaultImage(code: number): string {
  switch (String(code)) {
    case "12":
      return imgAttraction;
    case "14":
      return imgCulture;
    case "15":
      return imgFestival;
    case "25":
      return imgCourse;
    case "28":
      return imgLeports;
    case "32":
      return imgLodge;
    case "38":
      return imgShopping;
    case "39":
      return imgFood;
    case "40":
      return imgCafe;
    default:
      return imgDefault;
  }
}