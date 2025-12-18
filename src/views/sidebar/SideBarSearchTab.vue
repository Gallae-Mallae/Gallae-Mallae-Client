<template>
    <div class="side-bar-search-tab">

        <SearchForm @search-submit="handleSearch" />

        <div class="search-results-area">
            <PlaceCardList :places="hasSearched ? searchResults : recommendations" :loading="loading"
                :has-searched="hasSearched" @item-click="handleMapHighlight" @mark="handleMarkAction" />
        </div>

    </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
import SearchForm from '@/components/sidebar/SearchForm.vue';
import PlaceCardList from '@/components/sidebar/PlaceCardList.vue';
import type { PlaceCardDTO } from '@/types/sidebar';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import image from '@/assets/images/example_place.png';

interface SearchData {
    sidoName: string;
    sidoCode: number;
    gugunName: string;
    gugunCode: number;
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
    // 검색어가 없어도 지역 선택만으로 검색 가능할 수 있으므로 query check는 상황에 따라 조절
    // 여기서는 일단 query가 있거나 지역이 선택되었으면 검색 허용
    if (!data.query.trim() && !data.sidoCode) {
        alert("검색어 또는 지역을 선택해주세요.");
        return;
    }

    loading.value = true;
    hasSearched.value = true;
    searchResults.value = [];

    console.log(`[Search] Request: ${data.sidoName}(${data.sidoCode}) ${data.gugunName}(${data.gugunCode}) - "${data.query}"`);

    // TODO: 실제 API 호출 시 data.sidoCode, data.gugunCode 사용
    await new Promise(resolve => setTimeout(resolve, 800));

    loading.value = false;

    // 검색 결과 더미 데이터 생성
    const displayQuery = data.query || data.gugunName || data.sidoName;
    const numResults = Math.floor(Math.random() * 5) + 3;
    searchResults.value = Array.from({ length: numResults }, (_, i) =>
        createDummyPlace(displayQuery, i, false)
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

</script>

<style scoped>
.side-bar-search-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.search-results-area {
    flex-grow: 1;
    padding: 0 15px 15px;
    overflow-y: auto;
}
</style>