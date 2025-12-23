<template>
    <div class="add-folder-card" :class="{ 'is-editing': isEditing }" @click="handleCardClick">
        <div v-if="!isEditing" class="add-content">
            <img src="@/assets/icons/ic_add.png" alt="새 폴더 만들기" class="plus-icon" />
            <span class="label">새 폴더</span>
        </div>

        <div v-else class="edit-content" @click.stop>
            <input ref="inputRef" v-model="folderName" type="text" placeholder="폴더 이름" class="folder-input"
                @keyup.enter="handleConfirm" />
            <div class="button-group">
                <button class="btn confirm-btn" @click="handleConfirm">확인</button>
                <button class="btn cancel-btn" @click="handleCancel">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const emit = defineEmits<{
    (e: 'add', name: string): void;
}>();

const isEditing = ref(false);
const folderName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// 카드 클릭 시 편집 모드로 전환
const handleCardClick = async () => {
    if (!isEditing.value) {
        isEditing.value = true;
        // 입력창에 바로 포커스 주기
        await nextTick();
        inputRef.value?.focus();
    }
};

// 확인 버튼 클릭
const handleConfirm = () => {
    if (folderName.value.trim()) {
        emit('add', folderName.value);
        resetForm();
    } else {
        alert('폴더 이름을 입력해주세요.');
    }
};

// 취소 버튼 클릭
const handleCancel = () => {
    resetForm();
};

const resetForm = () => {
    isEditing.value = false;
    folderName.value = '';
};
</script>

<style scoped>
.add-folder-card {
    width: 100%;
    aspect-ratio: 1 / 1;
    border: 1.5px dashed #e0e0e0;
    border-radius: 12px;
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 18px;
    box-sizing: border-box;
}

.add-folder-card.is-editing {
    border-style: solid;
    cursor: default;
}

.add-folder-card:not(.is-editing):hover {
    border-color: #777;
    background-color: #f4f3f3;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.add-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.plus-icon {
    width: 24px;
    height: 24px;
    opacity: 0.7;
}

.label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #888;
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

.folder-input:focus {
    border-color: #34495e;
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
    font-weight: 400;
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

.btn:hover {
    opacity: 0.9;
}
</style>