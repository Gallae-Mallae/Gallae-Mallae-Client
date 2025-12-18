<template>
    <div class="timeline-table-container">
        <div class="timeline-scroll-area">
            <div class="timeline-grid">
                <TimelineTime />

                <div class="day-columns">
                    <div class="day-headers-row">
                        <TimelineDay v-for="day in schedules" :key="day.dayNumber" :data="day" />
                    </div>
                    <div class="day-body-row">
                        <TimelineDaily v-for="day in schedules" :key="day.dayNumber" :data="day" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TimelineTime from './TimelineTime.vue';
import TimelineDay from './TimelineDay.vue';
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
    flex-direction: column;
    flex: 1;
    overflow-x: auto;
}

.day-headers-row {
    display: flex;
}

.day-body-row {
    display: flex;
}
</style>