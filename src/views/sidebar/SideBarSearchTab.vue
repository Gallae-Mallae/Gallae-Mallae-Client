<template>
    <div class="side-bar-search-tab">
        <SearchForm ref="searchFormRef" @search-submit="handleSearch" @reset="handleReset" />

        <div v-if="isPlanPage" class="drag-guide-container">
            <div class="guide-item memo-guide" draggable="true" @dragstart="handleMemoDragStart">
                <p>📝 이곳을 드래그하여 일정표에 메모를 추가하세요.</p>
            </div>
        </div>

        <div class="search-results-area" ref="scrollContainer" @scroll="handleScroll">
            <PlaceCardList 
                :places="searchResults" 
                :loading="loading"
                :has-searched="hasSearched" 
                @item-click="handleItemClick" 
                @mark="handleMarkAction" 
                @like="handleLikeAction"
            />
            
            <div v-if="isLoadMore" class="loading-more">
                불러오는 중...
            </div>
        </div>

        <AttractionDetailModal
            :isVisible="isModalOpen"
            :loading="modalLoading"
            :detail="selectedDetail"
            @close="isModalOpen = false"
            @show-on-map="handleShowOnMap"
            @mark="handleModalMark"
            @share="(id) => console.log('Share attraction:', id)"
            @like="handleModalLike"
        />

        <FolderSelectModal 
            ref="folderSelectRef"
            :isVisible="isFolderSelectOpen" 
            :attractionId="selectedAttractionId"
            @close="isFolderSelectOpen = false"
            @open-create="isFolderCreateOpen = true"
            @saved="() => { /* 필요 시 목록 갱신 */ }"
        />

        <FolderCreateModal 
            :isVisible="isFolderCreateOpen" 
            @close="isFolderCreateOpen = false"
            @created="() => { folderSelectRef?.fetchFolders(); }"
        />

    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // useRoute 추가
import SearchForm from '@/components/sidebar/SearchForm.vue';
import PlaceCardList from '@/components/sidebar/PlaceCardList.vue';
import AttractionDetailModal from '@/components/sidebar/AttractionDetailModal.vue';
import FolderSelectModal from '@/components/sidebar/FolderSelectModal.vue';
import FolderCreateModal from '@/components/sidebar/FolderCreateModal.vue';
import type { PlaceCardDTO, SearchData } from '@/types/sidebar';
import { getSidebarAttractions, getAttractionDetail, toggleLike, type SidebarAttractionParams, type AttractionDetailResponse } from '@/api/attraction';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import { useLikeStore } from '@/stores/like';
import { useAuthStore } from '@/stores/auth';
import image from '@/assets/images/example_place.png';

const likeStore = useLikeStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); // test2: 현재 경로 확인용

// [test2 병합] 플랜 페이지 여부 확인
const isPlanPage = computed(() => route.path.startsWith('/plan/'));

// Props 정의
const props = defineProps<{
    selectedCategory?: number | null;
}>();

// Emits 정의
const emit = defineEmits<{
    (e: 'map-highlight', placeId: string, coords: { lat: number, lng: number, level?: number }): void;
    (e: 'mark-action', placeId: string): void;
    (e: 'state-change', hasSearched: boolean): void;
    (e: 'search-request', data: SearchData): void;
    (e: 'reset-request'): void;
}>();

// 상태 관리
const loading = ref(false); 
const isLoadMore = ref(false); 
const hasSearched = ref(false);
const searchResults = ref<PlaceCardDTO[]>([]); 
const searchFormRef = ref<InstanceType<typeof SearchForm> | null>(null);

// 모달 관련 상태
const isModalOpen = ref(false);
const modalLoading = ref(false);
const selectedDetail = ref<AttractionDetailResponse | null>(null);

// 폴더 저장 모달 상태
const isFolderSelectOpen = ref(false);
const isFolderCreateOpen = ref(false);
const selectedAttractionId = ref<number | null>(null);
const folderSelectRef = ref<any>(null);

// 페이지네이션 상태
const page = ref(0);
const hasNext = ref(false);
const currentBounds = ref<any>(null);
const currentFilters = ref<any>({});
const scrollContainer = ref<HTMLElement | null>(null);

