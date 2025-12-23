export interface ScrapFolderDTO {
  folderId: number;
  name: string;
  folderImageUrl: string | null;
  itemCount: number;
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
