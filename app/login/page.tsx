
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import GoogleAuthButton from "@/components/google-auth-button";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const statusMessages: Record<string, string> = {
    pending: "Your registration is awaiting admin approval. Dashboard access will be available after approval.",
    rejected: "This registration was rejected. Please contact the administrator for help.",
    inactive: "This account is inactive. Please contact the administrator.",
    profile: "Your member profile is not ready yet. Please contact the administrator.",
  };
  const accountNotice = statusMessages[searchParams.get("status") || ""];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password.");
        return;
      }

      const { data: session, error: sessionError } = await authClient.getSession();
      if (sessionError || !session) {
        setError("Sign in succeeded, but your session could not be loaded. Please try again.");
        return;
      }

      const destination = session.user.role === "admin" ? "/admin" : "/dashboard";
      window.location.replace(destination);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0B0D10] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CCFF00] text-2xl font-black text-[#0B0D10] shadow-[0_0_35px_rgba(204,255,0,0.15)]">
            M
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-white">
            Welcome Back
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Sign in to continue to your MessMate account.
          </p>
        </div>

        <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-7 shadow-2xl shadow-black/30 sm:p-9">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] px-4 transition focus-within:border-[#CCFF00]">
                <Mail size={18} className="text-zinc-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] px-4 transition focus-within:border-[#CCFF00]">
                <LockKeyhole size={18} className="text-zinc-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 transition hover:text-[#CCFF00]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {accountNotice && (
              <div className="rounded-lg border border-[#CCFF00]/20 bg-[#CCFF00]/[0.06] px-4 py-3 text-sm text-[#CCFF00]">
                {accountNotice}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#CCFF00] font-bold text-[#0B0D10] transition hover:bg-[#b8e600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-[#292D35]" />
            OR
            <span className="h-px flex-1 bg-[#292D35]" />
          </div>
          <GoogleAuthButton />

          <div className="my-7 border-t border-[#292D35]" />

          <p className="text-center text-sm text-zinc-400">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#CCFF00] hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-zinc-600">
          Secure access to your mess management platform.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0B0D10] px-6 py-16 text-sm text-zinc-500">
        Loading sign in...
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
