
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { dhakaDateString, monthRange } from "@/lib/messmate";
import MealManagementClient from "@/components/admin/meal-management-client";
import { ArrowLeft, CalendarDays, Utensils } from "lucide-react";

export const instant = false;

export default async function MealManagementPage() {
  const session = await getCurrentSession(await headers());

  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const client = await clientPromise;
  const db = client.db("messmate");

  // Only approved and active members can participate in meals.
  const memberDocuments = await db
    .collection("members")
    .find({
      status: "approved",
      isActive: true,
    })
    .sort({ name: 1 })
    .toArray();

  const members = memberDocuments.map((member) => ({
    id: member.userId as string,
    name: member.name as string,
  }));

  const now = new Date();
  const today = dhakaDateString(now);
  const { start, end } = monthRange(now);

  const mealDocuments = await db
    .collection("meals")
    .find({ date: { $gte: start, $lte: end } })
    .toArray();

  const initialMeals = mealDocuments
    .filter((meal) =>
      members.some((member) => member.id === meal.memberId)
    )
    .map((meal) => ({
      memberId: meal.memberId as string,
      date: meal.date as string,
      lunch: meal.lunch as boolean,
      dinner: meal.dinner as boolean,
    }));

  return (
    <main className="min-h-screen bg-[#0B0D10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#CCFF00]"
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#CCFF00]">
                <Utensils size={20} />
                <span className="text-sm font-semibold">
                  MEAL MANAGEMENT
                </span>
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Manage Meals
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Manage daily lunch and dinner status for all approved mess members.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#292D35] bg-[#16191F] px-4 py-3 text-sm text-zinc-300">
              <CalendarDays size={18} className="text-[#CCFF00]" />
              <span>Daily Meal Control</span>
            </div>
          </div>
        </div>

        <MealManagementClient
          members={members}
          initialMeals={initialMeals}
          today={today}
        />
      </div>
    </main>
  );
}
