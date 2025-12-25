<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { joinPlanByCode } from '@/api/plan'; // 💡 주석 해제

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  // route.params가 아니라 route.query입니다!
  const code = route.query.inviteCode as string;

  if (!code) {
    router.replace('/');
    return;
  }

  try {
    const response = await joinPlanByCode(code);

    if (response && response.planId) {
      // 상세 페이지(PlanDetail)로 이동
      router.replace({ name: 'PlanDetail', params: { id: response.planId } });
    } else {
      router.replace({ name: 'PlanList' });
    }
  } catch (error) {
    console.error("합류 실패:", error);
    alert("초대 코드가 유효하지 않거나 이미 합류한 일정입니다.");
    router.replace({ name: 'PlanList' });
  }
});
</script>

<template>
  <div class="join-loading">
    <div class="spinner"></div>
    <p>일정에 참여 중입니다. 잠시만 기다려주세요...</p>
  </div>
</template>

<style scoped>
.join-loading {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 1.2rem;
  background-color: #f8f9fa;
  color: #333;
}

/* 간단한 로딩 스피너 */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>