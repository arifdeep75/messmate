
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Wallet,
  Utensils,
  TrendingUp,
  CalendarDays,
  ShoppingBasket,
  CircleUserRound,
} from "lucide-react";

import { getCurrentSession } from "@/lib/auth";
import SignOutButton from "./sign-out-button";
import Link from "next/link";
import clientPromise from "@/lib/mongo";
import { dhakaDateString, getMonthlySummary, monthRange } from "@/lib/messmate";

export const instant = false;

export default async function DashboardPage() {
  const session = await getCurrentSession(await headers());

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const db = (await clientPromise).db("messmate");
  const member = await db.collection("members").findOne({ userId: session.user.id });
  const isApprovedMember =
    member?.status === "approved" && member.isActive === true;

  const today = dhakaDateString();
  const { start, end } = monthRange();
  const [mealRecords, depositRecords, todayMeal, recentBazar] = await Promise.all([
    isApprovedMember
      ? db.collection("meals").find({ memberId: session.user.id, date: { $gte: start, $lte: end } }).toArray()
      : [],
    isApprovedMember
      ? db.collection("deposits").find({ memberId: session.user.id, date: { $gte: start, $lte: end } }).toArray()
      : [],
    isApprovedMember
      ? db.collection("meals").findOne({ memberId: session.user.id, date: today })
      : null,
    db.collection("bazar").find({}).sort({ date: -1 }).limit(5).toArray(),
  ]);

  const mealCount = mealRecords.reduce(
    (total, meal) => total + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const lunchCount = mealRecords.filter((meal) => meal.lunch).length;
  const dinnerCount = mealRecords.filter((meal) => meal.dinner).length;
  const depositTotal = depositRecords.reduce((total, record) => total + Number(record.amount || 0), 0);
  const monthlySummary = await getMonthlySummary();
  const mealCost = mealCount * monthlySummary.mealRate;
  const currentBalance =
    (isApprovedMember ? Number(member.previousBalance || 0) : 0) +
    depositTotal -
    mealCost;

  const stats = [
    { title: "Total Meals", value: String(mealCount), description: `${lunchCount} lunch · ${dinnerCount} dinner`, icon: Utensils },
    { title: "Total Deposit", value: `৳ ${depositTotal.toLocaleString("en-BD")}`, description: "Current month", icon: Wallet },
    { title: "Current Balance", value: `৳ ${currentBalance.toLocaleString("en-BD")}`, description: "Including previous balance", icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Welcome Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[#CCFF00]">
              MEMBER DASHBOARD
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {session.user.name}!
            </h1>

            <p className="mt-3 text-zinc-400">
              Here is an overview of your MessMate account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="rounded-lg border border-[#292D35] px-4 py-2 text-sm font-semibold hover:border-[#CCFF00]">Edit Profile</Link>
            <SignOutButton />
          </div>
        </div>

        {!isApprovedMember && (
          <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-5 py-4">
            <p className="font-semibold text-yellow-300">
              {member?.status === "rejected"
                ? "Your registration was not approved."
                : member?.status === "approved"
                  ? "Your account is currently inactive."
                  : "Your registration is awaiting admin approval."}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              You can use your dashboard, but member meal and financial records are available only after your account is approved and active.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-[#292D35] bg-[#12151A] p-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#CCFF00]/10 text-[#CCFF00]">
            <CircleUserRound size={30} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-bold">{session.user.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {session.user.email}
            </p>
          </div>

          <div className="w-fit rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/6 px-4 py-2 text-xs font-semibold text-[#CCFF00]">
            MEMBER ACCOUNT
          </div>
        </div>

        {/* Statistics */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Your Overview</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your monthly mess statistics.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-[#292D35] bg-[#12151A] p-6 transition hover:border-[#CCFF00]/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                      {stat.title}
                    </p>

                    <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                      <Icon size={21} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-3xl font-extrabold">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-500">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Meal Status */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Today`s Meals</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your daily meal information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {["Lunch", "Dinner"].map((meal) => (
              <div
                key={meal}
                className="flex items-center justify-between rounded-2xl border border-[#292D35] bg-[#12151A] p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                    <Utensils size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold">{meal}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Meal status
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1.5 text-xs ${
                  (meal === "Lunch" ? todayMeal?.lunch : todayMeal?.dinner)
                    ? "bg-[#CCFF00]/10 text-[#CCFF00]"
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  {(meal === "Lunch" ? todayMeal?.lunch : todayMeal?.dinner) ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Sections */}
        <section className="mt-10 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                <CalendarDays size={21} />
              </div>

              <div>
                <h3 className="font-bold">Meal Calendar</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  View your monthly meal records.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {mealRecords.map((record) => (
                <div key={record.date} title={record.date} className="flex h-9 items-center justify-center rounded-md bg-[#CCFF00]/10 text-xs text-[#CCFF00]">
                  {record.date.slice(-2)}
                </div>
              ))}
              {mealRecords.length === 0 && <p className="col-span-7 text-sm text-zinc-500">No meal records this month.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#292D35] bg-[#12151A] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                <ShoppingBasket size={21} />
              </div>

              <div>
                <h3 className="font-bold">Recent Bazar Activity</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Check recent mess shopping expenses.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentBazar.length === 0 ? (
                <p className="text-sm text-zinc-500">No bazar records available yet.</p>
              ) : recentBazar.map((record) => (
                <div key={String(record._id)} className="flex items-center justify-between rounded-lg bg-[#22262D] px-4 py-3">
                  <div>
                    <p className="text-sm">{record.description}</p>
                    <p className="mt-1 text-xs text-zinc-500">{record.date}</p>
                  </div>
                  <span className="font-bold text-[#CCFF00]">৳ {Number(record.amount).toLocaleString("en-BD")}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#292D35] py-6 text-center text-xs text-zinc-600">
          MessMate Member Dashboard
        </footer>

      </div>
    </main>
  );
}
