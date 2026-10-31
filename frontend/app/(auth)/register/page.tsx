"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7FC]">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0B192C] via-[#0E2A52] to-[#1E60FF] text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold tracking-tight font-sans text-white">
              Infosys
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1E60FF] text-white">
              Enterprise GPT
            </span>
          </div>
          <p className="text-sm text-blue-200 mt-1 font-medium">
            AI Knowledge Assistant
          </p>
        </div>

        <div className="max-w-lg my-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Fast & Secure Enterprise Onboarding
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Join the Enterprise Knowledge Network.
          </h1>
          <p className="text-base text-blue-100/90 leading-relaxed">
            Create your employee account to instantly search across company
            standard operating procedures, project manuals, and HR policies.
          </p>
        </div>

        <div className="text-xs text-blue-200/70">
          © 2026 Infosys Technologies. Enterprise AI Knowledge System.
        </div>
      </div>

      {/* Right Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-slate-200/80 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Register as an employee to get started
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@infosys.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#1E60FF] hover:bg-[#1551E5] text-white shadow-sm font-semibold mt-2"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Complete Registration"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an enterprise account?{" "}
            <Link
              href="/login"
              className="text-[#1E60FF] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
