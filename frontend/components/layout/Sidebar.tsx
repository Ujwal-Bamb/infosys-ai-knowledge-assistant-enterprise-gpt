"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  UploadCloud,
  History,
  User as UserIcon,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role, isAdmin, switchRole } = useAuth();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      name: "Chat Assistant",
      href: "/chat",
      icon: MessageSquareText,
      adminOnly: false,
    },
    {
      name: "Document Management",
      href: "/documents",
      icon: FileText,
      adminOnly: true,
    },
    {
      name: "Upload Document",
      href: "/upload",
      icon: UploadCloud,
      adminOnly: true,
    },
    {
      name: "Recent Queries",
      href: "/recent-queries",
      icon: History,
      adminOnly: false,
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: UserIcon,
      adminOnly: false,
    },
  ];

  // Filter items: Document Management and Upload Document only visible to Admin users
  const visibleItems = navigationItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-[#132742]">
      {/* Brand Section */}
      <div>
        <div className="px-6 py-6 border-b border-[#132742]/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Infosys
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1E60FF]/20 text-[#60A5FA] border border-[#1E60FF]/30">
              GPT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
            AI Knowledge Assistant
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-4 space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : Boolean(pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-[#1E60FF] text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-[#132742]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-white" : "text-slate-400"
                  )}
                />
                <span>{item.name}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher & System Badge */}
      <div className="p-4 m-3 rounded-xl bg-[#071224] border border-[#132742]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Active Role</span>
          </div>
          <span
            className={cn(
              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
              role === "Admin"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : role === "Employer"
                ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                : "bg-blue-400/20 text-blue-300 border border-blue-400/30"
            )}
          >
            {role}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5">
          Switch view to test role-based permissions:
        </p>

        <div className="grid grid-cols-3 gap-1">
          {(["Admin", "Employee", "Employer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={cn(
                "py-1 text-[11px] font-medium rounded transition-all",
                role === r
                  ? "bg-[#1E60FF] text-white font-semibold shadow"
                  : "bg-[#0E213B] text-slate-400 hover:text-white hover:bg-[#132742]"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
