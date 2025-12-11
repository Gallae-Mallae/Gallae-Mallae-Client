<template>

        <TimelineParticipants :participants="dummyParticipants" />

</template>

<script setup lang="ts">
import TimelineParticipants from '@/components/plan/TimelineParticipants.vue'; // 💡 새로 구현한 컴포넌트 import
import type { UserDTO } from '@/types/user'; // UserDTO 타입 import

// --- 더미 데이터 (총 8명) ---
// 6명 표시 + 2명 오버플로우 테스트용
const dummyParticipants: UserDTO[] = [
    { userId: 1, email: "u1@e.c", name: "김민수", nickname: "미니", profileImageUrl: "https://i.pravatar.cc/150?img=60", deletedAt: null },
    { userId: 2, email: "u2@e.c", name: "이지은", nickname: null, profileImageUrl: "https://i.pravatar.cc/150?img=49", deletedAt: null },
    { userId: 3, email: "u3@e.c", name: "박서준", nickname: "쭈니", profileImageUrl: null, deletedAt: null },
    // { userId: 4, email: "u4@e.c", name: "최유진", nickname: null, profileImageUrl: "https://i.pravatar.cc/150?img=53", deletedAt: null },
    // { userId: 5, email: "u5@e.c", name: "정우성", nickname: "배우", profileImageUrl: "https://i.pravatar.cc/150?img=54", deletedAt: null },
    // { userId: 6, email: "u6@e.c", name: "김태리", nickname: null, profileImageUrl: null, deletedAt: null }, // 💡 기본 프로필 테스트용 (6번째)
    // { userId: 7, email: "u7@e.c", name: "유재석", nickname: "메인MC", profileImageUrl: "https://i.pravatar.cc/150?img=55", deletedAt: null }, // 💡 오버플로우
    // { userId: 8, email: "u8@e.c", name: "송혜교", nickname: "배우2", profileImageUrl: "https://i.pravatar.cc/150?img=56", deletedAt: null }, // 💡 오버플로우
];

</script>

<style scoped>

</style>