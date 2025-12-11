<template>
  <div class="side-bar-my-tab">

    <div class="add-folder-section" @click="handleAddFolder">
      <span class="add-icon-wrapper">
        <img src="@/assets/icons/ic_add_folder.png" alt="새 폴더 추가 아이콘" class="add-folder-icon" />
      </span>
      <span class="add-text">{{ strings.ADD_PLACE_FOLDER }}</span>
    </div>

    <PlaceFolderList 
        :folders="folders" 
        :loading="loading" 
        @folder-click="handleFolderClick" 
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PlaceFolderList from '@/components/sidebar/PlaceFolderList.vue';
import type { PlaceFolderDTO } from '@/types/sidebar';
import strings from '@/assets/values/strings.sidebar.json';

const loading = ref(false);
const folders = ref<PlaceFolderDTO[]>([]);

const createDummyFolder = (id: string, name: string, count: number, color: string): PlaceFolderDTO => ({
    id,
    name,
    color,
    placeCount: count,
});

const fetchFolders = async () => {
    loading.value = true;
    
    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 800));

    // 더미 데이터 생성
    folders.value = [
        createDummyFolder("f1", "서울 맛집", 5, "#4CAF50"), 
        createDummyFolder("f2", "제주 감성 카페", 12, "#2196F3"), 
        createDummyFolder("f3", "부산 투어", 3, "#FF9800"), 
        createDummyFolder("f4", "나만의 계획", 8, "#9C27B0"),
        createDummyFolder("f5", "임시 보관함", 1, "#607D8B"),
    ];

    loading.value = false;
};


const handleAddFolder = () => {
    console.log("[SideBarMyTab] 새 폴더 추가 액션");
};

const handleFolderClick = (folderId: string) => {
    console.log(`[SideBarMyTab] 폴더 클릭: ID ${folderId}`);
};

onMounted(() => {
    fetchFolders();
});
</script>

<style scoped>
.side-bar-my-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.add-folder-section {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    cursor: pointer;
    background-color: var(--color-gray-lightest);
    border-bottom: 1px solid var(--color-gray-light, #e5e7eb);
    transition: background-color 0.2s;
}

.add-folder-section:hover {
    background-color: var(--color-gray-lightest, #f8f8f8);
}

.add-icon-wrapper {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
}

.add-folder-icon {
    width: 20px;
    height: 20px;
}

.add-text {
    font-weight: 500;
    color: var(--color-primary-dark, #1f2937);
}

.folder-list-wrapper {
    flex-grow: 1;
    overflow-y: auto;
}
</style>