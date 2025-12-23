<template>
    <div class="scrap-folder-view">
        <div class="view-header">
            <h2 class="view-title">나의 스크랩북</h2>
        </div>

        <div class="folder-grid">
            <ScrapAddFolderCard />

            <ScrapFolderCard v-for="folder in scrapStore.folders" :key="folder.folderId" :folder="folder"
                @click="$emit('select-folder', folder.folderId)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ScrapFolderCard from '@/components/scrap/ScrapFolderCard.vue';
import ScrapAddFolderCard from '@/components/scrap/ScrapAddFolderCard.vue';
import { useScrapStore } from '@/stores/scrap';

const scrapStore = useScrapStore();

onMounted(() => {
    scrapStore.loadFolders();
});

defineEmits(['select-folder']);
</script>

<style scoped>
.view-header {
    text-align: center;
    padding-bottom: 12px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: center;
    align-items: center;
}

.view-title {
    font-size: 1.15rem;
    font-weight: bold;
}

.folder-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
}
</style>