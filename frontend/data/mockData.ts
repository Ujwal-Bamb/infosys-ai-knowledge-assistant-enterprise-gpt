import { ChatMessage, DocumentItem, RecentQuery } from "@/types";

export const suggestedQuestions = [
  "What is the referral reward for employees?",
  "What is the leave policy?",
  "How to claim travel expenses?",
  "What are the IT security guidelines?",
  "What is the work from home policy?",
  "How to raise an IT support ticket?",
  "What are the benefits for employees?",
  "What is the code of ethics?",
];

export const popularTopics = [
  { name: "HR Policies", icon: "FileText", query: "What are the core HR policies?" },
  { name: "IT & Security", icon: "Shield", query: "What are the IT security policies and access rules?" },
  { name: "Finance", icon: "CreditCard", query: "What are the expense submission guidelines?" },
  { name: "Travel & Expense", icon: "Plane", query: "How to claim travel and lodging expenses?" },
  { name: "Workplace Guidelines", icon: "Building", query: "What are the company workplace and dress code rules?" },
  { name: "Facilities", icon: "HelpCircle", query: "How to request facility or office access?" },
];

export const initialChatMessages: ChatMessage[] = [];

export const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    document_id: "DOC-HR-2026-001",
    title: "Infosys HR Policies Master Manual",
    filename: "infosys_hr_policies_2026.pdf",
    department: "HR",
    pages: 156,
    uploaded_at: "Oct 28, 2026",
    status: "Active",
    uploaded_by: "Admin User",
  },
  {
    id: 2,
    document_id: "DOC-IT-2026-003",
    title: "IT and Code of Ethics",
    filename: "it_code_of_ethics_v4.pdf",
    department: "IT",
    pages: 89,
    uploaded_at: "Oct 25, 2026",
    status: "Active",
    uploaded_by: "Admin User",
  },
  {
    id: 3,
    document_id: "DOC-FIN-2026-007",
    title: "Travel and Expense Policy",
    filename: "travel_and_expense_policy.pdf",
    department: "Finance",
    pages: 45,
    uploaded_at: "Oct 20, 2026",
    status: "Active",
    uploaded_by: "Admin User",
  },
  {
    id: 4,
    document_id: "DOC-FAC-2026-002",
    title: "Workplace Guidelines",
    filename: "workplace_guidelines_2026.pdf",
    department: "Facilities",
    pages: 32,
    uploaded_at: "Oct 18, 2026",
    status: "Active",
    uploaded_by: "Admin User",
  },
  {
    id: 5,
    document_id: "DOC-IT-2026-009",
    title: "Security and Access Policy",
    filename: "security_and_access_policy.pdf",
    department: "IT",
    pages: 28,
    uploaded_at: "Oct 15, 2026",
    status: "Active",
    uploaded_by: "Admin User",
  },
];

export const initialRecentQueries: RecentQuery[] = [];
