"use client";

import React, { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage() {
  const { user, role, setUserProfile, switchRole } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john.doe@infosys.com");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "JD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev) => ({
      ...prev,
      full_name: fullName,
      email: email,
    }));
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header matching reference UI */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Profile Overview Card matching reference UI */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
          {/* Avatar JD matching reference UI */}
          <div className="w-20 h-20 rounded-full bg-[#1E60FF] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            {getInitials(user?.full_name)}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user?.full_name || "John Doe"}
              </h2>
              <Badge
                variant="success"
                className="w-fit mx-auto sm:mx-0 font-semibold text-xs"
              >
                {role}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#1E60FF]" />
                Role: <strong className="text-slate-700">{role}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member Since:{" "}
                <strong className="text-slate-700">
                  {user?.member_since || "Oct 15, 2026"}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Role Switcher for reviewers */}
          <div className="sm:border-l sm:border-slate-100 sm:pl-6 text-center sm:text-left">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Switch Test Role:
            </p>
            <div className="flex sm:flex-col gap-1.5">
              {(["Employee", "Admin", "Employer"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    role === r
                      ? "bg-[#1E60FF] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Full Name
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {user?.full_name || "John Doe"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Email Address
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {user?.email || "john.doe@infosys.com"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Role
            </span>
            <p className="text-sm font-semibold text-slate-800">{role}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              Member Since
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {user?.member_since || "Oct 15, 2026"}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Card matching reference UI */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E60FF] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-400">
              Ensure your account is using a secure enterprise password
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Password updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full bg-[#F4F7FC] border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min. 8 characters)"
                className="w-full bg-[#F4F7FC] border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full bg-[#F4F7FC] border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Change Password Button matching reference UI */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#1E60FF] hover:bg-[#1551E5] text-white shadow-sm font-semibold mt-2"
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
}
