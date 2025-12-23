<template>
    <div class="scrap-form-view">
        <ScrapHeader :title="initialData ? '링크 수정' : '새 링크 저장'" @back="$emit('back')" />

        <div class="form-container">
            <div class="input-group">
                <label>링크 URL</label>
                <input type="text" v-model="formData.originalLink" placeholder="http://..." />
            </div>

            <div class="input-group">
                <label>제목</label>
                <input type="text" v-model="formData.title" placeholder="사이트 제목을 입력해주세요." />
            </div>

            <div class="input-group">
                <label>메모</label>
                <textarea v-model="formData.description" placeholder="간단한 메모를 남길 수 있어요!"></textarea>
            </div>

            <div class="button-group">
                <button class="save-btn" @click="handleSave">
                    {{ initialData ? '수정하기' : '저장하기' }}
                </button>
                <button class="cancel-btn" @click="$emit('back')">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useScrapStore } from '@/stores/scrap';
import ScrapHeader from '@/components/scrap/ScrapHeader.vue';
import type { ScrapDTO } from '@/types/scrap';

const props = defineProps<{
    folderId: number;
    initialData?: ScrapDTO | null;
}>();

const emit = defineEmits(['back', 'saved']);
const scrapStore = useScrapStore();

const formData = reactive({
    title: '',
    originalLink: '',
    description: ''
});

watch(
    () => props.initialData,
    (newData) => {
        formData.title = newData?.title || '';
        formData.originalLink = newData?.originalLink || '';
        formData.description = newData?.description || '';
    },
    { immediate: true }
);

const handleSave = async () => {
    if (!formData.originalLink.trim()) {
        alert('URL을 입력해주세요.');
        return;
    }

    try {
        if (props.initialData?.scrapId) {
            await scrapStore.updateScrap(props.folderId, props.initialData.scrapId, {
                title: formData.title,
                originalLink: formData.originalLink,
                description: formData.description,
            });
        } else {
            await scrapStore.addScrap(props.folderId, {
                title: formData.title,
                originalLink: formData.originalLink,
                description: formData.description,
            });
        }
        emit('saved');
    } catch (error) {
        alert(props.initialData ? '수정 실패' : '저장 실패');
    }
};
</script>

<style scoped>
.form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-group label {
    margin-left: 6px;
    font-weight: 550;
    font-size: 0.9rem;
}

.input-group input,
.input-group textarea {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.input-group textarea {
    height: 120px;
    resize: none;
}

.button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.save-btn {
    flex: 2;
    padding: 11px;
    background: #556677;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.cancel-btn {
    flex: 1;
    padding: 11px;
    background: #eee;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}
</style>