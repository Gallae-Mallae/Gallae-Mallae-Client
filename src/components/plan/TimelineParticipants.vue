<template>
    <div class="participants-wrapper">
        <User v-for="user in displayedParticipants" :key="user.userId" :user="user" :show-name="true" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import User from '@/components/User.vue';
import type { UserDTO } from '@/types/user';

interface Props {
    participants: UserDTO[];
}

const props = defineProps<Props>();

const MAX_DISPLAY = 6;

// 표시될 참여자 목록 (최대 6명)
const displayedParticipants = computed(() => {
    return props.participants.slice(0, MAX_DISPLAY);
});

</script>

<style scoped>
.participants-wrapper {
    display: flex;
}
</style>