"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Paperclip,
  Bot,
  User as UserIcon,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { ChatMessage, SourceCitation } from "@/types";
import { SourceCard } from "@/components/chat/SourceCard";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import { api } from "@/lib/api";

function ChatAssistantContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle incoming query param from search or popular topics
  useEffect(() => {
    const queryParam = searchParams?.get("q");
    if (queryParam) {
      handleSendMessage(queryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: question,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Call real backend /query endpoint
      const response = await api.query({ question, top_k: 5 });

      const mappedSources: SourceCitation[] = (response.sources || []).map(
        (s: any) => ({
          document_title: s.document_title || "Enterprise Document",
          document_id: s.document_id || `DOC-${s.chunk_id || "REF"}`,
          department: s.department,
          page_number: s.page_number || 1,
          similarity: s.similarity || 0.725,
          content_snippet: s.content_snippet || s.snippet || undefined,
        })
      );

      const aiMessage: ChatMessage = {
        id: `ai-${response.query_id || Date.now()}`,
        sender: "ai",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: mappedSources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Unable to retrieve answer**: ${
          error?.message ||
          "Could not connect to the backend RAG pipeline. Please ensure the server is active."
        }`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("• ") || line.startsWith("- ")) {
        const itemText = line.replace(/^[•-]\s+/, "");
        const parts = itemText.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-800 my-1">
            {parts.map((p, i) =>
              p.startsWith("**") && p.endsWith("**") ? (
                <strong key={i} className="font-semibold text-slate-900">
                  {p.slice(2, -2)}
                </strong>
              ) : (
                p
              )
            )}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="my-1 leading-relaxed text-slate-800">
          {parts.map((p, i) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={i} className="font-semibold text-slate-900">
                {p.slice(2, -2)}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto h-[calc(100vh-7rem)]">
      {/* CENTER: Chat Conversation Panel */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E60FF] flex items-center justify-center border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                AI Knowledge Assistant
              </h2>
              <p className="text-xs text-slate-500">
                Grounded in verified enterprise documents
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E60FF] flex items-center justify-center mb-4 border border-blue-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Infosys AI Knowledge Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">
                Ask questions regarding company policies, benefits, travel allowances, HR manuals, or IT guidelines. Responses are strictly grounded in authorized enterprise documentation.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                {/* Timestamp */}
                <span className="text-[11px] text-slate-400 mb-1 px-1">
                  {message.timestamp}
                </span>

                <div
                  className={`flex gap-3 max-w-[85%] ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
                      isUser
                        ? "bg-[#1E60FF] text-white"
                        : "bg-[#0B192C] text-white"
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <span className="font-bold text-[10px]">AI</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm shadow-card ${
                      isUser
                        ? "bg-[#1E60FF] text-white rounded-tr-none"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed">{message.text}</p>
                    ) : (
                      <>
                        <div className="text-xs sm:text-sm">
                          {renderFormattedText(message.text)}
                        </div>

                        {/* Citations directly below answer */}
                        {message.sources && message.sources.length > 0 && (
                          <SourceCard sources={message.sources} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0B192C] text-white flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 shadow-card flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E60FF]" />
                <span>Searching documents and synthesizing grounded answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Question Input at Bottom matching reference UI */}
        <div className="p-4 bg-white border-t border-slate-200/90 shrink-0">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <button
              type="button"
              className="absolute left-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              title="Attach context file (mock)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Type your question here..."
              className="w-full pl-10 pr-12 py-3 bg-[#F4F7FC] border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-2.5 w-8 h-8 rounded-lg bg-[#1E60FF] hover:bg-[#1551E5] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Permanent Suggested Questions Panel matching reference UI */}
      <SuggestedQuestions
        onSelectQuestion={(q) => handleSendMessage(q)}
        disabled={isLoading}
      />
    </div>
  );
}

export default function ChatAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-7rem)] text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E60FF]" />
        </div>
      }
    >
      <ChatAssistantContent />
    </Suspense>
  );
}
