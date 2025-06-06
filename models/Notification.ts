export interface Notification {
  id?: number;
  title: string;
  content?: string;
  isGroup?: number;
  groupKey?: string;
  actions?: string;
  iconId: number;
  postTime: number;
}

export interface Action {
  index: number
  isReplyable: boolean
  title: string
}