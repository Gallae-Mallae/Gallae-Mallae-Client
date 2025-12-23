<template>
    <div class="place-folder" @click="$emit('folderClick', folder.id)">

        <div class="folder-icon-wrapper" :style="iconBgStyle">
            <img src="@/assets/icons/ic_mark_filled.png" alt="폴더 아이콘" class="folder-icon" />
        </div>

        <div class="folder-info">
            <h4 class="folder-name">{{ folder.name }}</h4>
            <p class="folder-count">{{ folder.placeCount }}개의 장소</p>
        </div>

        <button class="delete-folder-btn" @click.stop="$emit('delete', folder.id)">
            <img src="@/assets/icons/ic_close.png" alt="삭제" />
        </button>

    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import type { PlaceFolderDTO } from '@/types/sidebar';

const props = defineProps<{
    folder: PlaceFolderDTO;
}>();

defineEmits(['folderClick', 'delete']);

const iconBgStyle = computed(() => {
    return {
        backgroundColor: props.folder.color
    };
});
</script>

<style scoped>
.place-folder {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    cursor: pointer;
    background-color: var(--color-white);
    transition: background-color 0.2s;
    border-bottom: 1px solid var(--color-gray-light, #e5e7eb);
}

.place-folder:hover {
    background-color: var(--color-gray-lightest, #f8f8f8);
}

.folder-icon-wrapper {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    /* 폴더 색상 인라인 스타일로 주입 */
}

.folder-icon {
    width: 14px;
    height: 14px;
}

.folder-info {
    flex-grow: 1;
}

.folder-name {
    font-size: var(--font-size-title, 1rem);
    font-weight: 500;
    margin: 0;
}

.folder-count {
    font-size: var(--font-size-address, 0.8rem);
    color: var(--color-gray-medium, #6b7280);
    margin: 0;
}

.delete-folder-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: transform 0.2s;
}

.delete-folder-btn:hover {
    transform: scale(1.2);
}

.delete-folder-btn img {
    width: 18px;
    height: 18px;
    filter: brightness(0); /* 검정색으로 강제 설정 */
}
</style>