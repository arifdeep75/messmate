
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Invalid credentials.");
        return;
      }

      const { data: session } = await authClient.getSession();

      if (session?.user.role !== "admin") {
        await authClient.signOut();
        setError("Access denied. Admin account required.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0B0D10] px-6 py-14">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[#CCFF00] shadow-[0_0_35px_rgba(204,255,0,0.12)]">
            <ShieldCheck size={34} />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/6 px-3 py-1.5 text-xs font-semibold text-[#CCFF00]">
            ADMINISTRATOR ACCESS
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-white">
            Admin Sign In
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Access your MessMate control panel using your administrator
            credentials.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-7 shadow-2xl shadow-black/30 sm:p-9">

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Admin Email
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] px-4 transition focus-within:border-[#CCFF00]">
                <Mail size={18} className="shrink-0 text-zinc-500" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder="Enter admin email"
                  className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] px-4 transition focus-within:border-[#CCFF00]">
                <LockKeyhole size={18} className="shrink-0 text-zinc-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="Enter admin password"
                  className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-zinc-500 transition hover:text-[#CCFF00]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#CCFF00] font-bold text-[#0B0D10] transition hover:bg-[#b8e600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck size={19} />
              {loading ? "Authenticating..." : "Secure Admin Sign In"}
            </button>
          </form>

          <div className="my-7 border-t border-[#292D35]" />

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck size={15} className="text-[#CCFF00]" />
            Restricted access for authorized administrators only.
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-zinc-600">
          MessMate Administration Portal
        </p>
      </div>
    </main>
  );
}
