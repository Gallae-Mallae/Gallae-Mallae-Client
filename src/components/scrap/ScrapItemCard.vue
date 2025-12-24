<template>
    <div class="item-card" @click="handleCardClick">
        <img :src="item.imageUrl" :alt="item.title" class="item-image" referrerpolicy="no-referrer" />

        <div class=" item-overlay">
            <div class="item-info">
                <h3 class="item-title">{{ item.title }}</h3>
                <p class="item-desc">{{ item.description }}</p>
            </div>

            <div class="item-actions">
                <button class="action-btn" @click.stop="$emit('edit', item)">
                    <img src="@/assets/icons/ic_edit_scrap.png" alt="수정" class="action-icon" />
                </button>

                <button class="action-btn" @click.stop="handleDelete">
                    <img src="@/assets/icons/ic_delete_scrap.png" alt="삭제" class="action-icon" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ScrapDTO } from '@/types/scrap';

const props = defineProps<{ item: ScrapDTO }>();

const emit = defineEmits(['edit', 'delete']);

const handleCardClick = () => {
    if (props.item.originalLink) {
        window.open(props.item.originalLink, '_blank');
    }
};

const handleDelete = () => {
    if (confirm(`'${props.item.title}' 링크를 삭제하겠습니까?`)) {
        emit('delete', props.item.scrapId);
    }
};
</script>

<style scoped>
.item-card {
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background-color: #f0f0f0;
}

.item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.item-card:hover .item-image {
    transform: scale(1.05);
}

.item-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 16px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 2;
}

.item-card:hover .item-overlay {
    opacity: 1;
}

.item-info {
    text-align: center;
    color: white;
    margin-bottom: 20px;
    width: 100%;
}

.item-title {
    font-size: 0.85rem;
    font-weight: 450;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}

.item-desc {
    font-size: 0.75rem;
    font-weight: 300;
    margin: 0;
    opacity: 0.9;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.3;
}

.item-actions {
    position: absolute;
    bottom: 6px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.action-btn:hover {
    opacity: 1 !important;
}

.action-icon {
    width: 18px;
    height: 18px;
    filter: brightness(0) invert(1);
}
</style>