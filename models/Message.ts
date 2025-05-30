export interface Message {
  id?: number;
  phoneNumber: string;
  contactName: string;
  content: string;
  contentType: number;
  sender: number;
  status?: number;
  isRead?: number;
  simSlot?: number;
  threadId: number;
  timestamp?: number;
}