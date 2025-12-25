<template>
  <div class="join-loading">
    <p>일정에 참여 중입니다. 잠시만 기다려주세요...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { joinPlanByCode } from '@/api/plan';

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const code = route.params.inviteCode as string;
  
  if (!code) {
    router.replace('/');
    return;
  }

  // try {
  //   const response = await joinPlanByCode(code);
    
  //   if (response && response.planId) {
  //     router.replace(`/plan/${response.planId}`);
  //   } else {
  //     router.replace('/');
  //   }
  // } catch (error) {
  //   alert("유효하지 않은 초대 코드이거나 입장에 실패했습니다.");
  //   router.replace('/');
  // }
});
</script>

<style scoped>
.join-loading {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  background-color: #f8f9fa;
  color: #333;
}
</style>