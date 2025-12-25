<template>
  <div class="home-background" :style="{ backgroundImage: `url(${backImg})` }">
    <div class="overlay-content">
      <div class="section">
        <h1 class="fade-in-up delay-1">Let's</h1>
      </div>
      <div class="section">
        <h1 class="fade-in-up delay-2">Travel</h1>
      </div>
      <div class="section">
        <h1 class="fade-in-up delay-3">Together</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import backImg from '@/assets/images/back.png';
</script>

<style scoped>
.home-background {
  width: 100%;
  height: calc(100vh - 58px); /* 헤더 높이 제외 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.overlay-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row; /* 가로 방향 배치 */
  background-color: rgba(0, 0, 0, 0.3);
}

.section {
  flex: 1; /* 3등분 (가로) */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 구분선 제거됨 */
}

h1 {
  font-size: 4rem; /* 텍스트 크기 좀 더 키움 */
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
  margin: 0;
  opacity: 0;
  transform: translateY(40px);
  font-family: 'Arial Black', sans-serif; /* 더 두꺼운 폰트 */
}

/* 애니메이션 정의 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* 딜레이 설정 (왼쪽 -> 오른쪽 순차 등장) */
.delay-1 {
  animation-delay: 0.2s;
}
.delay-2 {
  animation-delay: 0.6s;
}
.delay-3 {
  animation-delay: 1.0s;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .overlay-content {
    flex-direction: column; /* 모바일에서는 세로로 */
  }
  h1 {
    font-size: 3rem;
  }
}
</style>