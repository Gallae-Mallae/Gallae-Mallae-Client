<template>
    <div class="folder-card" :style="{ backgroundImage: `url(${folder.folderImageUrl})` }">
        <div class="card-actions">
            <button class="action-button edit-button" @click.stop="$emit('edit', folder.folderId)">
                <img src="@/assets/icons/ic_edit_scrap.png" alt="수정" class="action-icon" />
            </button>
            <button class="action-button delete-button" @click.stop="$emit('delete', folder.folderId)">
                <img src="@/assets/icons/ic_delete_scrap.png" alt="삭제" class="action-icon" />
            </button>
        </div>
        <div class="card-overlay">
            <div class="card-info">
                <h3 class="folder-name">{{ folder.name }}</h3>
                <p class="link-count">{{ folder.itemCount || 0 }}개의 링크</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ScrapFolderDTO } from '@/types/scrap';

defineProps<{ folder: ScrapFolderDTO }>();
defineEmits(['edit', 'delete']);
</script>

<style scoped>
.folder-card {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.folder-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
}

.folder-card:hover::before {
    opacity: 1;
}

.card-actions {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.folder-card:hover .card-actions {
    opacity: 1;
}

.action-button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    transition: opacity 0.2s ease;
    opacity: 0.7;
}

.action-button:hover {
    opacity: 1 !important;
}

.action-icon {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.7));
    display: flex;
    align-items: flex-end;
    padding: 12px;
    z-index: 2;
}

.folder-name {
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0;
}

.link-count {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.75rem;
    margin: 2px 0 0;
}
</style>