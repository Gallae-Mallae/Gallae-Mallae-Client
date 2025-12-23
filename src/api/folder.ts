import axiosInstance from './http';

export interface PlaceFolderResponse {
  placeFolderId: number;
  name: string;
  color: string;
  counts: number;
}

export interface AttractionInFolder {
  attractionId: number;
  title: string;
  address: string;
  imageUrl: string;
  likeCount: number;
}

// 1.1 폴더 생성
export const createFolder = async (name: string, color: string): Promise<string> => {
  const { data } = await axiosInstance.post<string>('/place_folders', { name, color });
  return data;
};

// 1.2 폴더에 여행지 추가
export const addAttractionToFolder = async (folderId: number, attractionId: number): Promise<string> => {
  const { data } = await axiosInstance.post<string>(`/place_folders/${folderId}/attractions/${attractionId}`);
  return data;
};

// 1.3 폴더 목록 조회
export const getFolderList = async (): Promise<PlaceFolderResponse[]> => {
  const { data } = await axiosInstance.get<PlaceFolderResponse[]>('/place_folders');
  return data;
};

// 1.4 폴더 내 여행지 조회
export const getAttractionsInFolder = async (folderId: number): Promise<AttractionInFolder[]> => {
  const { data } = await axiosInstance.get<AttractionInFolder[]>(`/place_folders/${folderId}`);
  return data;
};

// 1.5 폴더 수정
export const updateFolder = async (folderId: number, name: string, color: string): Promise<string> => {
  const { data } = await axiosInstance.patch<string>(`/place_folders/${folderId}`, { name, color });
  return data;
};

// 1.6 폴더 삭제
export const deleteFolder = async (folderId: number): Promise<string> => {
  const { data } = await axiosInstance.delete<string>(`/place_folders/${folderId}`);
  return data;
};

// 1.7 폴더 내 여행지 삭제
export const deleteAttractionFromFolder = async (folderId: number, attractionId: number): Promise<string> => {
  const { data } = await axiosInstance.delete<string>(`/place_folders/${folderId}/attractions/${attractionId}`);
  return data;
};
