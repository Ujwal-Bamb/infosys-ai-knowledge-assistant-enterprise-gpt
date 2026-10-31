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
    localStorage.removeItem("infosys_user_override");
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ access_token: string; user: { id: number; full_name: string; email: string; role: string } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    ),

  register: (data: { full_name: string; email: string; password: string }) =>
    request<{ message: string; user_id: number; full_name: string; email: string; role: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  getMe: () =>
    request<{ id: number; full_name: string; email: string; role: string }>("/auth/me"),

  // Documents
  getDocuments: () =>
    request<any[]>("/documents"),

  uploadDocument: (formData: FormData) =>
    request<any>("/documents/upload", {
      method: "POST",
      body: formData,
    }),

  // Query / RAG
  query: (data: { question: string; department?: string; top_k?: number }) =>
    request<{ question: string; answer: string; sources: any[] }>("/query", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
