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