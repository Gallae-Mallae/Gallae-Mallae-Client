<template>
    <div class="scrap-form-view">
        <ScrapHeader :title="mode === 'FOLDER' ? '새 폴더 생성' : '새 링크 저장'" @back="$emit('back')" />

        <div class="form-container">
            <div class="input-group">
                <label>제목</label>
                <input type="text" v-model="formData.title" placeholder="예: OO 맛집 리스트" />
            </div>

            <div class="input-group" v-if="mode === 'ITEM'">
                <label>링크 URL</label>
                <input type="text" v-model="formData.url" placeholder="http://..." />
            </div>

            <div class="input-group">
                <label>메모</label>
                <textarea v-model="formData.description" placeholder="간단한 메모를 남길 수 있어요!"></textarea>
            </div>

            <div class="button-group">
                <button class="save-btn" @click="handleSave">저장하기</button>
                <button class="cancel-btn" @click="$emit('back')">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import ScrapHeader from '@/components/scrap/ScrapHeader.vue';

const props = defineProps<{ mode: 'FOLDER' | 'ITEM' }>();
const emit = defineEmits(['back', 'saved']);

const formData = reactive({
    title: '',
    url: '',
    description: ''
});

const handleSave = () => {
    console.log('저장 데이터:', formData);
    emit('saved');
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