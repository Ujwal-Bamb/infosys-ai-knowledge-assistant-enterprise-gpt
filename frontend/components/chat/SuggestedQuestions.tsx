"use client";

import React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";
import { suggestedQuestions } from "@/data/mockData";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  onSelectQuestion,
  disabled,
}: SuggestedQuestionsProps) {
  return (
    <div className="w-80 shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col h-[calc(100vh-7rem)] sticky top-20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-[#F8FAFC]">
        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
          <Lightbulb className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          Suggested Questions
        </h3>
      </div>

      {/* Clickable Questions List matching reference UI */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onSelectQuestion(question)}
            className="w-full text-left p-3 rounded-xl border border-slate-100 bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#1E60FF]/30 text-xs font-medium text-slate-700 hover:text-[#1E60FF] transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <span className="line-clamp-2 leading-snug">{question}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E60FF] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {/* Helper Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
        Click any query to ask Enterprise GPT
      </div>
    </div>
  );
}
