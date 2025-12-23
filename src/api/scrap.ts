import http from "./http";
import type { ScrapFolderDTO, ScrapDTO } from "@/types/scrap";

/* 폴더 목록 조회 */
export interface ScrapFolderResponse {
  folderId: number;
  name: string;
  itemCount: number;
  folderImageUrl: string | null;
}

export const fetchScrapFolders = async (): Promise<ScrapFolderDTO[]> => {
  const response = await http.get<ScrapFolderResponse[]>("/scrap-folders");
  return response.data.map((folder: ScrapFolderResponse) => ({
    folderId: folder.folderId,
    name: folder.name,
    folderImageUrl: folder.folderImageUrl,
    itemCount: folder.itemCount,
  }));
};

/* 폴더 생성 */
export interface CreateScrapFolderRequest {
  name: string;
}

export const createScrapFolder = async (
  data: CreateScrapFolderRequest
): Promise<number> => {
  const response = await http.post<number>("/scrap-folders", data);
  return response.data;
};

/* 폴더 수정 */
export interface UpdateScrapFolderRequest {
  name: string;
}

export const updateScrapFolder = async (
  folderId: number,
  data: UpdateScrapFolderRequest
): Promise<void> => {
  await http.patch(`/scrap-folders/${folderId}`, data);
};

/* 폴더 삭제 */
export const deleteScrapFolder = async (folderId: number): Promise<any> => {
  const response = await http.delete(`/scrap-folders/${folderId}`);
  return response.data;
};

/* 링크 목록 조회 */
export interface ScrapItemResponse {
  scrapId: number;
  title: string;
  content: string;
  description: string | null;
  originalLink: string;
  imageUrl: string;
  createdAt: string;
}

export const fetchScrapItems = async (
  folderId: number
): Promise<ScrapDTO[]> => {
  const response = await http.get<ScrapItemResponse[]>(
    `/scrap-folders/${folderId}/scraps`
  );
  return response.data.map((item) => ({
    scrapId: item.scrapId,
    folderId: folderId,
    title: item.title,
    content: item.content,
    description: item.description,
    originalLink: item.originalLink,
    imageUrl: item.imageUrl,
    createdAt: item.createdAt,
  }));
};

/* 링크 추가 */
export interface CreateScrapItemRequest {
  title: string;
  content: string | null;
  description: string | null;
  originalLink: string;
  imageUrl: string | null;
}

export const createScrapItem = async (
  folderId: number,
  data: CreateScrapItemRequest
): Promise<number> => {
  const response = await http.post<number>(
    `/scrap-folders/${folderId}/scraps`,
    data
  );
  return response.data;
};

/* 링크 수정 */
export interface UpdateScrapItemRequest {
  title: string;
  description: string | null;
  originalLink: string;
}

export const updateScrapItem = async (
  folderId: number,
  scrapId: number,
  data: UpdateScrapItemRequest
): Promise<void> => {
  await http.patch(`/scrap-folders/${folderId}/scraps/${scrapId}`, data);
};

/* 링크 삭제 */
export const deleteScrapItem = async (
  folderId: number,
  scrapId: number
): Promise<void> => {
  await http.delete(`/scrap-folders/${folderId}/scraps/${scrapId}`);
};
