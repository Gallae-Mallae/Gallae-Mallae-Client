<template>
    <div class="user-dropdown">
        <div class="user-info" :class="{ 'is-editing-mode': isEditing }">
            <div v-if="isEditing" class="edit-group">
                <input ref="inputRef" type="text" v-model="editValue" @keyup.enter="saveNickname" @blur="handleBlur"
                    class="nickname-input" />
                <button class="save-small-btn" @mousedown.prevent="saveNickname">저장</button>
            </div>

            <div v-else class="display-group" @click.stop="startEdit" title="클릭하여 닉네임 수정">
                <span class="user-display-name">{{ displayName }}</span>
                <span class="edit-icon">✎</span>
            </div>
        </div>

        <ul class="menu-list">
            <li @click="emit('logout')">로그아웃</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { updateNickname } from '@/api/auth';

const authStore = useAuthStore();
const emit = defineEmits(['logout', 'nickname-changed']);

const isEditing = ref(false);
const editValue = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const displayName = computed(() => {
    return authStore.user?.nickname || authStore.user?.name || '사용자';
});

const startEdit = async () => {
    editValue.value = displayName.value;
    isEditing.value = true;
    await nextTick(); //
    inputRef.value?.focus();
};

const handleBlur = () => {
    // 저장 버튼 클릭 시 blur가 먼저 일어나서 저장이 안 되는 걸 방지하기 위해 
    // 약간의 딜레이를 주거나 mousedown.prevent를 사용합니다.
    setTimeout(() => {
        isEditing.value = false;
    }, 200);
};

const saveNickname = async () => {
    if (!editValue.value.trim() || editValue.value === displayName.value) {
        isEditing.value = false;
        emit('nickname-changed');
    }

    try {
        const updatedUser = await updateNickname(editValue.value);
        authStore.setUser(updatedUser);
        isEditing.value = false;
    } catch (error) {
        console.error("닉네임 변경 실패:", error);
        alert("변경에 실패했습니다.");
    }
};
</script>

<style scoped>
.user-dropdown {
    position: absolute;
    top: 50px;
    right: 0;
    width: 180px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border: 1px solid #eee;
    overflow: hidden;
}

.user-info {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    background-color: #fcfcfc;
    transition: background-color 0.2s;
}

.user-info:hover:not(.is-editing-mode) {
    background-color: #f0f4f8;
    /* 마우스 올리면 수정 가능함을 암시 */
}

.display-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.user-display-name {
    font-weight: 600;
    font-size: 14px;
    color: #333;
}

.edit-icon {
    font-size: 12px;
    color: #aaa;
}

.edit-group {
    display: flex;
    gap: 4px;
}

.nickname-input {
    flex: 1;
    width: 100%;
    padding: 4px 6px;
    border: 1px solid #101828;
    border-radius: 4px;
    font-size: 13px;
    outline: none;
}

.save-small-btn {
    padding: 4px 8px;
    background-color: #101828;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px 0;
}

.menu-list li {
    padding: 10px 16px;
    font-size: 14px;
    color: #555;
    cursor: pointer;
}

.menu-list li:hover {
    background-color: #f9f9f9;
}
</style>