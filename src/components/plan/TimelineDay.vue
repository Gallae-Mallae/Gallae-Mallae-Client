<template>
    <div class="day-header">
        <div class="day-number">{{ data.dayNumber }}일차</div>
        <div class="day-date">{{ formatDate(data.date) }}</div>
    </div>
</template>

<script setup lang="ts">
import type { DailyScheduleDTO } from '@/types/plan';

defineProps<{ data: DailyScheduleDTO }>();

const formatDate = (dateStr: string) => {
    return dateStr.split('-').slice(1).join('/');
};
</script>

<style scoped>
.day-header {
    flex: 1;
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
}

.day-number {
    font-weight: 450;
    font-size: 14px;
}

.day-date {
    font-size: 13px;
    color: #888;
    margin-top: 3px;
}
</style>