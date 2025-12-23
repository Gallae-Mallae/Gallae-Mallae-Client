import http from "./http";
import type { ScrapFolderDTO, ScrapDTO } from "@/types/scrap";

/* 스크랩 폴더 목록 조회 */
export interface ScrapFolderResponse {
  folderId: number;
  name: string;
  folderImageUrl: string | null;
}

export const fetchScrapFolders = async (): Promise<ScrapFolderDTO[]> => {
  const response = await http.get<ScrapFolderResponse[]>("/scrap-folders");
  return response.data.map((folder: ScrapFolderResponse) => ({
    folderId: folder.folderId,
    name: folder.name,
    folderImageUrl: folder.folderImageUrl,
    itemCount: 0,
  }));
};

/* 스크랩 폴더 생성 */
export interface CreateScrapFolderRequest {
  name: string;
}

export const createScrapFolder = async (
  data: CreateScrapFolderRequest
): Promise<number> => {
  const response = await http.post<number>("/scrap-folders", data);
  return response.data;
};

/* 스크랩 폴더 수정 */
export interface UpdateScrapFolderRequest {
  name: string;
}

export const updateScrapFolder = async (
  folderId: number,
  data: UpdateScrapFolderRequest
): Promise<void> => {
  await http.patch(`/scrap-folders/${folderId}`, data);
};

/* 스크랩 폴더 삭제 */
export const deleteScrapFolder = async (folderId: number): Promise<any> => {
  const response = await http.delete(`/scrap-folders/${folderId}`);
  return response.data;
};
