"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { SourceCitation } from "@/types";

interface SourceCardProps {
  sources: SourceCitation[];
}

export function SourceCard({ sources }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      {/* Sources Accordion Toggle matching reference UI */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#1E60FF] transition-colors mb-2"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span>Sources ({sources.length})</span>
      </button>

      {isOpen && (
        <div className="space-y-2">
          {sources.map((source, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] hover:bg-white hover:border-[#1E60FF]/40 transition-all overflow-hidden"
              >
                <div
                  onClick={() =>
                    setExpandedIndex(isExpanded ? null : index)
                  }
                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {source.document_title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Page {source.page_number} • Similarity:{" "}
                        <span className="font-semibold text-emerald-600">
                          {source.similarity.toFixed(4)}
                        </span>
                        {source.department && ` • ${source.department}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600 p-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 text-xs text-slate-600 bg-white leading-relaxed">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Matched Document Excerpt:
                    </p>
                    <p className="p-2 rounded bg-slate-50 border border-slate-100 italic">
                      "{source.content_snippet || "Relevant document context utilized for answering this query."}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
