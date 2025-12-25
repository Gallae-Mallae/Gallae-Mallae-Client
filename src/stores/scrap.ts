import { defineStore } from "pinia";
import { ref } from "vue";
import type { ScrapFolderDTO, ScrapDTO } from "@/types/scrap";
import {
  fetchScrapFolders,
  createScrapFolder,
  updateScrapFolder,
  deleteScrapFolder,
  fetchScrapItems,
  createScrapItem,
  updateScrapItem,
  deleteScrapItem,
} from "@/api/scrap";

export const useScrapStore = defineStore("scrap", () => {
  const folders = ref<ScrapFolderDTO[]>([]);
  const scraps = ref<ScrapDTO[]>([]);
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
      if (!confirm("폴더를 삭제하시겠습니까?")) return;

      await deleteScrapFolder(folderId);
      await loadFolders(); // 삭제 후 목록 갱신
    } catch (error) {
      console.error("폴더 삭제 실패:", error);
      throw error;
    }
  };

  // 링크 목록 조회
  const loadScraps = async (folderId: number) => {
    isLoading.value = true;
    try {
      const data = await fetchScrapItems(folderId);
      scraps.value = data;
    } catch (error) {
      console.error("링크 조회 실패:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const clearScraps = () => {
    scraps.value = [];
  };

  // 링크 추가
  const addScrap = async (
    folderId: number,
    data: {
      title: string;
      description: string | null;
      originalLink: string;
    }
  ) => {
    try {
      const requestBody = {
        title: data.title,
        description: data.description,
        originalLink: data.originalLink,
        content: null,
        imageUrl: null,
      };

      await createScrapItem(folderId, requestBody);
      await loadScraps(folderId);
    } catch (error) {
      console.error("링크 추가 실패:", error);
      throw error;
    }
  };

  // 링크 수정
  const updateScrap = async (
    folderId: number,
    scrapId: number,
    data: {
      title: string;
      description: string | null;
      originalLink: string;
    }
  ) => {
    try {
      await updateScrapItem(folderId, scrapId, data);
      await loadScraps(folderId); // 수정 후 목록 갱신
    } catch (error) {
      console.error("링크 수정 실패:", error);
    }
  };

  // 링크 삭제
  const removeScrap = async (folderId: number, scrapId: number) => {
    try {
      await deleteScrapItem(folderId, scrapId);
      await loadScraps(folderId); // 삭제 후 목록 갱신
    } catch (error) {
      console.error("링크 삭제 실패:", error);
    }
  };

  return {
    folders,
    scraps,
    isLoading,
    loadFolders,
    addFolder,
    editFolder,
    loadScraps,
    removeFolder,
    clearScraps,
    addScrap,
    updateScrap,
    removeScrap,
  };
});
