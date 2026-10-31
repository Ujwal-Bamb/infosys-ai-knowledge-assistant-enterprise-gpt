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
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { role, isAdmin } = useAuth();

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
      adminOnly: false,
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

      {/* Verified Role Badge (Read-only) */}
      <div className="p-4 m-3 rounded-xl bg-[#071224] border border-[#132742]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Assigned Role</span>
          </div>
          <span
            className={cn(
              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
              isAdmin
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : "bg-blue-400/20 text-blue-300 border border-blue-400/30"
            )}
          >
            {role}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {isAdmin
            ? "Administrative privileges active."
            : "Employee knowledge access enabled."}
        </p>
      </div>
    </aside>
  );
}
