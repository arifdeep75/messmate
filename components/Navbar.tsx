"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user.role === "admin";
  const profileHref = isAdmin ? "/admin/profile" : "/dashboard/profile";
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";
  const dashboardLabel = isAdmin ? "Admin Dashboard" : "My Dashboard";
  const name = session?.user.name?.trim() || (isAdmin ? "Admin" : "Member");
  const image = session?.user.image;
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!menuOpen) return;

    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || "Sign out failed.");
      setMenuOpen(false);
      toast.success("Signed out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign out failed.");
    }
  }

  const linkStyle =
    "text-sm font-medium text-zinc-400 transition-colors hover:text-[#CCFF00]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#292D35] bg-[#0B0D10]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CCFF00] text-lg font-black text-[#0B0D10]">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Mess<span className="text-[#CCFF00]">Mate</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className={linkStyle}>Home</Link>
          <Link href="/meals" className={linkStyle}>Meals</Link>
          <Link href="/bazar" className={linkStyle}>Bazar</Link>
          <Link href="/members" className={linkStyle}>Members</Link>
          <Link href="/notices" className={linkStyle}>Notices</Link>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-sm text-zinc-500" role="status">Loading session...</span>
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open profile menu"
                className="flex max-w-[min(70vw,18rem)] items-center gap-2 rounded-xl border border-[#292D35] bg-[#12151A] px-2 py-1.5 text-left transition hover:border-[#CCFF00]/60 sm:gap-3 sm:px-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#CCFF00]/30 bg-[#CCFF00]/10 text-sm font-bold text-[#CCFF00]">
                  {image ? (
                    <span
                      aria-label={`${name} profile image`}
                      role="img"
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
                    />
                  ) : initials ? (
                    initials
                  ) : (
                    <UserRound size={18} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{name}</span>
                  {isAdmin && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#CCFF00]">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className="shrink-0 text-zinc-500" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 top-[calc(100%+0.65rem)] z-[60] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A] p-2 shadow-2xl shadow-black/50"
                >
                  <div className="border-b border-[#292D35] px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs font-medium text-zinc-500">{isAdmin ? "Administrator" : "Member account"}</p>
                  </div>
                  <Link
                    href={dashboardHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-[#CCFF00]"
                  >
                    {isAdmin ? <ShieldCheck size={17} /> : <LayoutDashboard size={17} />}
                    {dashboardLabel}
                  </Link>
                  <Link
                    href={profileHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-[#CCFF00]"
                  >
                    <UserRound size={17} /> My Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut size={17} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-[#292D35] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#CCFF00] hover:text-[#CCFF00]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#CCFF00] px-4 py-2.5 text-sm font-bold text-[#0B0D10] transition-all hover:bg-[#b8e600] sm:px-5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
