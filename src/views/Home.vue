<template>
  <div class="home-container">
    <h2>타임라인 헤더 UI 테스트 (Home.vue)</h2>
    
    <TimelineHeader 
      :plan-data="dummyPlanData" 
      :participants="dummyMembers" 
    />

    <p class="note">
      * 위 영역이 TimelineHeader.vue 컴포넌트입니다.
    </p>
  </div>
</template>

<script setup lang="ts">
import TimelineHeader from '@/components/plan/TimelineHeader.vue';
import type { PlanCardDTO, PlanMemberDTO } from '@/types/plan'; 

// 1. PlanCardDTO 더미 데이터
const dummyPlanData: PlanCardDTO = {
    id: 'plan-test-01',
    title: '제주도 힐링 여행',
    startDate: '2024-12-05',
    endDate: '2024-12-10',
    imageUrl: '',
    isShared: true,
};

const dummyMembers: PlanMemberDTO[] = [
    { 
        id: 'm1', 
        userId: 'u1', 
        planId: dummyPlanData.id, 
        nickname: '김민수', 
        profileImageUrl: 'https://i.pravatar.cc/150?img=60' 
    },
    { 
        id: 'm2', 
        userId: 'u2', 
        planId: dummyPlanData.id, 
        nickname: '이지은', 
        profileImageUrl: 'https://i.pravatar.cc/150?img=49' 
    },
    { 
        id: 'm3', 
        userId: 'u3', 
        planId: dummyPlanData.id, 
        nickname: '박서준', 
        profileImageUrl: 'https://i.pravatar.cc/150?img=53' 
    },
    { 
        id: 'm4', 
        userId: 'u4', 
        planId: dummyPlanData.id, 
        nickname: '최유진', 
        profileImageUrl: 'https://i.pravatar.cc/150?img=54' 
    },
    { 
        id: 'm5', 
        userId: 'u5', 
        planId: dummyPlanData.id, 
        nickname: '정우성', 
        profileImageUrl: null 
    },
];
</script>

<style scoped>
.home-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #555;
}

/* TimelineHeader 컴포넌트는 자체 스타일을 가지고 있으므로, 추가 스타일링은 최소화 */
.note {
    margin-top: 15px;
    font-size: 14px;
    color: gray;
}
</style>