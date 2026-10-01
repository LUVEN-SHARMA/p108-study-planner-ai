export type SessionStatus = "pending" | "completed" | "missed";
export type SessionKind = "study" | "revision";

export interface StudySession {
  id: number;
  topic_id: number;
  topic_name: string;
  subject_name: string;
  date: string;
  start: string;
  end: string;
  kind: SessionKind;
  status: SessionStatus;
}

export interface DailyTask {
  id: number;
  title: string;
  task_date: string;
  start: string | null;
  note: string | null;
  status: SessionStatus;
}

export interface Subject {
  id: number;
  name: string;
  exam_date: string;
  weightage: number;
  topics: Topic[];
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  est_hours: number | null;
  difficulty: number;
  confidence: number;
}