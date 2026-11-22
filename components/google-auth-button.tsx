"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (error) throw new Error(error.message || "Google sign-in failed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#292D35] bg-[#0B0D10] text-sm font-semibold text-white transition hover:border-[#CCFF00]/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
        <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.7-4.2 6.1v5h6.8c4-3.7 6-9 6-14.8Z" />
        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5c-1.9 1.3-4.1 2-6.7 2-5.2 0-9.6-3.5-11.2-8.2H5.8v5.2A20 20 0 0 0 24 44Z" />
        <path fill="#FBBC05" d="M12.8 28a12 12 0 0 1 0-7.9v-5.2H5.8a20 20 0 0 0 0 18.3l7-5.2Z" />
        <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 14.9l7 5.2c1.6-4.7 6-8.2 11.2-8.2Z" />
      </svg>
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}
