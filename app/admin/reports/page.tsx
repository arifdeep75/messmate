import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, ChartNoAxesCombined } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { getMonthlySummary, monthRange } from "@/lib/messmate";

export const instant = false;

export default async function ReportsPage() {
  const session = await getCurrentSession(await headers());
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const summary = await getMonthlySummary();
  const db = (await clientPromise).db("messmate");
  const { start, end } = monthRange();
  const members = await db.collection("members").find({ status: "approved", isActive: true }).sort({ name: 1 }).toArray();
  const memberRows = await Promise.all(members.map(async (member) => {
    const [mealRecords, depositRecords] = await Promise.all([
      db.collection("meals").find({ memberId: member.userId, date: { $gte: start, $lte: end } }).toArray(),
      db.collection("deposits").find({ memberId: member.userId, date: { $gte: start, $lte: end } }).toArray(),
    ]);
    const meals = mealRecords.reduce((total, meal) => total + Number(meal.lunch) + Number(meal.dinner), 0);
    const deposits = depositRecords.reduce((total, record) => total + Number(record.amount || 0), 0);
    const cost = meals * summary.mealRate;
    return { name: member.name, meals, deposits, cost, balance: Number(member.previousBalance || 0) + deposits - cost };
  }));

  return (
    <main className="min-h-screen bg-[#0B0D10] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#CCFF00]"><ArrowLeft size={16} />Back to Admin Dashboard</Link>
        <div className="mb-8 flex items-center gap-3"><ChartNoAxesCombined className="text-[#CCFF00]" /><div><p className="text-sm font-semibold text-[#CCFF00]">MONTHLY REPORT</p><h1 className="mt-1 text-3xl font-bold">Messmate Report</h1></div></div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Bazar Expense", `৳ ${summary.bazarExpense.toLocaleString("en-BD")}`], ["Member Meals", summary.memberMeals], ["Guest Meals", summary.guestMealCount], ["Meal Rate", `৳ ${summary.mealRate.toFixed(2)}`]].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-[#292D35] bg-[#16191F] p-5"><p className="text-sm text-zinc-500">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#292D35] bg-[#16191F]">
          <table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[#292D35] text-xs text-zinc-500"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Meals</th><th className="px-5 py-4">Deposits</th><th className="px-5 py-4">Meal Cost</th><th className="px-5 py-4">Balance</th></tr></thead><tbody className="divide-y divide-[#292D35]">{memberRows.map((row) => <tr key={row.name}><td className="px-5 py-4 font-medium">{row.name}</td><td className="px-5 py-4">{row.meals}</td><td className="px-5 py-4">৳ {row.deposits.toLocaleString("en-BD")}</td><td className="px-5 py-4">৳ {row.cost.toFixed(2)}</td><td className="px-5 py-4 text-[#CCFF00]">৳ {row.balance.toFixed(2)}</td></tr>)}</tbody></table>
        </div>
      </div>
    </main>
  );
}
