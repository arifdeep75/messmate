
"use client";

import { useState } from "react";
import {
  Settings2,
  Utensils,
  Users,
  Save,
  Loader2,
} from "lucide-react";

interface MealMember {
  id: string;
  name: string;
}

interface MealRecord {
  memberId: string;
  lunch: boolean;
  dinner: boolean;
}

interface Props {
  members: MealMember[];
  initialMeals: MealRecord[];
  today: string;
}

export default function MealManagementClient({
  members,
  initialMeals,
  today,
}: Props) {
  const [meals, setMeals] = useState<Record<string, MealRecord>>(() => {
    const records: Record<string, MealRecord> = {};

    members.forEach((member) => {
      const existing = initialMeals.find(
        (meal) => meal.memberId === member.id
      );

      records[member.id] = existing
        ? { ...existing }
        : {
            memberId: member.id,
            lunch: false,
            dinner: false,
          };
    });

    return records;
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const lunchCount = Object.values(meals).filter(
    (meal) => meal.lunch
  ).length;

  const dinnerCount = Object.values(meals).filter(
    (meal) => meal.dinner
  ).length;

  function toggleMeal(memberId: string, type: "lunch" | "dinner") {
    setMeals((previous) => ({
      ...previous,
      [memberId]: {
        ...previous[memberId],
        [type]: !previous[memberId][type],
      },
    }));

    setMessage("");
    setError("");
  }

  async function saveMeals() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await Promise.all(
        members.map(async (member) => {
          const meal = meals[member.id];

          const response = await fetch("/api/meals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memberId: member.id,
              memberName: member.name,
              date: today,
              lunch: meal.lunch,
              dinner: meal.dinner,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save ${member.name}'s meal.`);
          }
        })
      );

      setMessage("All meal statuses saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  function MealToggle({
    checked,
    onClick,
  }: {
    checked: boolean;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={checked}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          checked ? "bg-[#CCFF00]" : "bg-zinc-700"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  return (
    <>
      {/* Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Total Members",
            value: members.length,
            icon: Users,
            description: "Registered mess members",
          },
          {
            title: "Lunch Meals",
            value: lunchCount,
            icon: Utensils,
            description: "Today's confirmed meals",
          },
          {
            title: "Dinner Meals",
            value: dinnerCount,
            icon: Utensils,
            description: "Today's confirmed meals",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-[#292D35] bg-[#12151A] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">{item.title}</p>
                <Icon className="text-[#CCFF00]" size={20} />
              </div>
              <h2 className="mt-3 text-3xl font-bold">{item.value}</h2>
              <p className="mt-1 text-xs text-zinc-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#292D35] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Member Meal Status</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Today&apos;s lunch and dinner overview · {today}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Settings2 size={16} />
            Admin control
          </div>
        </div>

        {members.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 text-zinc-600" size={32} />
            <p className="font-semibold text-white">
              No registered members found
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Member accounts must be registered before managing meals.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-[#181C22] text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Member</th>
                  <th className="px-5 py-4 font-semibold">Lunch</th>
                  <th className="px-5 py-4 font-semibold">Dinner</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#292D35]">
                {members.map((member) => {
                  const meal = meals[member.id];

                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-medium text-white">
                        {member.name}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <MealToggle
                            checked={meal.lunch}
                            onClick={() => toggleMeal(member.id, "lunch")}
                          />
                          <span
                            className={
                              meal.lunch
                                ? "text-xs font-semibold text-[#CCFF00]"
                                : "text-xs text-zinc-500"
                            }
                          >
                            {meal.lunch ? "ON" : "OFF"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <MealToggle
                            checked={meal.dinner}
                            onClick={() => toggleMeal(member.id, "dinner")}
                          />
                          <span
                            className={
                              meal.dinner
                                ? "text-xs font-semibold text-[#CCFF00]"
                                : "text-xs text-zinc-500"
                            }
                          >
                            {meal.dinner ? "ON" : "OFF"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-400">
                        {meal.lunch && meal.dinner
                          ? "Both meals ON"
                          : meal.lunch
                            ? "Lunch only"
                            : meal.dinner
                              ? "Dinner only"
                              : "Both OFF"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Save Section */}
        <div className="flex flex-col gap-4 border-t border-[#292D35] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {message && (
              <p className="text-sm text-[#CCFF00]">{message}</p>
            )}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            {!message && !error && (
              <p className="text-xs text-zinc-500">
                Save your changes to update the database.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={saveMeals}
            disabled={saving || members.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#CCFF00] px-6 text-sm font-bold text-[#0B0D10] transition hover:bg-[#b8e600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save Meal Status"}
          </button>
        </div>
      </div>
    </>
  );
}
