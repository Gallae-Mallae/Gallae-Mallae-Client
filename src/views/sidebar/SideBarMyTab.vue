<template>
  <div class="side-bar-my-tab">
    <!-- 비로그인 상태 UI -->
    <div v-if="!authStore.isLoggedIn" class="login-required">
      <div class="lock-icon">🔒</div>
      <h3>로그인이 필요한 서비스입니다</h3>
      <p>나만의 장소 폴더를 만들고<br/>여행 계획을 세워보세요.</p>
    </div>

    <!-- 로그인 상태 UI -->
    <template v-else>
      <div class="add-folder-section" @click="isCreateModalOpen = true">
        <span class="add-icon-wrapper">
          <img src="@/assets/icons/ic_add_folder.png" alt="새 폴더 추가 아이콘" class="add-folder-icon" />
        </span>
        <span class="add-text">{{ strings.ADD_PLACE_FOLDER }}</span>
      </div>

      <div class="content-area">
        <!-- 폴더 목록 뷰 -->
        <div v-if="!selectedFolder" class="folder-list-view">
          <PlaceFolderList 
              :folders="folders" 
              :loading="loading" 
              @folder-click="handleFolderClick" 
              @delete="handleDeleteFolder"
          />
        </div>

        <!-- 폴더 상세 장소 뷰 -->
        <div v-else class="folder-detail-view">
          <div class="detail-header">
            <button class="back-btn" @click="selectedFolder = null">
               <img src="@/assets/icons/ic_back.png" alt="뒤로가기" />
            </button>
            <h3 class="folder-title">
              <span class="color-indicator" :style="{ backgroundColor: selectedFolder.color }"></span>
              {{ selectedFolder.name }}
            </h3>
          </div>
          
          <div v-if="detailLoading" class="detail-loading">장소를 불러오는 중...</div>
          <div v-else-if="folderAttractions.length === 0" class="empty-detail">
            저장된 장소가 없습니다.
          </div>
          <div v-else class="detail-list">
             <PlaceCard 
                v-for="place in folderAttractions" 
                :key="place.id" 
                :place="place"
                :show-delete="true"
                @click="handleAttractionClick(place.id)"
                @like="handleLikeAction"
                @delete="handleDeleteFromFolder"
                @mark="handlePlaceMark"
             />
          </div>
        </div>
      </div>
    </template>

    <FolderCreateModal 
      :isVisible="isCreateModalOpen" 
      @close="isCreateModalOpen = false" 
      @created="fetchFolders" 
    />

    <AttractionDetailModal
      :isVisible="isModalOpen"
      :loading="modalLoading"
      :detail="selectedDetail"
      @close="isModalOpen = false"
      @like="handleModalLike"
      @mark="handleModalMark"
    />

        <!-- 폴더 선택 모달 -->
        <FolderSelectModal 
            ref="folderSelectRef"
            :isVisible="isFolderSelectOpen" 
            :attractionId="selectedAttractionId"
            @close="isFolderSelectOpen = false"
            @open-create="isFolderCreateOpen = true"
            @saved="fetchFolders"
        />
    
        <!-- 폴더 생성 모달 (선택 모달에서 연결됨) -->
        <FolderCreateModal 
            :isVisible="isFolderCreateOpen" 
            @close="isFolderCreateOpen = false" 
            @created="() => { fetchFolders(); folderSelectRef?.fetchFolders(); }" 
        />
      </div>
    </template>
    <script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import PlaceFolderList from '@/components/sidebar/PlaceFolderList.vue';
import PlaceCard from '@/components/sidebar/PlaceCard.vue';
import FolderCreateModal from '@/components/sidebar/FolderCreateModal.vue';
import FolderSelectModal from '@/components/sidebar/FolderSelectModal.vue';
import type { PlaceFolderDTO, PlaceCardDTO } from '@/types/sidebar';
import { getFolderList, getAttractionsInFolder, deleteAttractionFromFolder, deleteFolder } from '@/api/folder';
import { getAttractionDetail, toggleLike } from '@/api/attraction';
import { useAuthStore } from '@/stores/auth';
import { useLikeStore } from '@/stores/like';
import AttractionDetailModal from '@/components/sidebar/AttractionDetailModal.vue';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import strings from '@/assets/values/strings.sidebar.json';
import image from '@/assets/images/example_place.png';

const authStore = useAuthStore();
const likeStore = useLikeStore();

const loading = ref(false);
const detailLoading = ref(false);
const folders = ref<PlaceFolderDTO[]>([]);
const isCreateModalOpen = ref(false);

const selectedFolder = ref<PlaceFolderDTO | null>(null);
const folderAttractions = ref<PlaceCardDTO[]>([]);

// 상세 모달 관련
const isModalOpen = ref(false);
const modalLoading = ref(false);
const selectedDetail = ref<any>(null);

// 폴더 저장 모달 상태
const isFolderSelectOpen = ref(false);
const isFolderCreateOpen = ref(false);
const selectedAttractionId = ref<number | null>(null);
const folderSelectRef = ref<any>(null);

const fetchFolders = async () => {
    if (!authStore.isLoggedIn) return;
    loading.value = true;
    try {
        const data = await getFolderList();
        folders.value = data.map(f => ({
            id: String(f.placeFolderId),
            name: f.name,
            color: f.color,
            placeCount: f.counts
        }));
    } catch (error) {
        console.error("폴더 로드 실패:", error);
    } finally {
        loading.value = false;
    }
};

