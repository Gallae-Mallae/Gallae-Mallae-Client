<script setup lang="ts">
import { ref, defineExpose, watch, nextTick } from 'vue';
import SearchForm from '@/components/sidebar/SearchForm.vue';
import PlaceCardList from '@/components/sidebar/PlaceCardList.vue';
import type { PlaceCardDTO, SearchData } from '@/types/sidebar';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import { getSidebarAttractions, type SidebarAttractionParams } from '@/api/attraction';
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
const loading = ref(false); // 초기 로딩 (리스트 전체 교체)
const isLoadMore = ref(false); // 추가 로딩 (하단 스피너)
const hasSearched = ref(false);
const searchResults = ref<PlaceCardDTO[]>([]); // 검색 결과 (또는 초기 추천)
const searchFormRef = ref<InstanceType<typeof SearchForm> | null>(null);

// 페이지네이션 상태
const page = ref(0);
const hasNext = ref(false);
const currentBounds = ref<any>(null);
const currentFilters = ref<any>({});
const scrollContainer = ref<HTMLElement | null>(null);

const fetchSidebarData = async (loadMore: boolean = false) => {
    if (!currentBounds.value) return;
    
    // 로딩 상태 처리
    if (loadMore) {
        if (isLoadMore.value || loading.value) return;
        isLoadMore.value = true;
    } else {
        if (loading.value) return;
        loading.value = true;
    }
    
    try {
        const sw = currentBounds.value.getSouthWest();
        const ne = currentBounds.value.getNorthEast();
        
        const params: SidebarAttractionParams = {
            southWestLat: sw.getLat(),
            southWestLng: sw.getLng(),
            northEastLat: ne.getLat(),
            northEastLng: ne.getLng(),
            zoomLevel: 5, 
            ...currentFilters.value,
            page: page.value,
            size: 20
        };

        const response = await getSidebarAttractions(params);

        const newItems = response.attractions.map(item => ({
            id: String(item.attractionId),
            imageUrl: item.imageUrl || image,
            title: item.title || "이름 없음",
            address: item.address || "주소 없음",
            latitude: item.latitude,
            longitude: item.longitude,
            categoryCode: item.contentTypeId,
            categoryName: getCategoryDisplayName(item.contentTypeId),
            likes: 0,
            isLiked: false,
            isMarked: false,
        }));

        if (loadMore) {
            // 기존 데이터 유지, 새 데이터 추가
            searchResults.value = [...searchResults.value, ...newItems];
        } else {
            // 데이터 교체
            searchResults.value = newItems;
        }

        hasNext.value = response.hasNext;
        page.value = response.nowPage;

    } catch (error) {
        console.error("Failed to fetch sidebar attractions:", error);
    } finally {
        loading.value = false;
        isLoadMore.value = false;
    }
};

const handleSearch = async (data: SearchData) => {
    if (!data.query.trim() && !data.sidoCode && !props.selectedCategory) {
        alert("검색어, 지역 또는 카테고리를 선택해주세요.");
        return;
    }
    emit('search-request', data);
};

const handleReset = () => {
    hasSearched.value = false;
    // 초기화 시 리스트를 비울지, 아니면 초기 추천 상태로 돌아갈지는 정책 결정 필요
    // 여기서는 일단 비움 (Search.vue에서 bounds와 함께 다시 호출해주지 않는 이상)
    // 하지만 "초기상태"로 돌아가려면 Search.vue에서 reset-request 처리 시 
    // 현재 bounds로 다시 searchByBounds(..., isInitial=true)를 호출해야 함.
    searchResults.value = [];
    currentBounds.value = null;
    currentFilters.value = {};
    page.value = 0;
    hasNext.value = false;
    emit('reset-request');
};

// 부모 컴포넌트(Search.vue)에서 호출할 수 있는 함수
// isInitial: true이면 "추천 장소" 모드(hasSearched=false), false이면 "검색 결과" 모드
const searchByBounds = async (bounds: any, filters: any = {}, isInitial: boolean = false) => {
    hasSearched.value = !isInitial;
    currentBounds.value = bounds;
    currentFilters.value = filters;
    page.value = 0;
    hasNext.value = false;
    
    if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0;
    }

    await fetchSidebarData(false);
};

// 스크롤 핸들러 (무한 스크롤)
const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const { scrollTop, clientHeight, scrollHeight } = target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (hasNext.value && !loading.value && !isLoadMore.value) {
            page.value += 1;
            fetchSidebarData(true);
        }
    }
};

const getCurrentSearchData = (): SearchData | null => {
    if (searchFormRef.value) {
        return searchFormRef.value.getFormData();
    }
    return null;
};

const handleMapHighlight = (placeId: string, coords: { lat: number, lng: number }) => {
    emit('map-highlight', placeId, coords);
};

const handleMarkAction = (placeId: string) => {
    emit('mark-action', placeId);
};

watch(hasSearched, (newVal) => {
    emit('state-change', newVal);
});

defineExpose({
    searchByBounds,
    getCurrentSearchData
});

</script>

<template>
    <div class="side-bar-search-tab">

        <SearchForm ref="searchFormRef" @search-submit="handleSearch" @reset="handleReset" />

        <div class="search-results-area" ref="scrollContainer" @scroll="handleScroll">
            <!-- loading은 초기 로딩일 때만 true -->
            <PlaceCardList 
                :places="searchResults" 
                :loading="loading"
                :has-searched="hasSearched" 
                @item-click="handleMapHighlight" 
                @mark="handleMarkAction" 
            />
            
            <!-- 추가 로딩 인디케이터 -->
            <div v-if="isLoadMore" class="loading-more">
                불러오는 중...
            </div>
        </div>

    </div>
</template>

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

.loading-more {
    text-align: center;
    padding: 10px;
    font-size: 13px;
    color: #999;
}
</style>