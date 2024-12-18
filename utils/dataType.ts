export interface BibleType {
  title: string;
  content: string;
}

export interface HistoryType {
  prayer_history_id: string;
  duration: number;
  note: string;
  created_date: number; // Unix timestamp
}