<template>
  <div class="place-card-list">
    
    <div v-if="hasSearched" class="list-header search-mode">
      <h4 class="result-title">{{ strings.SEARCH_PLACE }}</h4>
    </div>
    <div v-else class="list-header recommend-mode">
      <h4 class="recommend-title">{{ strings.RECOMMEND_PLACE }}
        <span class="subtitle"></span>
      </h4>
    </div>

    <div v-if="loading" class="list-message">
        <p>{{ strings.SEARCH_WAITING }}</p>
    </div>
    <div v-else-if="hasSearched && places.length === 0" class="list-message">
        <p>검색 결과 문제있는 경우</p>
    </div>
    <div v-else-if="places.length === 0 && !hasSearched" class="list-message">
        <p>추천 장소 문제있는 경우</p>
    </div>
    
    <div v-else class="search-results-container">
      <SearchResult 
        v-for="place in places" 
        :key="place.id" 
        :place="place"
        @item-click="handleItemClick"
        @mark="handleMarkAction"
        @share="handleShareAction"
      />
    </div>
    
  </div>
</template>

<script setup lang="ts">
import strings from '@/assets/values/strings.sidebar.json';
import SearchResult from '@/components/sidebar/SearchResult.vue'; 
import type { PlaceCardDTO } from '@/types/place';

// --- Props 정의 ---
const props = defineProps<{
    /* 목록에 표시할 장소 데이터 배열 (검색 결과 또는 추천 장소) */
    places: PlaceCardDTO[];
    /* 로딩 상태인지 */
    loading: boolean;
    /* 검색이 실행된 상태인지 */
    hasSearched: boolean;
}>();

const emit = defineEmits(['itemClick', 'mark', 'share']);

const handleItemClick = (placeId: string, coords: { lat: number, lng: number }) => {
    console.log(`[PlaceCardList] 아이템 클릭: ${placeId}`);
    emit('itemClick', placeId, coords);
};

const handleMarkAction = (placeId: string) => {
    console.log(`[PlaceCardList] 마크 이벤트 수신: ${placeId}`);
    emit('mark', placeId); 
};

const handleShareAction = (placeId: string) => {
    console.log(`[PlaceCardList] 공유 이벤트 수신: ${placeId}`);
    emit('share', placeId); 
};

</script>

<style scoped>
.place-card-list {
  padding-bottom: 20px;
}

.list-header {
    padding: 10px 15px;
    border-top: 1px solid var(--color-gray-light);
    border-bottom: 1px solid var(--color-gray-light);
    margin-bottom: 0;
}

.recommend-mode {
    border-top: none;
}

.result-title, .recommend-title {
    font-size: var(--font-size-body, 1rem);
    font-weight: 600;
    color: var(--color-primary-dark);
    margin: 0;
}

.subtitle {
    font-weight: 400;
    color: var(--color-gray-medium);
    margin-left: 8px;
    font-size: var(--font-size-small, 0.85rem);
}

.list-message {
    text-align: center;
    padding: 20px 15px;
    color: var(--color-gray-medium);
    font-size: var(--font-size-body);
}

.search-results-container {
    /* 목록 전체에 대한 추가적인 스타일 여기에 추가 */
}

</style>