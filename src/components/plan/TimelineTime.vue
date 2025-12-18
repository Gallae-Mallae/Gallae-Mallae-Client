<template>
    <div class="timeline-time-column">
        <div class="time-header-cell"></div>
        <div v-for="hour in hours" :key="hour" class="time-label">
            {{ hour }}
        </div>
    </div>
</template>

<script setup lang="ts">
const hours = Array.from({ length: 16 }, (_, i) => {
    const h = i + 9;
    return `${h < 10 ? '0' + h : h}:00`;
});
</script>

<style scoped>
.timeline-time-column {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #eee;
    width: 80px;
}

.time-header-cell {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #777;
    border-bottom: 1px solid #eee;
}

.time-label {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    color: #999;
    border-bottom: 1px solid #eee;
    box-sizing: border-box;
}
</style>