<template>
    <div class="participants-wrapper">
        <User v-for="user in displayedParticipants" :key="user.userId" :user="user" :show-name="true" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import User from '@/components/User.vue';
import type { PlanMemberDTO } from '@/types/plan';
import type { UserDTO } from '@/types/user';

interface Props {
    participants: PlanMemberDTO[];
}

const props = defineProps<Props>();

const MAX_DISPLAY = 6;

const displayedParticipants = computed(() => {
    const transformedList: UserDTO[] = props.participants.map(member => {
        return {
            userId: member.userId,
            name: member.name, 
            nickname: member.nickname,
            profileImageUrl: member.profileImageUrl,
        } as UserDTO;
    });

    return transformedList.slice(0, MAX_DISPLAY);
});

</script>

<style scoped>
.participants-wrapper {
    display: flex;
}
</style>