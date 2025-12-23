<template>
    <div class="scrap-item-view">
        <ScrapHeader title="제주도 감성 카페" @back="$emit('back')" />

        <div class="item-grid">
            <ScrapItemCard v-for="item in items" :key="item.scrapId" :item="item" />
            <ScrapAddItemCard @click="$emit('add-item')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ScrapDTO } from '@/types/scrap';
import ScrapHeader from '@/components/scrap/ScrapHeader.vue';
import ScrapItemCard from '@/components/scrap/ScrapItemCard.vue';
import ScrapAddItemCard from '@/components/scrap/ScrapAddItemCard.vue';

const props = defineProps<{ folderId: number | null }>();
defineEmits(['back', 'add-item']);

const items = ref<ScrapDTO[]>([
    {
        scrapId: 101,
        folderId: 1,
        title: '바다뷰 카페',
        content: '내용입니다',
        description: '제주도 푸른 바다가 한눈에 보이는 멋진 카페입니다.',
        originalLink: 'https://...',
        imageUrl: 'https://picsum.photos/300'
    },
    {
        scrapId: 102,
        folderId: 1,
        title: '석양 명소',
        content: '내용입니다',
        description: '노을이 질 때 가면 인생샷을 건질 수 있는 곳이에요.',
        originalLink: 'https://...',
        imageUrl: 'https://picsum.photos/301'
    }
]);
</script>

<style scoped>
:deep(.scrap-header) {
    margin-bottom: 6px;
}

.item-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
}

.scrap-item-view {
    display: flex;
    flex-direction: column;
}
</style>