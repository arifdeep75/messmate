"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

function useHomeAccess() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";

  return {
    session,
    isPending,
    isAdmin,
    dashboardHref: isAdmin ? "/admin" : "/dashboard",
  };
}

export function HomeHeroContent() {
  const { session, isPending, isAdmin, dashboardHref } = useHomeAccess();
  const name = session?.user.name?.trim();

  return (
    <div>
      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/[0.06] px-4 py-2 text-sm text-[#CCFF00]">
        {isAdmin ? <ShieldCheck size={15} /> : <span className="h-2 w-2 rounded-full bg-[#CCFF00]" />}
        {isPending ? "MessMate Overview" : session ? (isAdmin ? "Admin Control Center" : "Your MessMate Overview") : "Smart Mess Management"}
      </div>

      <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.12] tracking-tight md:text-6xl">
        {session ? (
          <>
            Welcome back{name ? `, ${name}` : ""}.
            <span className="mt-2 block text-[#CCFF00]">
              {isAdmin ? "Your mess, under control." : "Your mess at a glance."}
            </span>
          </>
        ) : (
          <>
            Manage Your Mess.
            <span className="mt-2 block text-[#CCFF00]">Simplify Your Life.</span>
          </>
        )}
      </h1>

      <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
        {session
          ? isAdmin
            ? "Review today's activity, manage member registrations, and keep every mess operation organized."
            : "Check your meals, monthly balance, deposits, and the latest mess updates from one place."
          : "Track meals, manage bazar expenses, calculate meal rates, and keep your mess organized — all in one place."}
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        {isPending ? (
          <span role="status" className="inline-flex h-12 items-center rounded-lg border border-[#292D35] px-6 text-sm text-zinc-500">
            Checking your account...
          </span>
        ) : session ? (
          <>
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 rounded-lg bg-[#CCFF00] px-6 py-3.5 font-bold text-[#0B0D10] transition hover:bg-[#b8e600]"
            >
              <LayoutDashboard size={18} />
              {isAdmin ? "Open Admin Dashboard" : "Open My Dashboard"}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/meals"
              className="rounded-lg border border-[#292D35] px-6 py-3.5 font-semibold text-white transition hover:border-[#CCFF00] hover:text-[#CCFF00]"
            >
              View Public Meals
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#CCFF00] px-6 py-3.5 font-bold text-[#0B0D10] transition hover:bg-[#b8e600]"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[#292D35] px-6 py-3.5 font-semibold text-white transition hover:border-[#CCFF00] hover:text-[#CCFF00]"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-6 text-sm text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="text-[#CCFF00]">✓</span> Easy meal tracking
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[#CCFF00]">✓</span> Transparent expenses
        </span>
      </div>
    </div>
  );
}

export function HomeFooterCta() {
  const { session, isPending, isAdmin, dashboardHref } = useHomeAccess();

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/[0.05] p-10 text-center md:flex-row md:p-14 md:text-left">
        <div>
          <h2 className="text-3xl font-bold">
            {isPending
              ? "Welcome to MessMate"
              : session
                ? "Your MessMate workspace is ready."
                : "Ready to organize your mess?"}
          </h2>
          <p className="mt-3 text-zinc-400">
            {session
              ? "Open your dashboard to continue."
              : "Bring all your mess activities under one roof."}
          </p>
        </div>
        {isPending ? (
          <span role="status" className="text-sm text-zinc-500">Checking your account...</span>
        ) : (
          <Link
            href={session ? dashboardHref : "/signup"}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#CCFF00] px-6 py-3.5 font-bold text-[#0B0D10] transition hover:bg-[#b8e600]"
          >
            {session ? (isAdmin ? "Admin Dashboard" : "My Dashboard") : "Join MessMate"}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}
