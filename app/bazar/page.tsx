import clientPromise from "@/lib/mongo";
import { ShoppingBasket } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function BazarPage() {
  await connection();
  const db = (await clientPromise).db("messmate");
  const entries = await db.collection("bazar").find({}).sort({ date: -1 }).limit(100).toArray();
  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-[#CCFF00]">EXPENSE HISTORY</p><h1 className="mt-2 text-4xl font-bold">Bazar History</h1>
        <div className="mt-8 overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A]">
          {entries.length === 0 ? <p className="p-10 text-center text-zinc-500">No bazar entries yet.</p> : entries.map((entry) => (
            <div key={String(entry._id)} className="flex items-center justify-between border-b border-[#292D35] px-5 py-4 last:border-0">
              <div className="flex items-center gap-3"><div className="rounded-lg bg-[#CCFF00]/10 p-2 text-[#CCFF00]"><ShoppingBasket size={18} /></div><div><p className="font-medium">{entry.description}</p><p className="mt-1 text-xs text-zinc-500">{entry.date} · {entry.purchaser}</p></div></div>
              <span className="font-bold text-[#CCFF00]">৳ {Number(entry.amount).toLocaleString("en-BD")}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
