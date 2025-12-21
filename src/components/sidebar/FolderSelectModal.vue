<template>
  <BaseModal :isVisible="isVisible" width="400px" @close="$emit('close')">
    <div class="folder-select-content">
      <h2 class="modal-title">장소 저장하기</h2>
      <p class="modal-desc">이 장소를 저장할 폴더를 선택해주세요.</p>
      
      <div v-if="loading" class="loading">폴더 목록 로딩 중...</div>
      <div v-else-if="folders.length === 0" class="empty">
        <p>생성된 폴더가 없습니다.</p>
        <button class="btn-create-small" @click="$emit('open-create')">새 폴더 만들기</button>
      </div>
      <div v-else class="folder-list">
        <div 
          v-for="folder in folders" 
          :key="folder.placeFolderId" 
          class="folder-item"
          @click="handleSelect(folder.placeFolderId)"
        >
          <span class="folder-icon" :style="{ backgroundColor: folder.color }"></span>
          <span class="folder-name">{{ folder.name }}</span>
          <span class="folder-count">{{ folder.counts }}</span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import { getFolderList, addAttractionToFolder } from '@/api/folder';
import type { PlaceFolderResponse } from '@/api/folder';

const props = defineProps<{ 
  isVisible: boolean;
  attractionId: number | null;
}>();
const emit = defineEmits(['close', 'saved', 'open-create']);

const folders = ref<PlaceFolderResponse[]>([]);
const loading = ref(false);

const fetchFolders = async () => {
  loading.value = true;
  try {
    folders.value = await getFolderList();
  } catch (error) {
    console.error('폴더 목록 조회 실패:', error);
  } finally {
    loading.value = false;
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) fetchFolders();
});

const handleSelect = async (folderId: number) => {
  if (!props.attractionId) return;
  try {
    await addAttractionToFolder(folderId, props.attractionId);
    alert('장소가 저장되었습니다.');
    emit('saved');
    emit('close');
  } catch (error) {
    alert('장소 저장에 실패했습니다.');
  }
};

defineExpose({
  fetchFolders
});
</script>

<style scoped>
.folder-select-content { padding: 10px; }
.modal-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.modal-desc { color: #666; font-size: 14px; margin-bottom: 20px; }
.folder-list { max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.folder-item { display: flex; align-items: center; padding: 12px; border: 1px solid #eee; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
.folder-item:hover { background: #f9fafb; border-color: #ddd; }
.folder-icon { width: 12px; height: 12px; border-radius: 50%; margin-right: 12px; }
.folder-name { flex: 1; font-weight: 500; font-size: 15px; }
.folder-count { font-size: 12px; color: #999; }
.loading, .empty { padding: 40px 0; text-align: center; color: #999; }
.btn-create-small { margin-top: 12px; padding: 8px 16px; background: #333; color: white; border: none; border-radius: 6px; cursor: pointer; }
</style>
