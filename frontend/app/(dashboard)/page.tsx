"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Building2,
  HelpCircle,
  CheckCircle2,
  MessageSquarePlus,
  Files,
  History,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { popularTopics } from "@/data/mockData";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface DashboardStats {
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
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || "User";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.warn("Could not load live dashboard analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Documents",
      value: isLoading ? "—" : String(stats?.total_documents ?? 0),
      icon: FileText,
      change: stats?.total_documents ? "Indexed in vector DB" : "No documents yet",
    },
    {
      label: "Departments",
      value: isLoading ? "—" : String(stats?.total_departments ?? 0),
      icon: Building2,
      change: "Active organizational units",
    },
    {
      label: "Recent Queries",
      value: isLoading ? "—" : String(stats?.user_recent_queries_count ?? 0),
      icon: HelpCircle,
      change: "Your logged inquiries",
    },
    {
      label: "Helpful Answers",
      value: isLoading
        ? "—"
        : stats?.user_recent_queries_count === 0
        ? "0%"
        : `${stats?.answered_rate ?? 0}%`,
      icon: CheckCircle2,
      change: "Grounded citations",
    },
  ];

  const quickActions = [
    {
      title: "Ask a Question",
      description: "Get answers from company documents",
      href: "/chat",
      icon: MessageSquarePlus,
      color: "bg-blue-50 text-[#1E60FF] border-blue-100",
    },
    {
      title: "Browse Documents",
      description: "View available knowledge base documents",
      href: "/documents",
      icon: Files,
      color: "bg-sky-50 text-sky-600 border-sky-100",
    },
    {
      title: "View Recent Queries",
      description: "See your past questions and answers",
      href: "/recent-queries",
      icon: History,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  const handleTopicClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner matching reference UI */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#E0EEFF] to-[#DBEAFE] p-8 border border-blue-100/80 shadow-sm flex items-center justify-between">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-[#1E60FF] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Knowledge Assistant Online
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
            Ask questions, find policies, and get instant verified answers from
            standard operating procedures and company manuals.
          </p>
        </div>

        {/* Decorative graphic card */}
        <div className="hidden lg:flex items-center justify-center p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-[#1E60FF] text-white flex items-center justify-center shadow-md">
            <Files className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards matching reference UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-500 tracking-wide">
                  {stat.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[11px] font-medium text-emerald-600 mt-1">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions matching reference UI */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-[#1E60FF]/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${action.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E60FF] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-[#1E60FF] mt-4 gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User's Real Recent Queries */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Your Recent Queries
              </h2>
              <Link
                href="/recent-queries"
                className="text-xs font-semibold text-[#1E60FF] hover:underline"
              >
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1E60FF] mb-2" />
                <span className="text-xs">Loading activity...</span>
              </div>
            ) : stats?.recent_queries && stats.recent_queries.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_queries.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleTopicClick(q.question)}
                    className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-blue-50/60 border border-slate-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#1E60FF] line-clamp-1">
                        {q.question}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDate(q.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No queries logged yet. Ask your first question in Chat Assistant!
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link href="/chat">
              <Button size="sm" variant="secondary" className="w-full text-xs">
                Start New Chat Inquiry
              </Button>
            </Link>
          </div>
        </div>

        {/* Recently Added Documents */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Knowledge Base Documents
              </h2>
              <Link
                href="/documents"
                className="text-xs font-semibold text-[#1E60FF] hover:underline"
              >
                Manage
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1E60FF] mb-2" />
                <span className="text-xs">Loading documents...</span>
              </div>
            ) : stats?.recent_documents && stats.recent_documents.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#1E60FF] shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {doc.department || "General"} • {doc.page_count ?? 1} pages
                        </span>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px] shrink-0">
                      Indexed
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No documents uploaded yet. Admins can upload PDFs to populate the repository.
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link href="/documents">
              <Button size="sm" variant="secondary" className="w-full text-xs">
                Browse Full Document Library
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Topics matching reference UI */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-card">
        <h2 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
          Popular Topics
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Select any organizational domain to launch a contextual query in the AI Assistant:
        </p>
        <div className="flex flex-wrap gap-2.5">
          {popularTopics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => handleTopicClick(topic.query)}
              className="px-4 py-2 rounded-lg bg-[#F4F7FC] hover:bg-[#EBF3FE] text-slate-700 hover:text-[#1E60FF] border border-slate-200/80 hover:border-[#1E60FF]/30 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>{topic.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
