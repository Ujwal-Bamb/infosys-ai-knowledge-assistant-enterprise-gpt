"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  Search,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface QueryHistoryRecord {
  id: number;
  question: string;
  answer: string;
  department?: string;
  sources: any[];
  has_sufficient_evidence: boolean;
  created_at: string;
}

export default function RecentQueriesPage() {
  const router = useRouter();
  const [queries, setQueries] = useState<QueryHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQueryHistory();
      setQueries(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load recent queries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearAll = async () => {
    if (queries.length === 0) return;
    if (!confirm("Are you sure you want to clear your entire query history?")) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.clearQueryHistory();
      setQueries([]);
      setActionSuccess(res.message || "Query history cleared successfully");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err?.message || "Failed to clear history");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.deleteQueryHistoryItem(id);
      setQueries((prev) => prev.filter((q) => q.id !== id));
      setActionSuccess("Query removed from history");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err?.message || "Failed to remove query");
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleOpenInChat = (question: string) => {
    router.push(`/chat?q=${encodeURIComponent(question)}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return dateStr;
    }
  };

  const filteredQueries = queries.filter((q) => {
    const matchesText =
      q.question.toLowerCase().includes(filterText.toLowerCase()) ||
      q.answer.toLowerCase().includes(filterText.toLowerCase()) ||
      (q.sources || []).some((s: any) =>
        (s.document_title || "").toLowerCase().includes(filterText.toLowerCase())
      );

    const matchesDept =
      selectedDept === "All Departments" ||
      (q.department || "").toLowerCase() === selectedDept.toLowerCase();

    return matchesText && matchesDept;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recent Queries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and review your past questions and grounded AI answers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {queries.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleClearAll}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </Button>
          )}

          <Link href="/chat">
            <Button className="bg-[#1E60FF] hover:bg-[#1551E5] text-white gap-2 shadow-sm text-xs">
              <MessageSquare className="w-4 h-4" />
              <span>New Question</span>
            </Button>
          </Link>
        </div>
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

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter recent queries by question or cited document..."
            className="w-full bg-[#F4F7FC] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-[#F4F7FC] border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E60FF]"
        >
          <option>All Departments</option>
          <option>General</option>
          <option>HR</option>
          <option>IT</option>
          <option>Finance</option>
          <option>Facilities</option>
          <option>Legal</option>
        </select>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="p-2 rounded-lg text-slate-400 hover:text-[#1E60FF] hover:bg-blue-50 transition-colors disabled:opacity-50"
          title="Refresh queries"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#1E60FF]" : ""}`} />
        </button>
      </div>

      {/* Query List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1E60FF]" />
            <p className="text-xs text-slate-500">Loading your query history...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-xs text-rose-600 font-medium">{error}</p>
            <Button size="sm" variant="secondary" onClick={loadHistory}>
              Try Again
            </Button>
          </div>
        ) : filteredQueries.length > 0 ? (
          filteredQueries.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenInChat(item.question)}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-[#1E60FF]/40 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.department && (
                      <Badge variant="brand">{item.department}</Badge>
                    )}
                    <Badge
                      variant={item.has_sufficient_evidence ? "success" : "neutral"}
                      className="text-[10px]"
                    >
                      {item.has_sufficient_evidence ? "Grounded" : "Unverified"}
                    </Badge>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1E60FF] transition-colors leading-snug">
                    {item.question}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.answer}
                  </p>

                  {item.sources && item.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 pt-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400">Primary Source:</span>
                      <span className="text-slate-700 font-semibold">
                        {item.sources[0].document_title}
                      </span>
                      {item.sources.length > 1 && (
                        <span className="text-[10px] text-slate-400">
                          (+{item.sources.length - 1} more)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete query record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1E60FF] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-16 text-center border border-slate-200 text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E60FF] flex items-center justify-center border border-blue-100">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No Query History Found</p>
            <p className="text-xs text-slate-400 max-w-sm">
              {queries.length === 0
                ? "You haven't submitted any questions yet. Start a conversation in Chat Assistant to build your search history."
                : `No past queries matching "${filterText}".`}
            </p>
            {queries.length === 0 && (
              <Link href="/chat">
                <Button size="sm" className="mt-2 bg-[#1E60FF] text-white">
                  Ask Your First Question
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
