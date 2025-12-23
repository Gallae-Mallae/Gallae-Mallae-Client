<template>
    <div class="scrap-folder-view">
        <div class="view-header">
            <h2 class="view-title">나의 스크랩북</h2>
        </div>

        <div class="folder-grid">
            <ScrapAddFolderCard @add="handleAddNewFolder" />

            <ScrapFolderCard v-for="folder in folders" :key="folder.folderId" :folder="folder"
                @click="$emit('select-folder', folder.folderId)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ScrapFolderDTO } from '@/types/scrap';
import ScrapFolderCard from '@/components/scrap/ScrapFolderCard.vue';
import ScrapAddFolderCard from '@/components/scrap/ScrapAddFolderCard.vue';

// 임시 더미 데이터
const folders = ref<ScrapFolderDTO[]>([
    { folderId: 1, name: '제주도 감성 카페', folderImageUrl: 'https://picsum.photos/200', itemCount: 2 },
    { folderId: 2, name: '서귀포 맛집 리스트', folderImageUrl: 'https://picsum.photos/201', itemCount: 7 }
]);

defineEmits(['select-folder', 'add-folder']);

const handleAddNewFolder = (name: string) => {
    const newFolder: ScrapFolderDTO = {
        folderId: Date.now(), // 임시 ID
        name: name,
        folderImageUrl: `https://picsum.photos/200?sig=${Date.now()}`,
        itemCount: 0
    };
    folders.value.unshift(newFolder); // 맨 앞에 추가
};
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