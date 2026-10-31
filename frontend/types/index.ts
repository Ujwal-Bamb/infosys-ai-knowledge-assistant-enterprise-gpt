export type UserRole = "Admin" | "Employee" | "Employer";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  member_since?: string;
}

export interface SourceCitation {
  document_title: string;
  document_id: string;
  department?: string;
  page_number: number;
  chunk_id?: number;
  similarity: number;
  content_snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: SourceCitation[];
}

export interface DocumentItem {
  id: number;
  document_id: string;
  title: string;
  filename: string;
  department: string;
  pages: number;
  uploaded_at: string;
  status: "Active" | "Processing" | "Archived";
  uploaded_by?: string;
}

export interface RecentQuery {
  id: string;
  question: string;
  timestamp: string;
  answer_preview: string;
  source_document: string;
  department: string;
}
