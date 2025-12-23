export interface Sido {
  id: number;
  code: number;
  name: string;
}

export interface Gugun {
  id: number;
  sidoId: number;
  code: number;
  name: string;
}

export interface PlaceCardDTO {
    id: string;
    imageUrl: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;

    categoryCode: number;
    categoryName: string;

    likes: number;
    isLiked: boolean;
    isMarked: boolean;
}

export interface SearchData {
    sidoName: string;
    sidoCode: number;
    gugunName: string;
    gugunCode: number;
    query: string;
}

export interface PlaceFolderDTO {
    id: string;
    name: string;
    color: string;
    placeCount: number;
}

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