"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  Utensils,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  function closeMenus() {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen && !mobileMenuOpen) return;

    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen, mobileMenuOpen]);

  async function handleSignOut() {
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || "Sign out failed.");
      setMenuOpen(false);
      setMobileMenuOpen(false);
      toast.success("Signed out successfully.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign out failed.");
    }
  }

  const linkStyle =
    "text-sm font-medium text-zinc-400 transition-colors hover:text-[#CCFF00]";
  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/meals", label: "Meals", icon: Utensils },
    { href: "/bazar", label: "Bazar" },
    { href: "/members", label: "Members", icon: Users },
    { href: "/notices", label: "Notices", icon: Bell },
  ];
  const profileMenu = (
    <>
      <div className="border-b border-[#292D35] px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-xs font-medium text-zinc-500">
          {isAdmin ? "Administrator" : "Member account"}
        </p>
      </div>
      <Link
        href={dashboardHref}
        role="menuitem"
        onClick={closeMenus}
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-[#CCFF00]"
      >
        {isAdmin ? <ShieldCheck size={17} /> : <LayoutDashboard size={17} />}
        {dashboardLabel}
      </Link>
      <Link
        href={profileHref}
        role="menuitem"
        onClick={closeMenus}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-[#CCFF00]"
      >
        <UserRound size={17} /> My Profile
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={handleSignOut}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
      >
        <LogOut size={17} /> Sign Out
      </button>
    </>
  );

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 border-b border-[#292D35] bg-[#0B0D10]/95 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CCFF00] text-lg font-black text-[#0B0D10]">
            M
          </div>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Mess<span className="text-[#CCFF00]">Mate</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {primaryLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkStyle}>
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <span className="text-sm text-zinc-500" role="status">Loading session...</span>
          ) : session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMenuOpen((open) => !open);
                }}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Open ${name}'s profile menu`}
                title={name}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#CCFF00]/30 bg-[#12151A] text-sm font-bold text-[#CCFF00] transition hover:border-[#CCFF00]"
              >
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
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Profile menu"
                  className="absolute right-0 top-[calc(100%+0.65rem)] z-[60] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A] p-2 shadow-2xl shadow-black/50"
                >
                  {profileMenu}
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

        {!isPending && session && (
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setMenuOpen((open) => !open);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Open ${name}'s profile menu`}
              title={name}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#CCFF00]/30 bg-[#12151A] text-sm font-bold text-[#CCFF00] transition hover:border-[#CCFF00]"
            >
              {image ? (
                <span
                  aria-label={`${name} profile image`}
                  role="img"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
                />
              ) : (
                initials || <UserRound size={18} />
              )}
            </button>
            {menuOpen && (
              <div
                role="menu"
                aria-label="Profile menu"
                className="absolute right-0 top-[calc(100%+0.65rem)] z-[60] w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A] p-2 shadow-2xl shadow-black/50"
              >
                {profileMenu}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            setMobileMenuOpen((open) => !open);
          }}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#292D35] text-white transition hover:border-[#CCFF00] hover:text-[#CCFF00] lg:hidden"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#292D35] bg-[#0B0D10] px-4 py-3 sm:px-6 lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="mx-auto max-w-7xl">
            <div className="grid gap-1">
              {primaryLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenus}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-[#CCFF00]"
                >
                  {Icon ? <Icon size={17} /> : <span className="w-[17px]" />}
                  {label}
                </Link>
              ))}
            </div>

            {!isPending && !session && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#292D35] pt-3">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-[#292D35] px-4 text-sm font-semibold text-white transition hover:border-[#CCFF00] hover:text-[#CCFF00]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenus}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-[#CCFF00] px-4 text-sm font-bold text-[#0B0D10] transition hover:bg-[#b8e600]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
