import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScrapFolderDTO, ScrapDTO } from "@/types/scrap";
import {
  fetchScrapFolders,
  createScrapFolder,
  updateScrapFolder,
  deleteScrapFolder,
} from "@/api/scrap";

export const useScrapStore = defineStore("scrap", () => {
  const folders = ref<ScrapFolderDTO[]>([]);
  const isLoading = ref(false);

  // 폴더 목록 조회
  const loadFolders = async () => {
    isLoading.value = true;
    try {
      const data = await fetchScrapFolders();
      folders.value = data;
    } finally {
      isLoading.value = false;
    }
  };

  // 폴더 추가
  const addFolder = async (name: string) => {
    try {
      await createScrapFolder({ name });
      await loadFolders();
    } catch (error) {
      console.error("폴더 추가 실패:", error);
      throw error;
    }
  };

  // 폴더 수정
  const editFolder = async (folderId: number, name: string) => {
    try {
      // API 변경에 따라 { name } 객체 형태로 전달
      await updateScrapFolder(folderId, { name });
      await loadFolders(); // 수정 후 목록 갱신
    } catch (error) {
      console.error("폴더 수정 실패:", error);
      throw error;
    }
  };

  // 폴더 삭제
  const removeFolder = async (folderId: number) => {
    try {
      if (!confirm("정말로 이 폴더를 삭제하시겠습니까?")) return;

      await deleteScrapFolder(folderId);
      await loadFolders(); // 삭제 후 목록 갱신
    } catch (error) {
      console.error("폴더 삭제 실패:", error);
      throw error;
    }
  };

  return {
    folders,
    isLoading,
    loadFolders,
    addFolder,
    editFolder,
    removeFolder,
  };
});
