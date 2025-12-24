<template>
  <BaseModal :isVisible="isVisible" width="500px" @close="closeModal">
    <div v-if="loading" class="loading-state">
      <p>상세 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="detail" class="detail-container">
      <div class="image-wrapper">
        <!-- 기본 이미지일 때만 배경에 흐릿한 효과 적용 -->
        <div v-if="!detail.imageUrl" class="image-bg-blur" :style="{ backgroundImage: `url(${defaultImage})` }"></div>
        
        <!-- 이미지가 있으면 cover(꽉 채움), 없으면 contain(비율 유지) -->
        <img 
          :src="detail.imageUrl || defaultImage" 
          :alt="detail.title" 
          class="detail-image" 
          :class="detail.imageUrl ? 'type-cover' : 'type-contain'"
        />
        
        <div class="category-badge">
          {{ getCategoryDisplayName(detail.contentTypeId) }}
        </div>
      </div>

      <div class="content-wrapper">
        <div class="title-row">
          <h2 class="title">{{ detail.title }}</h2>
          <div class="action-buttons">
            <button class="action-btn" :class="{ 'liked': isLiked }" @click="handleLike" title="좋아요">
              <img src="@/assets/icons/ic_heart.png" alt="좋아요" class="action-icon" />
            </button>
            <button class="action-btn" @click="handleMark" title="내 장소 저장">
              <img src="@/assets/icons/ic_mark.png" alt="북마크" class="action-icon" />
            </button>
          </div>
        </div>

        <p class="address">
          <img src="@/assets/icons/ic_location.png" alt="주소" class="icon-small" />
          {{ detail.address }}
        </p>

        <div class="stats-row">
          <span class="stat-item">
            <img src="@/assets/icons/ic_heart.png" alt="좋아요" class="icon-small" :class="{ 'red': isLiked }" />
            {{ detail.likeCount }}
          </span>
        </div>

        <div class="overview-box">
          <p class="overview-text" v-html="detail.overview || '상세 설명이 없습니다.'"></p>
        </div>

        <button class="show-map-btn" @click="handleShowOnMap">
          <img src="@/assets/icons/ic_map.png" alt="지도" class="btn-icon" />
          지도에 위치 표시
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { AttractionDetailResponse } from '@/api/attraction';
import { toggleLike } from '@/api/attraction';
import { getCategoryDisplayName } from '@/utils/categoryMap';
import { useLikeStore } from '@/stores/like';
import { useAuthStore } from '@/stores/auth';
import defaultImage from '@/assets/images/example_place.png';

const props = defineProps<{
  isVisible: boolean;
  loading: boolean;
  detail: AttractionDetailResponse | null;
}>();

const emit = defineEmits(['close', 'show-on-map', 'mark', 'like']);

const likeStore = useLikeStore();
const authStore = useAuthStore();

// 좋아요 여부를 스토어와 연동하여 실시간 계산
const isLiked = computed(() => {
    if (!props.detail) return false;
    return likeStore.isLiked(props.detail.attractionId);
});

const closeModal = () => {
  emit('close');
};

const handleShowOnMap = () => {
  if (props.detail) {
    emit('show-on-map', props.detail);
    closeModal();
  }
};

const handleMark = () => {
  if (props.detail) {
    emit('mark', props.detail.attractionId);
  }
};

// 좋아요 버튼 클릭 핸들러
const handleLike = () => {
  if (!props.detail) return;
  
  // 1. 로그인 상태 확인
  if (!authStore.isLoggedIn) {
      alert('로그인이 필요합니다.');
      // router.push('/login'); // 필요 시 로그인 페이지로 이동
      return;
  }

  const placeId = props.detail.attractionId;
  const wasLiked = isLiked.value;

  // 2. UI 즉시 업데이트 (숫자 + 색상)
  likeStore.toggleLikeState(placeId);
  props.detail.likeCount += wasLiked ? -1 : 1;
  emit('like', placeId);
  
  // 3. API 비동기 호출
  toggleLike(placeId).catch(err => {
    console.error("좋아요 토글 API 실패:", err);
    // 4. 실패 시 UI 롤백 (숫자 + 색상)
    likeStore.toggleLikeState(placeId);
    if (props.detail) {
        props.detail.likeCount += wasLiked ? 1 : -1;
    }
    alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
  });
};
</script>

<style scoped>
.loading-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.detail-container {
  display: flex;
  flex-direction: column;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-bg-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  filter: blur(15px) brightness(0.9); /* 흐림 효과 + 살짝 어둡게 */
  transform: scale(1.1); /* 블러로 인한 테두리 번짐 방지 */
  z-index: 0;
}

.detail-image {
  /* 공통 스타일 없음, 타입에 따라 분기 */
}

/* 실제 이미지가 있을 때: 꽉 채우기 (원래대로) */
.detail-image.type-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 기본 이미지일 때: 비율 유지 + 블러 배경 위 */
.detail-image.type-contain {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.category-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.content-wrapper {
  padding: 0 10px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #333;
  line-height: 1.3;
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.action-btn.liked {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.action-btn.liked .action-icon {
  /* 빨간색 필터 */
  filter: grayscale(1) brightness(0.7) sepia(1) hue-rotate(-50deg) saturate(1000%);
}

.address {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.icon-small {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  opacity: 0.7; /* 기본 상태는 약간 흐리게 */
}

.stats-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #555;
}

.stat-item {
  display: flex;
  align-items: center;
}

.icon-small.red {
  opacity: 1;
  filter: grayscale(1) brightness(0.7) sepia(1) hue-rotate(-50deg) saturate(1000%);
}

.overview-box {
  background-color: #fcfcfc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  /* 부드러운 스크롤바 */
  scrollbar-width: thin;
}

.overview-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  white-space: pre-wrap; /* 줄바꿈은 유지하되 자동 줄바꿈 허용 */
}

.show-map-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--color-primary, #3B82F6); /* 기본 블루 테마 */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s;
}

.show-map-btn:hover {
  background-color: var(--color-primary-dark, #2563EB);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  filter: brightness(0) invert(1); /* 흰색 아이콘으로 변경 */
}
</style>