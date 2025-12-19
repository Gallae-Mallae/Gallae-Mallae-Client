<template>
    <div class="side-bar-search-tab">

        <SearchForm @search-submit="handleSearch" />

        <div v-if="isPlanPage" class="drag-guide-container">
            <div class="guide-item memo-guide" draggable="true" @dragstart="handleMemoDragStart">
                <p>📝 메모를 드래그하여 일정표에 추가하세요.</p>
            </div>
            <div class="guide-item place-guide">
                <p>💡 장소를 드래그하여 일정표에 추가하세요.</p>
            </div>
        </div>

        <div class="search-results-area">
            <PlaceCardList :places="hasSearched ? searchResults : recommendations" :loading="loading"
                :has-searched="hasSearched" @item-click="handleMapHighlight" @mark="handleMarkAction" />
        </div>

    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import SearchForm from '@/components/sidebar/SearchForm.vue';
import PlaceCardList from '@/components/sidebar/PlaceCardList.vue';
import type { PlaceCardDTO } from '@/types/sidebar';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import image from '@/assets/images/example_place.png';

const route = useRoute();
const isPlanPage = computed(() => route.path.startsWith('/plan/'))

interface SearchData {
    sido: string;
    gugun: string;
    query: string;
}

// 상태 관리
const loading = ref(false);
const hasSearched = ref(false);
const searchResults = ref<PlaceCardDTO[]>([]); // 검색 결과
const recommendations = ref<PlaceCardDTO[]>([]); // 검색 전 추천 장소

// 더미데이터 생성
const CATEGORY_CODES = [39, 40, 12, 32];
const DEFAULT_CATEGORY_CODE = 99;

const createDummyPlace = (baseQuery: string, index: number, isRec: boolean): PlaceCardDTO => {

    const rawCode = CATEGORY_CODES[index % CATEGORY_CODES.length];
    const code: number = rawCode ?? DEFAULT_CATEGORY_CODE;

    // 카테고리 코드에 맞는 카테고리 이름
    const name = getCategoryDisplayName(code);

    return {
        id: `p-${(isRec ? 'rec-' : 'search-')}${index}`,
        imageUrl: image,
        title: `${baseQuery} ${index + 1}`,
        address: `서울시 강남구 테스트동 ${100 + index}`,
        latitude: 37.55 + index * 0.005,
        longitude: 127.0 + index * 0.005,
        categoryCode: code,
        categoryName: name,
        likes: Math.floor(Math.random() * 5000),
        isLiked: index % 2 === 0,
        isMarked: index % 3 === 0,
    };
};

const fetchRecommendations = async () => {
    loading.value = true;
    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 600));

    loading.value = false;

    // 추천 장소 더미 데이터 생성
    recommendations.value = Array.from({ length: 8 }, (_, i) =>
        createDummyPlace("추천 장소", i, true)
    );
};

const handleSearch = async (data: SearchData) => {
    if (!data.query.trim()) {
        alert("검색어를 입력해 주세요.");
        return;
    }

    loading.value = true;
    hasSearched.value = true;
    searchResults.value = [];

    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 800));

    loading.value = false;

    // 검색 결과 더미 데이터 생성
    const numResults = Math.floor(Math.random() * 5) + 3;
    searchResults.value = Array.from({ length: numResults }, (_, i) =>
        createDummyPlace(data.query, i, false)
    );
};

// PlaceCardList로부터 받은 이벤트 처리
const handleMapHighlight = (placeId: string, coords: { lat: number, lng: number }) => {
    console.log(`[SearchTab] 지도 하이라이트 요청: ID ${placeId} at (${coords.lat}, ${coords.lng})`);
};

const handleMarkAction = (placeId: string) => {
    console.log(`[SearchTab] 북마크/좋아요 토글 요청: ID ${placeId}`);
};

onMounted(() => {
    fetchRecommendations();
});

const handleMemoDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
        // 1. 드래그 이미지 설정 (선택 사항)
        e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 20, 20);

        // 2. 'MEMO'라는 이름표를 붙여서 데이터 포장
        const memoData = {
            type: 'MEMO',
            title: '새 메모' // 일정표에 생성될 때의 기본 이름
        };

        // 3. 데이터를 'MEMO' 키로 저장
        e.dataTransfer.setData('MEMO', JSON.stringify(memoData));
        e.dataTransfer.effectAllowed = 'move';
    }
};

</script>

<style scoped>
.side-bar-search-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.drag-guide-container {
    padding: 10px 15px;
}

.guide-item {
    padding: 10px 12px;
    border: 1px dashed #d1d1d1;
    border-radius: 6px;
    margin-bottom: 6px;
    background-color: white;
    font-size: 12px;
    color: #666;
}

.guide-item p {
    margin: 0;
}

.memo-guide {
    cursor: grab;
    transition: all 0.2s;
}

.memo-guide:hover {
    border-color: var(--color-primary, #4a90e2);
    background-color: #f0f7ff;
    color: #333;
}

.memo-guide:active {
    cursor: grabbing;
}

.place-guide {
    background-color: #fafafa;
    border-style: solid;
    border-color: #efefef;
    margin-bottom: 0;
}

.search-results-area {
    flex-grow: 1;
    padding: 0 15px;
    overflow-y: auto;
}
</style>