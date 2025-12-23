<template>
    <div class="scrap-header">
        <button class="back-btn" @click="$emit('back')">
            <img src="@/assets/icons/ic_back.png" alt="뒤로가기" class="back-icon" />
        </button>

        <h3 class="header-title">{{ title }}</h3>

        <div class="header-right-placeholder"></div>
    </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
defineEmits(['back']);
</script>

<style scoped>
.scrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    min-height: 40px;
    position: relative;
}

.back-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: opacity 0.2s;
}

.back-btn:hover {
    opacity: 0.6;
}

.back-icon {
    width: 20px;
    height: 20px;
}

.header-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.15rem;
    font-weight: bold;
    margin: 0;
    color: #333;
    white-space: nowrap;
}

.header-right-placeholder {
    width: 28px;
}
</style>