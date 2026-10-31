"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F4F7FC]">
      {/* Left Hero Section matching reference UI */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0B192C] via-[#0E2A52] to-[#1E60FF] text-white p-12 flex-col justify-between overflow-hidden">
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Brand */}
        <div className="relative z-10">
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

        {/* Center Tagline */}
        <div className="relative z-10 max-w-lg my-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Verified Organizational RAG Intelligence
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Ask. Discover. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Get Answers.
            </span>
          </h1>
          <p className="text-base text-blue-100/90 leading-relaxed">
            Your intelligent assistant for company policies, internal processes,
            and organizational documentation with grounded, source-cited responses.
          </p>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 text-xs text-blue-200/70">
          © 2026 Infosys Technologies. Enterprise AI Knowledge System.
        </div>
      </div>

      {/* Right Sign-in Form matching reference UI */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-slate-200/80 p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back! Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@infosys.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E60FF] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1E60FF] focus:ring-[#1E60FF]"
                />
                Remember me
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact your Infosys IT Administrator to reset your enterprise credentials.");
                }}
                className="text-[#1E60FF] hover:underline font-semibold"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#1E60FF] hover:bg-[#1551E5] text-white shadow-sm font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-[#1E60FF] font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
