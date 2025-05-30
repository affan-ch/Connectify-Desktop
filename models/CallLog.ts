export interface CallLog {
  id?: number;
  phoneNumber: string;
  callType: number;
  duration?: number;
  simSlot?: number;
  isRead?: number;
  isNew?: number;
  timestamp?: number;
}