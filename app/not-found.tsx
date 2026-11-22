
import Link from "next/link";
import { Home, ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#0B0D10] px-6 py-16">
      <div className="w-full max-w-xl text-center">

        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[#CCFF00]">
          <SearchX size={38} />
        </div>

        <h1 className="text-8xl font-black tracking-tighter text-[#CCFF00] sm:text-9xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
          Oops! The page you`re looking for doesn`t exist, may have been
          moved, or the URL might be incorrect.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#CCFF00] px-6 text-sm font-bold text-[#0B0D10] transition hover:bg-[#b8e600]"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#292D35] bg-[#16191F] px-6 text-sm font-semibold text-white transition hover:border-[#CCFF00]/50 hover:text-[#CCFF00]"
          >
            <ArrowLeft size={18} />
            Go to Dashboard
          </Link>
        </div>

        <p className="mt-12 text-xs text-zinc-600">
          MessMate — Making Mess Management Simple.
        </p>
      </div>
    </main>
  );
}