const fetchSidebarData = async (loadMore: boolean = false) => {
    if (!currentBounds.value) return;
    
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
            likes: item.likeCount || 0,
            isLiked: likeStore.isLiked(item.attractionId),
            isMarked: false,
        }));

        if (loadMore) {
            searchResults.value = [...searchResults.value, ...newItems];
        } else {
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
    searchResults.value = [];
    currentBounds.value = null;
    currentFilters.value = {};
    page.value = 0;
    hasNext.value = false;
    emit('reset-request');
};

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

const openDetailModal = async (placeId: string) => {
    isModalOpen.value = true;
    modalLoading.value = true;
    selectedDetail.value = null;

    try {
        const detail = await getAttractionDetail(Number(placeId));
        selectedDetail.value = detail;
    } catch (error) {
        console.error("Failed to fetch attraction detail:", error);
        alert("상세 정보를 불러오는데 실패했습니다. 메인 페이지로 돌아갑니다.");
        isModalOpen.value = false;
        router.push('/');
    } finally {
        modalLoading.value = false;
    }
};

const handleItemClick = (placeId: string, coords: { lat: number, lng: number }) => {
    openDetailModal(placeId);
};

const handleShowOnMap = (detail: AttractionDetailResponse) => {
    emit('map-highlight', String(detail.attractionId), { 
        lat: detail.latitude, 
        lng: detail.longitude,
        level: 2
    });
};

const handleMarkAction = (placeId: string) => {
    if (!authStore.isLoggedIn) {
        alert("로그인이 필요한 기능입니다.");
        return;
    }
    selectedAttractionId.value = Number(placeId);
    isFolderSelectOpen.value = true;
};

const handleModalMark = (placeId: number) => {
    selectedAttractionId.value = placeId;
    isFolderSelectOpen.value = true;
};

const handleLikeAction = (placeId: string) => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }

    const item = searchResults.value.find(p => p.id === placeId);
    if (!item) return;

    const targetItem = item as PlaceCardDTO;
    const wasLiked = targetItem.isLiked;
    likeStore.toggleLikeState(Number(placeId));
    targetItem.isLiked = !wasLiked;
    targetItem.likes += wasLiked ? -1 : 1;

    toggleLike(Number(placeId)).catch(err => {
        console.error("좋아요 토글 API 실패 (사이드바):", err);
        likeStore.toggleLikeState(Number(placeId));
        targetItem.isLiked = wasLiked;
        targetItem.likes += wasLiked ? -1 : 1;
        alert("좋아요 처리에 실패했습니다.");
    });
};

const handleModalLike = (placeId: number) => {
    const index = searchResults.value.findIndex(p => p.id === String(placeId));
    if (index === -1) return;

    const item = searchResults.value[index] as PlaceCardDTO;
    
    const isNowLiked = likeStore.isLiked(placeId);
    
    if (item.isLiked !== isNowLiked) {
        const newLikes = item.likes + (isNowLiked ? 1 : -1);
        
        searchResults.value[index] = {
            ...item,
            isLiked: isNowLiked,
            likes: newLikes
        } as PlaceCardDTO;
    }
};

// [test2 병합] 메모 드래그 시작 핸들러
const handleMemoDragStart = (e: DragEvent) => {
    if (e.dataTransfer) {
        e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 20, 20);

        const memoData = {
            type: 'MEMO',
            title: '' 
        };

        e.dataTransfer.setData('MEMO', JSON.stringify(memoData));
        e.dataTransfer.effectAllowed = 'move';
    }
};

watch(hasSearched, (newVal) => {
    emit('state-change', newVal);
});

defineExpose({
    searchByBounds,
    getCurrentSearchData,
    openDetailModal
});
</script>

<style scoped>
.side-bar-search-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* [test2 병합] 드래그 가이드 스타일 */
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
    border-color: var(--color-primary, #777);
    background-color: #f4f3f3;
    color: #333;
}

.memo-guide:active {
    cursor: grabbing;
}

.search-results-area {
    flex-grow: 1;
    padding: 0 15px 40px; /* feature 16의 패딩 유지 */
    overflow-y: auto;
}

.loading-more {
    text-align: center;
    padding: 10px;
    font-size: 13px;
    color: #999;
}
</style>