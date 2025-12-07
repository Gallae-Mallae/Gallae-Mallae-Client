import type { Sido, Gugun } from '@/types/address';

// --- Sido 더미 데이터 ---
export const sidos: Sido[] = [
    // INSERT INTO `sidos` VALUES (18,1,'서울'),(19,2,'인천'), ...
    { id: 1, code: 18, name: '서울' },
    { id: 2, code: 19, name: '인천' },
    { id: 3, code: 20, name: '대전' },
];

// --- Gugun 더미 데이터 ---
export const guguns: Gugun[] = [
    // 서울 (sidoId: 1)
    // INSERT INTO `guguns` VALUES (235,1,1,'강남구'),(236,1,2,'강동구'), ...
    { id: 235, sidoId: 1, code: 1, name: '강남구' },
    { id: 236, sidoId: 1, code: 2, name: '강동구' },
    { id: 237, sidoId: 1, code: 3, name: '강북구' },
    
    // 인천 (sidoId: 2)
    // INSERT INTO `guguns` VALUES (260,2,1,'강화군'),(261,2,2,'계양구'), ...
    { id: 260, sidoId: 2, code: 1, name: '강화군' },
    { id: 261, sidoId: 2, code: 2, name: '계양구' },

    // 대전 (sidoId: 3)
    // INSERT INTO `guguns` VALUES (270,3,1,'대덕구'),(271,3,2,'동구'), ...
    { id: 270, sidoId: 3, code: 1, name: '대덕구' },
];