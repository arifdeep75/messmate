import clientPromise from "@/lib/mongo";
import { Check } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function ShoppingPage() {
  await connection();
  const db = (await clientPromise).db("messmate");
  const items = await db.collection("shopping-list").find({}).sort({ completed: 1, createdAt: -1 }).toArray();
  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-[#CCFF00]">MESS SHOPPING</p><h1 className="mt-2 text-4xl font-bold">Shopping List</h1>
        <div className="mt-8 overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A]">
          {items.length === 0 ? <p className="p-10 text-center text-zinc-500">No shopping items.</p> : items.map((item) => (
            <div key={String(item._id)} className="flex items-center gap-3 border-b border-[#292D35] px-5 py-4 last:border-0">
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${item.completed ? "bg-[#CCFF00] text-[#0B0D10]" : "border border-[#292D35] text-zinc-600"}`}>{item.completed && <Check size={16} />}</span>
              <span className={item.completed ? "text-zinc-500 line-through" : "font-medium"}>{item.item}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
