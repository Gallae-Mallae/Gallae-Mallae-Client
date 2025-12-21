import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getFolderList, getAttractionsInFolder } from '@/api/folder';

export const useMarkStore = defineStore('mark', () => {
    // 내가 저장한 장소의 ID들을 저장 (Set으로 중복 방지 및 빠른 조회)
    const markedPlaceIds = ref<Set<number>>(new Set());

    // 저장 여부 확인
    const isMarked = (placeId: number) => markedPlaceIds.value.has(placeId);

    // 저장 상태 업데이트 (폴더 추가/삭제 시 호출)
    const addMark = (placeId: number) => {
        markedPlaceIds.value.add(placeId);
    };

    const removeMark = (placeId: number) => {
        // 실제로는 여러 폴더에 중복 저장될 수 있으므로, 
        // 완벽하게 하려면 모든 폴더를 다시 체크해야 하지만
        // 일단 UI 즉시 반영을 위해 삭제 처리하거나 전체 다시 불러오기를 권장합니다.
        markedPlaceIds.value.delete(placeId);
    };

    // 서버에서 모든 폴더를 뒤져서 저장된 장소 ID 목록 초기화
    const fetchAllMarks = async () => {
        try {
            const folders = await getFolderList();
            const allIds = new Set<number>();
            
            // 모든 폴더 순회하며 ID 수집
            for (const folder of folders) {
                const attractions = await getAttractionsInFolder(folder.placeFolderId);
                attractions.forEach(a => allIds.add(a.attractionId));
            }
            
            markedPlaceIds.value = allIds;
            console.log('[MarkStore] 저장된 장소 목록 로드 완료:', markedPlaceIds.value.size);
        } catch (error) {
            console.error('[MarkStore] 저장 목록 로드 실패:', error);
        }
    };

    const clearMarks = () => {
        markedPlaceIds.value.clear();
    };

    return { 
        markedPlaceIds, 
        isMarked, 
        addMark,
        removeMark,
        fetchAllMarks,
        clearMarks
    };
});
