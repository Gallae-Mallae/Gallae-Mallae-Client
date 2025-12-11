<template>
    <div class="folder-list-wrapper">
        <div v-if="loading" class="list-message">
            <p>폴더 목록을 불러오는 중...</p>
        </div>
        <div v-else-if="folders.length === 0" class="list-message">
            <p>아직 폴더가 없습니다. 새 폴더를 만들어 보세요!</p>
        </div>

        <div v-else class="folder-grid">
            <PlaceFolder v-for="folder in folders" :key="folder.id" :folder="folder"
                @folder-click="$emit('folderClick', folder.id)" />
        </div>
    </div>
</template>

<script setup lang="ts">

import PlaceFolder from '@/components/sidebar/PlaceFolder.vue';
import type { PlaceFolderDTO } from '@/types/sidebar';

defineProps<{
    folders: PlaceFolderDTO[];
    loading: boolean;
}>();

defineEmits(['folderClick']); 
</script>

<style scoped>
.folder-list-wrapper {
    /* SideBarMyTab에서 스크롤 관리 */
}

.list-message {
    padding: 20px 15px;
    text-align: center;
    color: var(--color-gray-medium, #6b7280);
}

/* --- 폴더 목록 반복 영역 --- */
.folder-grid {
    /* PlaceFolder 컴포넌트들이 수직으로 나열되는 영역 */
}

</style>