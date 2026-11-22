import clientPromise from "@/lib/mongo";
import { dhakaDateString, monthRange } from "@/lib/messmate";
import { CalendarDays, Utensils } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function MealsPage() {
  await connection();
  const db = (await clientPromise).db("messmate");
  const today = dhakaDateString();
  const { start, end } = monthRange();
  const [todayMeals, monthMeals] = await Promise.all([
    db.collection("meals").find({ date: today }).toArray(),
    db.collection("meals").find({ date: { $gte: start, $lte: end } }).sort({ date: -1 }).limit(31).toArray(),
  ]);

  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8"><p className="text-sm font-semibold text-[#CCFF00]">PUBLIC OVERVIEW</p><h1 className="mt-2 text-4xl font-bold">Today&apos;s Meals</h1></div>
        <div className="grid gap-5 md:grid-cols-2">
          {[{ name: "Lunch", count: todayMeals.filter((m) => m.lunch).length }, { name: "Dinner", count: todayMeals.filter((m) => m.dinner).length }].map((meal) => (
            <div key={meal.name} className="rounded-2xl border border-[#292D35] bg-[#12151A] p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Utensils className="text-[#CCFF00]" /><h2 className="font-bold">{meal.name}</h2></div><span className="text-3xl font-bold">{meal.count}</span></div>
            </div>
          ))}
        </div>
        <section className="mt-10">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><CalendarDays className="text-[#CCFF00]" /> Meal Calendar</h2>
          <div className="overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A]">
            {monthMeals.length === 0 ? <p className="p-8 text-center text-zinc-500">No meal records this month.</p> : (
              <div className="divide-y divide-[#292D35]">{monthMeals.map((record) => (
                <div key={String(record._id)} className="flex justify-between px-5 py-4"><span>{record.date}</span><span className="text-sm text-zinc-400">{record.memberName}: {record.lunch ? "Lunch ON" : "Lunch OFF"} · {record.dinner ? "Dinner ON" : "Dinner OFF"}</span></div>
              ))}</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