const handleFolderClick = async (folderId: string) => {
    const folder = folders.value.find(f => f.id === folderId);
    if (!folder) return;
    
    selectedFolder.value = folder;
    detailLoading.value = true;
    try {
        const attractions = await getAttractionsInFolder(Number(folderId));
        
        folderAttractions.value = attractions.map(a => ({
            id: String(a.attractionId),
            title: a.title,
            address: a.address,
            imageUrl: a.imageUrl || image,
            latitude: 0, 
            longitude: 0,
            categoryCode: 12, 
            categoryName: '로딩 중...',
            likes: Number(a.likeCount),
            isLiked: likeStore.isLiked(a.attractionId),
            isMarked: true
        }) as PlaceCardDTO);

        Promise.all(attractions.map(a => getAttractionDetail(a.attractionId)))
            .then(details => {
                folderAttractions.value = folderAttractions.value.map((item, idx) => {
                    const detail = details[idx];
                    if (!detail) return item;
                    return {
                        ...item,
                        categoryCode: detail.contentTypeId,
                        categoryName: getCategoryDisplayName(detail.contentTypeId),
                        latitude: detail.latitude,
                        longitude: detail.longitude
                    } as PlaceCardDTO;
                });
            })
            .catch(err => console.error("상세 정보 일괄 로드 실패:", err));

    } catch (error) {
        console.error("폴더 내 장소 로드 실패:", error);
    } finally {
        detailLoading.value = false;
    }
};

const handleAttractionClick = async (id: string) => {
    isModalOpen.value = true;
    modalLoading.value = true;
    selectedDetail.value = null;

    try {
        const detail = await getAttractionDetail(Number(id));
        selectedDetail.value = detail;
        
        const index = folderAttractions.value.findIndex(p => p.id === id);
        if (index !== -1) {
            const currentItem = folderAttractions.value[index];
            folderAttractions.value[index] = {
                ...currentItem,
                categoryCode: detail.contentTypeId,
                categoryName: getCategoryDisplayName(detail.contentTypeId),
                latitude: detail.latitude,
                longitude: detail.longitude
            } as PlaceCardDTO;
        }
    } catch (error) {
        console.error("상세 정보 로드 실패:", error);
        isModalOpen.value = false;
    } finally {
        modalLoading.value = false;
    }
};


const handleLikeAction = (placeId: string) => {
    const item = folderAttractions.value.find(p => p.id === placeId);
    if (!item) return;

    const targetItem = item as PlaceCardDTO;
    const wasLiked = targetItem.isLiked;
    likeStore.toggleLikeState(Number(placeId));
    targetItem.isLiked = !wasLiked;
    targetItem.likes += wasLiked ? -1 : 1;

    toggleLike(Number(placeId)).catch(() => {
        likeStore.toggleLikeState(Number(placeId));
        targetItem.isLiked = wasLiked;
        targetItem.likes += wasLiked ? 1 : -1;
    });
};

const handleModalLike = (placeId: number) => {
    const item = folderAttractions.value.find(p => p.id === String(placeId));
    if (!item) return;
    
    const targetItem = item as PlaceCardDTO;
    const isNowLiked = likeStore.isLiked(placeId);
    if (targetItem.isLiked !== isNowLiked) {
        targetItem.likes += isNowLiked ? 1 : -1;
        targetItem.isLiked = isNowLiked;
    }
};

const handleModalMark = (placeId: number) => {
    selectedAttractionId.value = placeId;
    isFolderSelectOpen.value = true;
};

const handlePlaceMark = (placeId: string) => {
    selectedAttractionId.value = Number(placeId);
    isFolderSelectOpen.value = true;
};

const handleDeleteFromFolder = async (placeId: string) => {
    if (!selectedFolder.value) return;
    if (!confirm("이 폴더에서 해당 장소를 삭제하시겠습니까?")) return;

    try {
        await deleteAttractionFromFolder(Number(selectedFolder.value.id), Number(placeId));
        folderAttractions.value = folderAttractions.value.filter(p => p.id !== placeId);
        
        // selectedFolder는 folders 목록 내의 객체를 참조하고 있으므로 한 번만 감소시키면 됩니다.
        if (selectedFolder.value && selectedFolder.value.placeCount > 0) {
            selectedFolder.value.placeCount--;
        }
    } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제에 실패했습니다.");
    }
};

const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("폴더를 삭제할까요?")) return;

    try {
        await deleteFolder(Number(folderId));
        await fetchFolders();
    } catch (error) {
        console.error("폴더 삭제 실패:", error);
        alert("폴더 삭제에 실패했습니다.");
    }
};

onMounted(() => {
    if (authStore.isLoggedIn) fetchFolders();
});

watch(() => authStore.isLoggedIn, (loggedIn) => {
    if (loggedIn) fetchFolders();
    else folders.value = [];
});

// 외부(부모 컴포넌트인 Search.vue)에서 접근할 수 있도록 노출
defineExpose({
    handleAttractionClick
});
</script>

<style scoped>
.side-bar-my-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}

/* 비로그인 UI */
.login-required {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-required h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
}

.login-required p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
}

/* 상단 추가 섹션 */
.add-folder-section {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.add-folder-section:hover {
  background-color: #f0f0f0;
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
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0; /* 기본 패딩 제거 */
}

/* 폴더 목록 뷰 */
.folder-list-view {
  padding: 0 15px 40px;
}

/* 상세 뷰 */
.detail-header {
  display: flex;
  align-items: center;
  padding: 14px 15px;
  border-bottom: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.back-btn img {
  width: 20px;
  height: 20px;
}

.folder-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.color-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.detail-list {
  padding-bottom: 40px;
}

.detail-loading,
.empty-detail {
  padding: 60px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>