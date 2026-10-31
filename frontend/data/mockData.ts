import { ChatMessage, DocumentItem, RecentQuery, User } from "@/types";

export const initialUser: User = {
  id: 1,
  full_name: "John Doe",
  email: "john.doe@infosys.com",
  role: "Employee",
  is_active: true,
  member_since: "Oct 15, 2026",
};

export const adminUser: User = {
  id: 2,
  full_name: "Admin User",
  email: "admin@infosys.com",
  role: "Admin",
  is_active: true,
  member_since: "Aug 01, 2026",
};

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

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    text: "What is the referral reward for employees?",
    timestamp: "10:30 AM",
  },
  {
    id: "msg-2",
    sender: "ai",
    text: `The referral reward for employees depends on the experience band of the referred candidate:

• **Below 5 Years Experience**: INR 10,000
• **5 to 10 Years Experience**: INR 15,000
• **10 to 15 Years Experience**: INR 20,000
• **Above 15 Years Experience**: INR 30,000

The referral bonus is paid after the hired candidate completes 90 days of continuous service.`,
    timestamp: "10:30 AM",
    sources: [
      {
        document_title: "Infosys HR Policies Master Manual",
        document_id: "DOC-HR-2026-001",
        department: "HR",
        page_number: 3,
        similarity: 0.7486,
        content_snippet:
          "Section 4.2 - Employee Referral Program: Rewarding talent acquisition via employee networks. Bonus tiers: <5 yrs exp: INR 10,000; 5-10 yrs: INR 15,000; 10-15 yrs: INR 20,000; >15 yrs: INR 30,000. Payout schedule requires 90 days retention.",
      },
      {
        document_title: "Compensation & Benefits Handbook",
        document_id: "DOC-HR-2026-004",
        department: "HR",
        page_number: 14,
        similarity: 0.6821,
        content_snippet:
          "Disbursement guidelines for referral and talent incentives through standard payroll cycles.",
      },
      {
        document_title: "Talent Acquisition Guidelines",
        document_id: "DOC-TA-2026-012",
        department: "HR",
        page_number: 7,
        similarity: 0.6145,
        content_snippet:
          "Eligibility criteria: All permanent employees excluding Hiring Managers and HR Talent Acquisition team.",
      },
    ],
  },
];

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

export const initialRecentQueries: RecentQuery[] = [
  {
    id: "rq-1",
    question: "What is the referral reward for employees?",
    timestamp: "Today at 10:30 AM",
    answer_preview: "The referral reward ranges from INR 10,000 to INR 30,000 based on candidate experience band...",
    source_document: "Infosys HR Policies Master Manual",
    department: "HR",
  },
  {
    id: "rq-2",
    question: "What is the annual sick leave entitlement?",
    timestamp: "Yesterday at 4:15 PM",
    answer_preview: "Employees are eligible for 12 days of paid sick leave annually, credited at the start of January...",
    source_document: "Infosys HR Policies Master Manual",
    department: "HR",
  },
  {
    id: "rq-3",
    question: "How do I request access to internal Git repositories?",
    timestamp: "Oct 29, 2026 at 2:00 PM",
    answer_preview: "Repository permissions are requested through the IT Service Portal under 'Developer Access Request'...",
    source_document: "Security and Access Policy",
    department: "IT",
  },
  {
    id: "rq-4",
    question: "What is the maximum reimbursement for domestic meal per diem?",
    timestamp: "Oct 27, 2026 at 11:45 AM",
    answer_preview: "Tier-1 cities qualify for up to INR 1,500 daily per diem on authorized business travel without receipt itemization...",
    source_document: "Travel and Expense Policy",
    department: "Finance",
  },
];
