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
