export interface ScrapFolderDTO {
  folderId: number;
  name: string;
  folderImageUrl: string;
  itemCount?: number;
}

export interface ScrapDTO {
  scrapId: number;
  folderId: number;
  title: string;
  content: string;
  description: string;
  originalLink: string;
  imageUrl: string;
}
