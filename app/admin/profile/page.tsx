import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import AdminProfileForm from "@/components/admin/admin-profile-form";

export const instant = false;

export default async function AdminProfilePage() {
  const session = await getCurrentSession(await headers());
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#CCFF00]">
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#CCFF00]" />
          <div>
            <p className="text-sm font-semibold text-[#CCFF00]">ADMIN PROFILE</p>
            <h1 className="mt-1 text-3xl font-bold">Profile Settings</h1>
          </div>
        </div>
        <AdminProfileForm
          initialName={session.user.name}
          initialImage={session.user.image || ""}
        />
      </div>
    </main>
  );
}
