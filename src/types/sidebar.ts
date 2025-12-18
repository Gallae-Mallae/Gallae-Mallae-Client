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

export interface PlaceFolderDTO {
    id: string;
    name: string;
    color: string;
    placeCount: number;
}