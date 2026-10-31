"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  FileText,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initialDocuments } from "@/data/mockData";
import { DocumentItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DocumentManagementPage() {
  const { isAdmin, role, switchRole } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Non-admin Access Guard
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white rounded-2xl p-8 border border-slate-200/90 shadow-card text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Admin Access Required
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Document Management is restricted to users with the{" "}
          <strong className="text-slate-700">Admin</strong> role. Your active
          role is currently{" "}
          <span className="font-semibold text-[#1E60FF]">{role}</span>.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="secondary">Return to Dashboard</Button>
          </Link>
          <Button onClick={() => switchRole("Admin")}>
            Switch to Admin Role (Demo)
          </Button>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      selectedDept === "All Departments" || doc.department === selectedDept;
    const matchesStatus =
      selectedStatus === "All Status" || doc.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearch("");
    setSelectedDept("All Departments");
    setSelectedStatus("All Status");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document from the knowledge base?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header matching reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Document Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View and manage all uploaded documents in the knowledge base
          </p>
        </div>

        <Link href="/upload">
          <Button className="bg-[#1E60FF] hover:bg-[#1551E5] text-white gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar matching reference UI */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-card flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-[#F4F7FC] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-[#F4F7FC] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E60FF]"
        >
          <option>All Departments</option>
          <option>HR</option>
          <option>IT</option>
          <option>Finance</option>
          <option>Facilities</option>
          <option>Legal</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#F4F7FC] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E60FF]"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Processing</option>
          <option>Archived</option>
        </select>

        {/* Clear Button */}
        <button
          onClick={handleClearFilters}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Document Data Table matching reference UI */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Pages</th>
                <th className="py-3.5 px-6">Upload Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-[#1E60FF] hover:underline cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span onClick={() => setPreviewDoc(doc)}>{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600">
                    {doc.department}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600">
                    {doc.pages}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600">
                    {doc.uploaded_at}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="success" className="font-semibold text-[11px]">
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 hover:text-[#1E60FF] hover:bg-blue-50 rounded-md transition-colors"
                        title="View Preview"
                      >
                        <Eye className="w-4 h-4 text-[#1E60FF]" />
                      </button>
                      <button
                        onClick={() =>
                          alert(`Downloading copy of ${doc.filename}`)
                        }
                        className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar matching reference UI */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>Showing 1 to {filteredDocs.length} of 25 documents</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-40"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
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
              onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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
                    {previewDoc.document_id} • {previewDoc.department} Department
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
                <span>{previewDoc.pages} pages extracted</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Vector Embeddings:</span>
                <span className="text-emerald-600 font-semibold">1,536 dimensions (Synchronized)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Indexed On:</span>
                <span>{previewDoc.uploaded_at}</span>
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
