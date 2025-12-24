<template>
    <div class="timeline-table-container">
        <div class="timeline-scroll-area">
            <div class="timeline-grid">
                <TimelineTime />

                <div class="day-columns">
                    <TimelineDaily v-for="day in schedules" :key="`${day.dayNumber}-${day.items.length}`" :data="day" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TimelineTime from './TimelineTime.vue';
import TimelineDaily from './TimelineDaily.vue';
import type { DailyScheduleDTO } from '@/types/plan';

defineProps<{ schedules: DailyScheduleDTO[] }>();
</script>

<style scoped>
.timeline-table-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    user-select: none;
}

.timeline-grid {
    display: flex;
}

.day-columns {
    display: flex;
    flex: 1;
    overflow-x: auto;
}

.day-columns>* {
    flex: 1;
    min-width: 150px;
}
</style>