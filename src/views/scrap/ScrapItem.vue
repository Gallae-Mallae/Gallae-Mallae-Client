<template>
    <div class="scrap-item-view">
        <ScrapHeader :title="currentFolderName" @back="$emit('back')" />

        <div class="item-grid">
            <ScrapAddItemCard @click="$emit('add-item')" />
            <ScrapItemCard v-for="item in sortedScraps" :key="item.scrapId" :item="item" @edit="handleEditItem"
                @delete="handleDeleteItem" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useScrapStore } from '@/stores/scrap';
import ScrapHeader from '@/components/scrap/ScrapHeader.vue';
import ScrapItemCard from '@/components/scrap/ScrapItemCard.vue';
import ScrapAddItemCard from '@/components/scrap/ScrapAddItemCard.vue';

const props = defineProps<{ folderId: number }>();
const emit = defineEmits(['back', 'add-item', 'edit-item']);

const scrapStore = useScrapStore();

const sortedScraps = computed(() => {
    if (!scrapStore.scraps || scrapStore.scraps.length === 0) return [];

    return [...scrapStore.scraps].sort((a, b) => {

        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        if (dateB === dateA) {
            return b.scrapId - a.scrapId;
        }

        return dateB - dateA;
    });
});

const currentFolderName = computed(() => {
    const folder = scrapStore.folders.find(f => f.folderId === props.folderId);
    return folder ? folder.name : '스크랩북';
});

onMounted(async () => {
    if (props.folderId) {
        await scrapStore.loadScraps(props.folderId);
    }
});

onUnmounted(() => {
    scrapStore.clearScraps();
});

const handleEditItem = (item: any) => {
    emit('edit-item', item);
};

const handleDeleteItem = async (scrapId: number) => {
    await scrapStore.removeScrap(props.folderId, scrapId);
};
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