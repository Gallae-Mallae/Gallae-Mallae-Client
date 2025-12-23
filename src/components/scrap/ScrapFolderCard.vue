<template>
    <div class="folder-card" :class="{ 'is-editing': isEditing }"
        :style="!isEditing && folder.folderImageUrl ? { backgroundImage: `url(${folder.folderImageUrl})` } : {}">

        <template v-if="!isEditing">
            <div class="card-actions">
                <button class="action-button edit-button" @click.stop="startEdit">
                    <img src="@/assets/icons/ic_edit_scrap.png" alt="수정" class="action-icon" />
                </button>
                <button class="action-button delete-button" @click.stop="handleDelete">
                    <img src="@/assets/icons/ic_delete_scrap.png" alt="삭제" class="action-icon" />
                </button>
            </div>

            <div class="card-content" @click="$emit('click')">
                <div class="card-info">
                    <h3 class="folder-name">{{ folder.name }}</h3>
                    <p class="link-count">{{ folder.scrapCount || 0 }}개의 링크</p>
                </div>
            </div>
        </template>

        <div v-else class="edit-content" @click.stop>
            <input ref="inputRef" v-model="editName" type="text" class="folder-input" @keyup.enter="handleConfirm"
                @keyup.esc="handleCancel" />
            <div class="button-group">
                <button class="btn confirm-btn" @click="handleConfirm">확인</button>
                <button class="btn cancel-btn" @click="handleCancel">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { ScrapFolderDTO } from '@/types/scrap';
import { useScrapStore } from '@/stores/scrap';

const props = defineProps<{ folder: ScrapFolderDTO }>();
const emit = defineEmits(['click']);

const scrapStore = useScrapStore();
const isEditing = ref(false);
const editName = ref(props.folder.name);
const inputRef = ref<HTMLInputElement | null>(null);

const startEdit = async () => {
    isEditing.value = true;
    editName.value = props.folder.name;
    await nextTick();
    inputRef.value?.focus();
};

const handleConfirm = async () => {
    const trimmedName = editName.value.trim();
    if (trimmedName && trimmedName !== props.folder.name) {
        try {
            await scrapStore.editFolder(props.folder.folderId, trimmedName);
            isEditing.value = false;
        } catch (error) {
            console.error('폴더 수정 실패:', error);
        }
    } else {
        isEditing.value = false;
    }
};

const handleCancel = () => {
    isEditing.value = false;
    editName.value = props.folder.name;
};

const handleDelete = async () => {
    try {
        await scrapStore.removeFolder(props.folder.folderId);
    } catch (error) {
        console.error('폴더 삭제 실패:', error);
    }
};
</script>

<style scoped>
.folder-card {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    background-color: #b0b0b0;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
}

.folder-card:not(.is-editing):hover {
    filter: brightness(0.9);
}

.folder-card.is-editing {
    background-image: none !important;
    background-color: #ffffff;
    border: 1.5px solid #e0e0e0;
    cursor: default;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 18px;
    box-sizing: border-box;
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
    opacity: 0.7;
}

.action-button:hover {
    opacity: 1;
}

.action-icon {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1);
}

.card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    padding: 12px;
    background-color: rgba(0, 0, 0, 0.05);
}

.folder-name {
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
}

.link-count {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.75rem;
    margin: 2px 0 0;
}

.edit-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.folder-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #dcdcdc;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    box-sizing: border-box;
}

.button-group {
    display: flex;
    gap: 8px;
}

.btn {
    flex: 1;
    padding: 6px 0;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
}

.confirm-btn {
    background-color: #1a1f27;
    color: white;
}

.cancel-btn {
    background-color: #e9ecef;
    color: #495057;
}
</style>