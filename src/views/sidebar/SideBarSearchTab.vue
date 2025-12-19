<template>
    <div class="side-bar-search-tab">

        <SearchForm ref="searchFormRef" @search-submit="handleSearch" @reset="handleReset" />

        <div class="search-results-area">
            <PlaceCardList :places="hasSearched ? searchResults : recommendations" :loading="loading"
                :has-searched="hasSearched" @item-click="handleMapHighlight" @mark="handleMarkAction" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineExpose, watch } from 'vue';
import SearchForm from '@/components/sidebar/SearchForm.vue';
import PlaceCardList from '@/components/sidebar/PlaceCardList.vue';
import type { PlaceCardDTO, SearchData } from '@/types/sidebar';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import { getAttractions, type MapAttractionParams } from '@/api/attraction';
import image from '@/assets/images/example_place.png';

// Props 정의
const props = defineProps<{
    selectedCategory?: number | null;
}>();

// Emits 정의
const emit = defineEmits<{
    (e: 'map-highlight', placeId: string, coords: { lat: number, lng: number }): void;
    (e: 'mark-action', placeId: string): void;
    (e: 'state-change', hasSearched: boolean): void;
    (e: 'search-request', data: SearchData): void;
    (e: 'reset-request'): void;
}>();

// 상태 관리
const loading = ref(false);
const hasSearched = ref(false);
const searchResults = ref<PlaceCardDTO[]>([]); // 검색 결과
const recommendations = ref<PlaceCardDTO[]>([]); // 검색 전 추천 장소
const searchFormRef = ref<InstanceType<typeof SearchForm> | null>(null);

// 더미데이터 생성 유틸 (추천용으로 유지)
const CATEGORY_CODES = [39, 40, 12, 32];
const DEFAULT_CATEGORY_CODE = 99;

const createDummyPlace = (baseQuery: string, index: number, isRec: boolean): PlaceCardDTO => {
    const rawCode = CATEGORY_CODES[index % CATEGORY_CODES.length];
    const code: number = rawCode ?? DEFAULT_CATEGORY_CODE;
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
    // TODO: 실제 추천 API 호출
    await new Promise(resolve => setTimeout(resolve, 600));

    loading.value = false;

    // 추천 장소 더미 데이터 생성
    recommendations.value = Array.from({ length: 8 }, (_, i) =>
        createDummyPlace("추천 장소", i, true)
    );
};

const handleSearch = async (data: SearchData) => {
    // 검색어, 지역, 카테고리 중 하나라도 있으면 검색 허용
    if (!data.query.trim() && !data.sidoCode && !props.selectedCategory) {
        alert("검색어, 지역 또는 카테고리를 선택해주세요.");
        return;
    }

    // 부모에게 검색 요청 이벤트 전달 (Search.vue에서 fetchMapMarkers 호출 유도)
    emit('search-request', data);
};

const handleReset = () => {
    hasSearched.value = false;
    searchResults.value = [];
    emit('reset-request');
};

// 부모 컴포넌트(Search.vue)에서 호출할 수 있는 함수
const searchByBounds = async (bounds: any, filters: any = {}) => {
    // const sw = bounds.getSouthWest();
    // const ne = bounds.getNorthEast();
    
    // loading.value = true;
    hasSearched.value = true;
    // searchResults.value = [];

    // const params: MapAttractionParams = {
    //     zoomLevel: 3, 
    //     southWestLat: sw.getLat(),
    //     southWestLng: sw.getLng(),
    //     northEastLat: ne.getLat(),
    //     northEastLng: ne.getLng(),
    //     ...filters
    // };

    // try {
    //     const data = await getAttractions(params);
    //     searchResults.value = data.map(item => ({
    //         id: String(item.attrId),
    //         imageUrl: item.imageUrl || image,
    //         title: item.title,
    //         address: item.address,
    //         latitude: item.latitude,
    //         longitude: item.longitude,
    //         categoryCode: item.categoryCode,
    //         categoryName: getCategoryDisplayName(item.categoryCode),
    //         likes: item.likes,
    //         isLiked: item.isLiked,
    //         isMarked: item.isMarked,
    //     }));
    // } catch (error) {
    //     console.error("Failed to fetch sidebar attractions:", error);
    // } finally {
    //     loading.value = false;
    // }
};


// 현재 검색 폼 데이터 반환 함수
const getCurrentSearchData = (): SearchData | null => {
    if (searchFormRef.value) {
        return searchFormRef.value.getFormData();
    }
    return null;
};

// PlaceCardList로부터 받은 이벤트 처리
const handleMapHighlight = (placeId: string, coords: { lat: number, lng: number }) => {
    emit('map-highlight', placeId, coords);
};

const handleMarkAction = (placeId: string) => {
    emit('mark-action', placeId);
};

// hasSearched 상태 변경 감지하여 부모에게 알림
watch(hasSearched, (newVal) => {
    emit('state-change', newVal);
});

onMounted(() => {
    fetchRecommendations();
});

// 외부 노출
defineExpose({
    searchByBounds,
    getCurrentSearchData
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