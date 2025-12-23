<template>
  <BaseModal :isVisible="isVisible" width="400px" @close="$emit('close')">
    <div class="folder-modal-content">
      <h2 class="modal-title">새 폴더 만들기</h2>
      
      <div class="input-group">
        <label>폴더 이름</label>
        <input 
          v-model="folderName" 
          type="text" 
          placeholder="예: 서울 맛집 탐방" 
          maxlength="20"
          @keyup.enter="handleCreate"
        />
      </div>

      <div class="input-group">
        <label>폴더 색상</label>
        <div class="color-picker">
          <button 
            v-for="color in colors" 
            :key="color" 
            class="color-dot" 
            :style="{ backgroundColor: color }"
            :class="{ active: selectedColor === color }"
            @click="selectedColor = color"
          ></button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-confirm" :disabled="!folderName.trim()" @click="handleCreate">생성하기</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { createFolder } from '@/api/folder';

const props = defineProps<{ isVisible: boolean }>();
const emit = defineEmits(['close', 'created']);

const folderName = ref('');
const selectedColor = ref('#4CAF50');
const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#E91E63', '#00BCD4', '#607D8B'];

const handleCreate = async () => {
  if (!folderName.value.trim()) return;
  try {
    await createFolder(folderName.value, selectedColor.value);
    emit('created');
    folderName.value = '';
    emit('close');
  } catch (error) {
    alert('폴더 생성에 실패했습니다.');
  }
};
</script>

<style scoped>
.folder-modal-content { padding: 10px; }
.modal-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; color: #333; }
.input-group { margin-bottom: 20px; }
.input-group label { display: block; font-size: 14px; font-weight: 600; color: #666; margin-bottom: 8px; }
.input-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }
.color-picker { display: flex; flex-wrap: wrap; gap: 10px; }
.color-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: transform 0.2s; }
.color-dot.active { border-color: #333; transform: scale(1.1); }
.modal-actions { display: flex; gap: 10px; margin-top: 30px; }
.modal-actions button { flex: 1; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-cancel { background: #f3f4f6; border: none; color: #666; }
.btn-confirm { background: var(--color-primary, #3B82F6); border: none; color: white; }
.btn-confirm:disabled { background: #ccc; cursor: not-allowed; }
</style>
