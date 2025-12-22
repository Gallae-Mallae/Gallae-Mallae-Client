<template>
    <div v-if="isVisible" class="memo-modal-container">
        <header class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <button class="close-button" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-content">
            <draggable :list="memoContents" item-key="contentId" class="memo-list" handle=".drag-handle"
                ghost-class="ghost" @end="onDragEnd">
                <template #item="{ element, index }">
                    <div :class="['memo-item', element.type.toLowerCase()]">
                        <div class="drag-handle" @mousedown.stop>⠿</div>

                        <div class="memo-content-area">
                            <template v-if="element.type === 'LINK'">
                                <a :href="formatUrl(element.content)" target="_blank" class="memo-link" @mousedown.stop>
                                    {{ element.content }}
                                </a>
                            </template>
                            <template v-else>
                                <span class="memo-text">{{ element.content }}</span>
                            </template>
                        </div>

                        <button class="remove-btn" @click="$emit('remove-content', index)">
                            <img src="@/assets/icons/ic_close.png" alt="삭제" />
                        </button>
                    </div>
                </template>
            </draggable>

            <div v-if="editingType" :class="['input-wrapper', editingType.toLowerCase()]">
                <input v-model="tempContent" @keyup.enter.prevent="handleSave" ref="inputRef" />
            </div>
        </div>

        <footer class="modal-footer">
            <button class="footer-btn" @click="startEdit('LINK')">＋ 링크 추가</button>
            <button class="footer-btn" @click="startEdit('TEXT')">＋ 메모 추가</button>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { MemoDTO } from '@/types/plan';
import draggable from 'vuedraggable';

const props = defineProps<{
    isVisible: boolean;
    title: string;
    memoContents: MemoDTO[];
}>();

const emit = defineEmits(['close', 'add-content', 'remove-content', 'reorder-memos']);

const editingType = ref<'TEXT' | 'LINK' | null>(null);
const tempContent = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const formatUrl = (url: string) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
};

const startEdit = (type: 'TEXT' | 'LINK') => {
    editingType.value = type;
    tempContent.value = '';
    nextTick(() => inputRef.value?.focus());
};

const handleSave = () => {
    if (!tempContent.value.trim()) return;
    emit('add-content', { type: editingType.value, content: tempContent.value });
    tempContent.value = '';
    editingType.value = null;
};

const onDragEnd = () => {
    emit('reorder-memos', [...props.memoContents]);
};
</script>

<style scoped>
.memo-modal-container {
    width: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    padding: 12px;
    box-sizing: border-box;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 12px;
    font-weight: bold;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
}

.drag-handle {
    cursor: grab;
    color: #ccc;
    padding-right: 8px;
    user-select: none;
}

.drag-handle:active {
    cursor: grabbing;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb !important;
}

.memo-item,
.input-wrapper {
    margin-top: 6px;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start
}

.memo-list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
}

.memo-content-area {
    flex: 1;
    display: flex;
    align-items: center;
}

.memo-text {
    flex: 1;
    word-break: break-all;
    white-space: pre-wrap;
    line-height: 1.4;
    color: #333;
}

.memo-link {
    flex: 1;
    color: #1a73e8;
    text-decoration: underline;
    word-break: break-all;
    cursor: pointer;
    line-height: 1.4;
}

.memo-link:hover {
    color: #1557b0;
}

.text {
    background-color: #FFFDE7;
    border: 1px solid #FFF9C4;
}

.link {
    background-color: #E3F2FD;
    border: 1px solid #BBDEFB;
}

.input-wrapper {
    align-items: center;
    min-height: 34px;
}

.input-wrapper input {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 12px;
    line-height: 1.2;
    padding: 0;
    margin: 0;
}

.modal-footer {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eee;
}

.footer-btn {
    flex: 1;
    font-size: 11px;
    padding: 6px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    transition: opacity 0.2s;
}

.remove-btn img {
    width: 12px;
    height: 12px;
}
</style>