import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getMyLikedIds } from '@/api/attraction'; // API 함수는 곧 추가할 예정

export const useLikeStore = defineStore('like', () => {
    // 내가 좋아요 누른 장소의 ID들을 저장하는 Set
    const likedPlaceIds = ref<Set<number>>(new Set());

    // 좋아요 여부 확인 (O(1))
    const isLiked = (placeId: number) => {
        return likedPlaceIds.value.has(placeId);
    };

    // 토글 액션 (UI에서 즉시 반영)
    const toggleLikeState = (placeId: number) => {
        if (likedPlaceIds.value.has(placeId)) {
            likedPlaceIds.value.delete(placeId);
        } else {
            likedPlaceIds.value.add(placeId);
        }
    };
    
    // 서버에서 내 좋아요 목록 가져와서 초기화
    const fetchMyLikes = async () => {
        try {
            const ids = await getMyLikedIds();
            likedPlaceIds.value = new Set(ids);
            console.log('[LikeStore] 내 좋아요 목록 로드:', likedPlaceIds.value);
        } catch (error) {
            console.error('[LikeStore] 좋아요 목록 조회 실패:', error);
            // 비로그인 상태 등에서는 실패할 수 있으므로 에러를 삼킴
        }
    };

    // 스토어 초기화 (로그아웃 시)
    const clearLikes = () => {
        likedPlaceIds.value.clear();
    };

    return { 
        likedPlaceIds, 
        isLiked, 
        toggleLikeState,
        fetchMyLikes,
        clearLikes
    };
});
