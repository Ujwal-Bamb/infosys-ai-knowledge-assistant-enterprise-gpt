"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  Search,
} from "lucide-react";
import { initialRecentQueries } from "@/data/mockData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function RecentQueriesPage() {
  const router = useRouter();
  const [queries, setQueries] = useState(initialRecentQueries);
  const [filterText, setFilterText] = useState("");

  const filteredQueries = queries.filter((q) =>
    q.question.toLowerCase().includes(filterText.toLowerCase()) ||
    q.source_document.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleOpenInChat = (question: string) => {
    router.push(`/chat?q=${encodeURIComponent(question)}`);
  };

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

        <Link href="/chat">
          <Button className="bg-[#1E60FF] hover:bg-[#1551E5] text-white gap-2 shadow-sm">
            <MessageSquare className="w-4 h-4" />
            <span>New Question</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter recent queries by question or source..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] shadow-card"
        />
      </div>

      {/* Query List */}
      <div className="space-y-4">
        {filteredQueries.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenInChat(item.question)}
            className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-[#1E60FF]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{item.department}</Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1E60FF] transition-colors leading-snug">
                  {item.question}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.answer_preview}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 pt-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Cited Document:</span>
                  <span className="text-slate-700 font-semibold">
                    {item.source_document}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1E60FF] flex items-center justify-center shrink-0 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}

        {filteredQueries.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
            No queries found matching "{filterText}".
          </div>
        )}
      </div>
    </div>
  );
}
