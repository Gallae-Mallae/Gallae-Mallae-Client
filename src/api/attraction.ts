import axiosInstance from './http';

export interface MapAttractionParams {
  zoomLevel: number;
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
  sido?: number;
  guguns?: number;
  keyword?: string;
  contenttype?: number;
}

export interface MapAttractionResponse {
  attrId: number;
  latitude: number;
  longitude: number;
  count: number;
  title: string | null;
}

export interface AttractionResponse {
  attrId: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  categoryCode: number;
  likes: number;
  isLiked: boolean;
  isMarked: boolean;
}

export const getMapAttractions = async (params: MapAttractionParams): Promise<MapAttractionResponse[]> => {
  const { data } = await axiosInstance.get<MapAttractionResponse[]>('/attractions/map', {
    params,
  });
  return data;
};

export const getAttractions = async (params: MapAttractionParams): Promise<AttractionResponse[]> => {
  const { data } = await axiosInstance.get<AttractionResponse[]>('/attractions/map', {
    params,
  });
  return data;
};

export interface SidebarAttractionItem {
  attractionId: number;
  count: number;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  contentTypeId: number;
  likeCount: number;
}

export interface SidebarListResponse {
  attractions: SidebarAttractionItem[];
  hasNext: boolean;
  nowPage: number;
}

export interface SidebarAttractionParams extends MapAttractionParams {
  page?: number;
  size?: number;
}

export const getSidebarAttractions = async (params: SidebarAttractionParams): Promise<SidebarListResponse> => {
  const { data } = await axiosInstance.get<SidebarListResponse>('/attractions/map/sidebar', {
    params,
  });
  return data;
};

export interface AttractionDetailResponse {
  attractionId: number;
  title: string;
  address: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  viewCount: number;
  likeCount: number;
  overview: string;
  contentTypeId: number;
}

export const getAttractionDetail = async (attractionId: number): Promise<AttractionDetailResponse> => {
  const { data } = await axiosInstance.get<AttractionDetailResponse>(`/attractions/map/${attractionId}`);
  return data;
};

// --- 좋아요 관련 API ---

// 내 좋아요 ID 목록 조회
export const getMyLikedIds = async (): Promise<number[]> => {
    const { data } = await axiosInstance.get<number[]>('/attractions/likes/my');
    return data;
};

// 좋아요 토글 (등록/취소)
export const toggleLike = async (attractionId: number): Promise<void> => {
    await axiosInstance.post(`/attractions/${attractionId}/likes`);
};

