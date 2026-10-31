"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { user, role, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Search Bar matching reference UI */}
      <form onSubmit={handleSearchSubmit} className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents, ask questions..."
          className="w-full bg-[#F4F7FC] border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
        />
      </form>

      {/* Right Controls: Notification & User Badge */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-[#1E60FF] rounded-full absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Pill / Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-[#1E60FF] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              {getInitials(user?.full_name)}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.full_name || "User"}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {role}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.email}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                My Profile
              </Link>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                  router.push("/login");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
