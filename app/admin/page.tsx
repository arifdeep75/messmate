
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Utensils,
  ShoppingBasket,
  Wallet,
  Users,
  UserRoundPlus,
  ChartNoAxesCombined,
  Bell,
  Settings,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  UserCheck,
} from "lucide-react";

import { getCurrentSession } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { dhakaDateString, getMonthlySummary } from "@/lib/messmate";

export const instant = false;

const managementItems = [
  {
    title: "Member Approvals",
    description: "Review, approve or reject new registrations.",
    icon: UserCheck,
    href: "/admin/members",
  },
  {
    title: "Meal Management",
    description: "Manage daily lunch and dinner status.",
    icon: Utensils,
    href: "/admin/meals",
  },
  {
    title: "Bazar Management",
    description: "Add and manage daily shopping expenses.",
    icon: ShoppingBasket,
    href: "/admin/bazar",
  },
  {
    title: "Deposit Management",
    description: "Manage member deposits and payments.",
    icon: Wallet,
    href: "/admin/deposits",
  },
  {
    title: "Guest Meal Management",
    description: "Track guest meals and meal records.",
    icon: UserRoundPlus,
    href: "/admin/guest-meals",
  },
  {
    title: "Shopping List",
    description: "Prepare and manage mess shopping lists.",
    icon: ClipboardList,
    href: "/admin/shopping-list",
  },
  {
    title: "Monthly Reports",
    description: "Review meal rates and monthly balances.",
    icon: ChartNoAxesCombined,
    href: "/admin/reports",
  },
  {
    title: "Notice Management",
    description: "Publish important mess announcements.",
    icon: Bell,
    href: "/admin/notices",
  },
  {
    title: "Settings",
    description: "Configure your MessMate system.",
    icon: Settings,
    href: "/admin/settings",
  },
];

const overviewItems = [
  {
    title: "Total Members",
    value: "08",
    description: "Registered mess members",
    icon: Users,
  },
  {
    title: "Today's Meals",
    value: "—",
    description: "Lunch and dinner status",
    icon: Utensils,
  },
  {
    title: "Monthly Bazar",
    value: "৳ —",
    description: "Total shopping expenses",
    icon: ShoppingBasket,
  },
  {
    title: "Current Meal Rate",
    value: "৳ —",
    description: "Cost per meal",
    icon: Wallet,
  },
];

export default async function AdminDashboardPage() {
  const session = await getCurrentSession(await headers());

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const client = await clientPromise;
  const db = client.db("messmate");

  const pendingCount = await db
    .collection("members")
    .countDocuments({ status: "pending" });
  const summary = await getMonthlySummary();
  const today = dhakaDateString();
  const todayMeals = await db.collection("meals").find({ date: today }).toArray();
  const todayTotal = todayMeals.reduce(
    (total, meal) => total + Number(meal.lunch) + Number(meal.dinner),
    0
  );
  const dashboardStats = [
    { ...overviewItems[0], value: String(summary.approvedMemberCount).padStart(2, "0") },
    { ...overviewItems[1], value: String(todayTotal) },
    { ...overviewItems[2], value: `৳ ${summary.bazarExpense.toLocaleString("en-BD")}` },
    { ...overviewItems[3], value: `৳ ${summary.mealRate.toFixed(2)}` },
  ];

  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#CCFF00]">
              <ShieldCheck size={17} />
              ADMIN CONTROL PANEL
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-zinc-400">
              Welcome back, {session.user.name}. Manage your mess from here.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#CCFF00]/20 bg-[#CCFF00]/6 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#CCFF00] text-[#0B0D10]">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm font-bold">Administrator</p>
              <p className="text-xs text-zinc-400">Full access</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Mess Overview</h2>
          <p className="mt-1 text-sm text-zinc-500">
            A quick look at your mess statistics.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#292D35] bg-[#12151A] p-6 transition hover:border-[#CCFF00]/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">{item.title}</p>

                    <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00]">
                      <Icon size={21} />
                    </div>
                  </div>

                  <h3 className="mt-5 text-3xl font-extrabold">
                    {item.value}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Management */}
        <section className="mt-12">
          <div>
            <h2 className="text-xl font-bold">Management Center</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Access and manage all MessMate operations.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isApproval = item.href === "/admin/members";

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[#292D35] bg-[#12151A] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#CCFF00]/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-[#CCFF00]/10 p-3 text-[#CCFF00] transition group-hover:bg-[#CCFF00] group-hover:text-[#0B0D10]">
                      <Icon size={22} />
                    </div>

                    {isApproval && pendingCount > 0 ? (
                      <span className="rounded-full bg-[#CCFF00] px-3 py-1 text-xs font-bold text-[#0B0D10]">
                        {pendingCount} Pending
                      </span>
                    ) : (
                      <ArrowUpRight
                        size={19}
                        className="text-zinc-600 transition group-hover:text-[#CCFF00]"
                      />
                    )}
                  </div>

                  <h3 className="mt-6 font-bold">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-[#292D35] py-6 text-xs text-zinc-600 sm:flex-row">
          <p>MessMate Admin Control Panel</p>
          <p>Administrator access only</p>
        </footer>
      </div>
    </main>
  );
}
