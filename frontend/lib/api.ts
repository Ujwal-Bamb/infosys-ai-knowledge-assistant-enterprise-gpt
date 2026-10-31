const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("infosys_access_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("infosys_access_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("infosys_access_token");
    localStorage.removeItem("infosys_user_profile");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    throw new Error(
      `Unable to connect to backend server at ${API_BASE_URL}. Please ensure FastAPI is running.`
    );
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText || `Request failed with status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{
      access_token: string;
      token_type: string;
      user: { id: number; full_name: string; email: string; role: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (data: { full_name: string; email: string; password: string }) =>
    request<{
      message: string;
      user_id: number;
      full_name: string;
      email: string;
      role: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ id: number; full_name: string; email: string; role: string }>("/auth/me"),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Documents
  getDocuments: () => request<any[]>("/documents"),

  uploadDocument: (formData: FormData) =>
    request<any>("/documents/upload", {
      method: "POST",
      body: formData,
    }),

  deleteDocument: (id: number) =>
    request<{ message: string }>(`/documents/${id}`, {
      method: "DELETE",
    }),

  // Query / RAG
  query: (data: { question: string; department?: string; top_k?: number }) =>
    request<{
      query_id: number;
      question: string;
      answer: string;
      sources: any[];
      has_sufficient_evidence?: boolean;
    }>("/query", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Query History
  getQueryHistory: () =>
    request<
      Array<{
        id: number;
        question: string;
        answer: string;
        department?: string;
        sources: any[];
        has_sufficient_evidence: boolean;
        created_at: string;
      }>
    >("/queries/history"),

  clearQueryHistory: () =>
    request<{ message: string; deleted_count: number }>("/queries/history", {
      method: "DELETE",
    }),

  deleteQueryHistoryItem: (query_id: number) =>
    request<{ message: string }>(`/queries/history/${query_id}`, {
      method: "DELETE",
    }),

  // Analytics & Dashboard Stats
  getDashboardStats: () =>
    request<{
      total_documents: number;
      total_departments: number;
      user_recent_queries_count: number;
      answered_rate: number;
      recent_queries: Array<{
        id: number;
        question: string;
        answer: string;
        department?: string;
        sources: any[];
        has_sufficient_evidence: boolean;
        created_at: string;
      }>;
      recent_documents: Array<{
        id: number;
        document_id?: string;
        title: string;
        filename: string;
        department?: string;
        uploaded_at: string;
        page_count?: number;
        chunk_count?: number;
      }>;
    }>("/analytics/dashboard-stats"),
};

