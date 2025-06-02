export interface CallLog {
  id?: number;
  phoneNumber: string;
  contactName?: string;
  callType: string; // 'incoming', 'outgoing', 'missed'
  duration: number;
  simSlot?: number;
  isRead?: number;
  isNew?: number;
  timestamp: number;
}