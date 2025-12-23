<template>
  <div class="plan-create-card" @click="handleClick">
    <div class="content-wrapper">
      <img src="@/assets/icons/ic_add.png" alt="새 일정 만들기 아이콘" class="add-icon" />
      <p class="create-text">{{ strings.ADD_PLAN }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">

import strings from "@/assets/values/strings.plan.json"

const emit = defineEmits(['create']);

const handleClick = () => {
  emit('create');
};

</script>

<style scoped>
.plan-create-card {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background-color: #ffffff;
  border: 1.5px dashed #e0e0e0;
  color: #99A1AF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.plan-create-card:hover {
  border-color: #777;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.1);
  background-color: #f4f3f3;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.add-icon {
  width: 48px;
  height: 48px;
}

.create-text {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}
</style>