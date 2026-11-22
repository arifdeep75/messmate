import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";
import ManagementClient from "@/components/admin/management-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export const instant = false;

export default async function ShoppingListPage() {
  const session = await getCurrentSession(await headers());
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  return <main className="min-h-screen bg-[#0B0D10] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-6xl"><Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#CCFF00]"><ArrowLeft size={16} />Back to Admin Dashboard</Link><div className="mb-8 flex items-center gap-3"><ClipboardList className="text-[#CCFF00]" /><div><p className="text-sm font-semibold text-[#CCFF00]">SHOPPING LIST</p><h1 className="mt-1 text-3xl font-bold">Mess Shopping</h1></div></div><ManagementClient resource="shopping-list" title="Shopping Item" /></div></main>;
}
