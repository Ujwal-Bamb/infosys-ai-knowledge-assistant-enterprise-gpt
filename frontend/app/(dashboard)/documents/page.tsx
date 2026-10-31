"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DocumentItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function DocumentManagementPage() {
  const { isAdmin } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const itemsPerPage = 10;

  const loadDocuments = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await api.getDocuments();
      setDocuments(data || []);
    } catch (err: any) {
      setFetchError(err.message || "Failed to load documents from server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const titleMatch = (doc.title || "").toLowerCase().includes(search.toLowerCase());
    const fileMatch = (doc.filename || "").toLowerCase().includes(search.toLowerCase());
    const deptMatch = (doc.department || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || fileMatch || deptMatch;

    const matchesDept =
      selectedDept === "All Departments" ||
      (doc.department || "").toLowerCase() === selectedDept.toLowerCase();

    return matchesSearch && matchesDept;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearch("");
    setSelectedDept("All Departments");
    setCurrentPage(1);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!isAdmin) return;
    if (
      !confirm(
        `Are you sure you want to delete "${title}" from the knowledge base? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    try {
      await api.deleteDocument(id);
      setActionSuccess(`Document "${title}" was successfully deleted.`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Failed to delete document.");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Document Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and inspect verified company documents in the knowledge repository
          </p>
        </div>

        {isAdmin && (
          <Link href="/upload">
            <Button className="bg-[#1E60FF] hover:bg-[#1551E5] text-white gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-card flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, filename, or department..."
            className="w-full bg-[#F4F7FC] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#F4F7FC] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E60FF]"
        >
          <option>All Departments</option>
          <option>General</option>
          <option>HR</option>
          <option>IT</option>
          <option>Finance</option>
          <option>Facilities</option>
          <option>Legal</option>
        </select>

        {/* Clear Button */}
        <button
          onClick={handleClearFilters}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          Clear
        </button>

        {/* Reload Button */}
        <button
          onClick={loadDocuments}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E60FF] hover:bg-blue-50 transition-colors disabled:opacity-50 ml-auto"
          title="Refresh documents list"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#1E60FF]" : ""}`} />
        </button>
      </div>

      {/* Document Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1E60FF]" />
            <p className="text-xs">Loading documents from knowledge base...</p>
          </div>
        ) : fetchError ? (
          <div className="py-16 text-center text-rose-600 flex flex-col items-center justify-center gap-3 px-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-semibold">{fetchError}</p>
            <Button size="sm" variant="secondary" onClick={loadDocuments}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Title</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Pages</th>
                  <th className="py-3.5 px-6">Chunks</th>
                  <th className="py-3.5 px-6">Upload Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-[#1E60FF] hover:underline cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span onClick={() => setPreviewDoc(doc)}>{doc.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 ml-6">
                        {doc.filename}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {doc.department || "General"}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {doc.page_count ?? doc.pages ?? 1}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {doc.chunk_count ?? "—"}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {formatDate(doc.uploaded_at)}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="success" className="font-semibold text-[11px]">
                        Active
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 hover:text-[#1E60FF] hover:bg-blue-50 rounded-md transition-colors"
                          title="View Preview"
                        >
                          <Eye className="w-4 h-4 text-[#1E60FF]" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(doc.id, doc.title)}
                            className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Document (Admin only)"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      {documents.length === 0
                        ? "No documents in the knowledge base yet. Upload a PDF to get started."
                        : "No documents found matching the search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        {!isLoading && !fetchError && filteredDocs.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDocs.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredDocs.length)} of {filteredDocs.length} documents
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md font-semibold text-xs flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-[#1E60FF] text-white shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E60FF] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {previewDoc.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {previewDoc.document_id || `ID: ${previewDoc.id}`} • {previewDoc.department || "General"} Department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">File Name:</span>
                <span className="font-mono text-slate-700">{previewDoc.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Total Pages:</span>
                <span>{previewDoc.page_count ?? previewDoc.pages ?? 1} extracted pages</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Text Chunks:</span>
                <span>{previewDoc.chunk_count ?? "—"} indexed chunks</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Vector Embeddings:</span>
                <span className="text-emerald-600 font-semibold">1,536 dimensions (Synchronized)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Indexed On:</span>
                <span>{formatDate(previewDoc.uploaded_at)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
              <Link href={`/chat?q=Summarize key points in ${encodeURIComponent(previewDoc.title)}`}>
                <Button>Query This Document</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
