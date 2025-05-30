export interface Gallery {
  id?: number;
  mediaId: string;
  fileName: string;
  filePath: string;
  mediaType?: 'image' | 'video';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  dateTaken: number;
  dateModified?: number;
  isFavorite?: number;
  synced?: number;
}