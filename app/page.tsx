
import clientPromise from "@/lib/mongo";
import { dhakaDateString, getMonthlySummary } from "@/lib/messmate";
import { connection } from "next/server";
import { HomeFooterCta, HomeHeroContent } from "@/components/home-access-cta";

export const instant = false;
import {
  Wallet,
  Utensils,
  Users,
  ShoppingBasket,
  CalendarDays,
  Bell,
  ChartNoAxesCombined,
} from "lucide-react";

const features = [
  {
    icon: Utensils,
    title: "Meal Tracking",
    description: "Track daily lunch and dinner meals with a simple calendar.",
  },
  {
    icon: Wallet,
    title: "Deposit Management",
    description: "Keep every member's deposit and balance organized.",
  },
  {
    icon: ShoppingBasket,
    title: "Bazar Management",
    description: "Record daily shopping expenses and maintain transparency.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Monthly Reports",
    description: "Understand meal rates, expenses, and monthly balances.",
  },
  {
    icon: Users,
    title: "Member Management",
    description: "See member profiles, meal counts, and account balances.",
  },
  {
    icon: Bell,
    title: "Notice Board",
    description: "Keep everyone updated with important mess announcements.",
  },
];

export default async function Home() {
  await connection();
  const summary = await getMonthlySummary();
  const db = (await clientPromise).db("messmate");
  const today = dhakaDateString();
  const [todayMeals, recentBazar] = await Promise.all([
    db.collection("meals").find({ date: today }).toArray(),
    db.collection("bazar").find({}).sort({ date: -1 }).limit(5).toArray(),
  ]);
  const lunchOn = todayMeals.filter((meal) => meal.lunch).length;
  const dinnerOn = todayMeals.filter((meal) => meal.dinner).length;
  return (
    <main className="min-h-screen bg-[#0B0D10] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#292D35]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-125 w-175 -translate-x-1/2 rounded-full bg-[#CCFF00]/6 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
          <HomeHeroContent />

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-[#292D35] pb-5">
                <div>
                  <p className="text-sm text-zinc-500">Overview</p>
                  <h2 className="mt-1 text-xl font-bold">Mess Dashboard</h2>
                </div>
                <div className="rounded-lg bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                  <ChartNoAxesCombined size={22} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#292D35] bg-[#191D23] p-4">
                  <p className="text-sm text-zinc-500">Total Members</p>
                  <p className="mt-2 text-3xl font-bold">{String(summary.approvedMemberCount).padStart(2, "0")}</p>
                  <p className="mt-1 text-xs text-[#CCFF00]">Active members</p>
                </div>

                <div className="rounded-xl border border-[#292D35] bg-[#191D23] p-4">
                  <p className="text-sm text-zinc-500">Meal Rate</p>
                  <p className="mt-2 text-3xl font-bold">৳ {summary.mealRate.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-zinc-500">Per meal</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#292D35] bg-[#191D23] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Today`s Meals</h3>
                  <CalendarDays size={18} className="text-zinc-500" />
                </div>

                <div className="space-y-3">
                  {[
                    { name: "Lunch", count: lunchOn },
                    { name: "Dinner", count: dinnerOn },
                  ].map((meal) => (
                    <div
                      key={meal.name}
                      className="flex items-center justify-between rounded-lg bg-[#22262D] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Utensils size={17} className="text-[#CCFF00]" />
                        <span className="text-sm font-medium">{meal.name}</span>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${meal.count > 0 ? "bg-[#CCFF00]/10 text-[#CCFF00]" : "bg-zinc-700/60 text-zinc-300"}`}>
                        {meal.count} on
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-[#292D35] bg-[#191D23] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#CCFF00]/10 p-2 text-[#CCFF00]">
                    <Wallet size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Expense Overview</p>
                    <p className="text-xs text-zinc-500">Monthly bazar expenses</p>
                  </div>
                </div>
                <span className="text-lg font-bold">৳ {summary.bazarExpense.toLocaleString("en-BD")}</span>
              </div>
                {recentBazar.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {recentBazar.slice(0, 3).map((entry) => (
                      <div key={String(entry._id)} className="flex items-center justify-between rounded-lg bg-[#22262D] px-4 py-3">
                        <div>
                          <p className="text-sm">{entry.description}</p>
                          <p className="mt-1 text-xs text-zinc-500">{entry.date}</p>
                        </div>
                        <span className="text-sm font-bold text-[#CCFF00]">৳ {Number(entry.amount).toLocaleString("en-BD")}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="absolute -bottom-5 -left-5 -z-10 h-40 w-40 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
            Everything in one place
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything Your Mess Needs
          </h2>
          <p className="mt-5 leading-7 text-zinc-400">
            No more scattered calculations or confusing records. Manage your
            daily mess activities from one organized platform.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[#292D35] bg-[#12151A] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#CCFF00]/50"
              >
                <div className="mb-6 inline-flex rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00] transition group-hover:bg-[#CCFF00] group-hover:text-[#0B0D10]">
                  <Icon size={23} />
                </div>

                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <HomeFooterCta />

      {/* Footer */}
      <footer className="border-t border-[#292D35]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <p>
            © 2026 MessMate. All rights reserved.
          </p>
          <p>Made for smarter mess management.</p>
        </div>
      </footer>
    </main>
  );
}
