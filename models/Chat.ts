export interface Chat {
  id?: number;
  content: string;
  sender: number;
  contentType: number;
  filePath?: string;
  timestamp?: number;
}