<template>
    <div class="search-result-item" @click="handlePlaceClick">
        <PlaceCard :place="place" @mark="handleMark" @share="handleShare" />
    </div>
</template>

<script setup lang="ts">

import PlaceCard from '@/components/sidebar/PlaceCard.vue';
import type { PlaceCardData } from '@/types/place';

const props = defineProps<{
    place: PlaceCardData
}>();

const emit = defineEmits(['itemClick', 'mark', 'share']);

/* 장소 블록 전체 클릭 시 실행되는 로직 */
const handlePlaceClick = () => {
    console.log(`[SearchResult] 장소 클릭: ${props.place.title}`);
    emit('itemClick', props.place.id, {
        lat: props.place.latitude,
        lng: props.place.longitude
    });
};

/* PlaceCard에서 전달된 mark 이벤트를 처리 및 상위로 전달 */
const handleMark = (placeId: string) => {
    console.log(`[SearchResult] 북마크 요청: ${placeId}`);
    emit('mark', placeId);
};

const handleShare = (placeId: string) => {
    console.log(`[SearchResult] 공유 요청: ${placeId}`);
    emit('share', placeId);
};
</script>

<style scoped>
.search-result-item {
    border-bottom: 1px solid var(--color-gray-light, #e5e7eb);
    transition: background-color 0.2s;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-item:hover {
    background-color: var(--color-gray-lightest, #f8f8f8);
}
</style>