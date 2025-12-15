<template>
    <div class="user-card" :title="displayName">
        <div class="avatar-image-wrapper" :class="{ 'default-avatar-bg': !hasProfileImage }">
            <img v-if="hasProfileImage" :src="props.user.profileImageUrl!" class="avatar-image" />
            <img v-else :src="defaultProfileIcon" class="default-icon" />
        </div>

        <span v-if="showName" class="user-name">{{ displayName }}</span>
    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import type { UserDTO } from '@/types/user';
import defaultProfileIcon from '@/assets/icons/ic_default_profile.png';

interface Props {
    user: UserDTO;
    showName?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showName: true,
});

// 닉네임 있으면 닉네임, 없으면 본명 사용
const displayName = computed(() => props.user.nickname || props.user.name);

// 프로필 이미지 있는지 확인
const hasProfileImage = computed(() => !!props.user.profileImageUrl);

</script>

<style scoped>
.user-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 60px;
    cursor: pointer;
    transition: opacity 0.2s;
    user-select: none;
}

.avatar-image-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #ddd;
}

.default-avatar-bg {
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-icon {
    width: 65%;
    height: 65%;
    object-fit: contain;
    opacity: 0.75;
}

.user-name {
    font-size: 0.75rem;
    font-weight: bold;
    color: #555;
    text-align: center;
    line-height: 1.2;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>