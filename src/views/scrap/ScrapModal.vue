<template>
    <BaseModal :isVisible="isVisible" width="480px" @close="$emit('close')">
        <div class="scrap-modal-content">

            <ScrapFolder v-if="currentView === 'FOLDER'" @select-folder="handleSelectFolder"
                @add-folder="handleOpenForm('FOLDER')" />

            <ScrapItem v-else-if="currentView === 'ITEM'" :folderId="selectedFolderId!" @back="currentView = 'FOLDER'"
                @add-item="handleOpenForm('ITEM')" @edit-item="handleOpenEditForm" />

            <ScrapForm v-else-if="currentView === 'FORM'" :mode="formMode" :folderId="selectedFolderId!"
                :initialData="selectedScrap" @back="handleFormBack" @saved="handleFormBack" />

        </div>
    </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import ScrapFolder from '@/views/scrap/ScrapFolder.vue';
import ScrapItem from '@/views/scrap/ScrapItem.vue';
import ScrapForm from '@/views/scrap/ScrapForm.vue';
import type { ScrapDTO } from '@/types/scrap';

defineProps<{
    isVisible: boolean;
}>();

const emit = defineEmits(['close']);

type ViewType = 'FOLDER' | 'ITEM' | 'FORM';
const currentView = ref<ViewType>('FOLDER');
const selectedFolderId = ref<number | null>(null);
const formMode = ref<'FOLDER' | 'ITEM'>('ITEM');
const selectedScrap = ref<ScrapDTO | null>(null);

const handleSelectFolder = (folderId: number) => {
    selectedFolderId.value = folderId;
    currentView.value = 'ITEM';
};

const handleOpenForm = (mode: 'FOLDER' | 'ITEM') => {
    selectedScrap.value = null;
    formMode.value = mode;
    currentView.value = 'FORM';
};

const handleOpenEditForm = (item: ScrapDTO) => {
    selectedScrap.value = item;
    formMode.value = 'ITEM';
    currentView.value = 'FORM';
};

const handleFormBack = () => {
    if (formMode.value === 'FOLDER') {
        currentView.value = 'FOLDER';
    } else {
        currentView.value = 'ITEM';
    }
};
</script>

<style scoped>
.scrap-modal-content {
    height: 560px;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrap-modal-content::-webkit-scrollbar {
    display: none;
}
</style>