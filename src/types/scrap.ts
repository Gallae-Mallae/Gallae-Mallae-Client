export interface ScrapFolderDTO {
  folderId: number;
  name: string;
  folderImageUrl: string | null;
  scrapCount: number;
}

export interface ScrapDTO {
  scrapId: number;
  folderId: number;
  title: string;
  content: string;
  description: string | null;
  originalLink: string;
  imageUrl: string;
  createdAt: string;
}
