
"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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
  date: string;
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
  const [viewedMonth, setViewedMonth] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [loadedMonths, setLoadedMonths] = useState(
    () => new Set([today.slice(0, 7)])
  );
  const [mealsByDate, setMealsByDate] = useState<
    Record<string, Record<string, MealRecord>>
  >(() => {
    const records: Record<string, Record<string, MealRecord>> = {};
    for (const meal of initialMeals) {
      records[meal.date] ??= {};
      records[meal.date][meal.memberId] = meal;
    }
    return records;
  });

  const [saving, setSaving] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedMeals = members.map((member) => (
    mealsByDate[selectedDate]?.[member.id] ?? {
      memberId: member.id,
      date: selectedDate,
      lunch: false,
      dinner: false,
    }
  ));
  const lunchCount = selectedMeals.filter(
    (meal) => meal.lunch
  ).length;

  const dinnerCount = selectedMeals.filter(
    (meal) => meal.dinner
  ).length;

  const [year, monthNumber] = viewedMonth.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const monthLabel = new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString(
    "en",
    { month: "long", year: "numeric", timeZone: "UTC" }
  );

  async function changeMonth(offset: number) {
    if (loadingMonth) return;

    const [currentYear, currentMonth] = viewedMonth.split("-").map(Number);
    const nextMonth = new Date(Date.UTC(currentYear, currentMonth - 1 + offset, 1));
    const targetMonth = `${nextMonth.getUTCFullYear()}-${String(
      nextMonth.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    const selectedDay = Number(selectedDate.slice(-2));
    const targetLastDay = new Date(
      Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const targetDate = `${targetMonth}-${String(
      Math.min(selectedDay, targetLastDay)
    ).padStart(2, "0")}`;

    setMessage("");
    setError("");

    if (!loadedMonths.has(targetMonth)) {
      setLoadingMonth(true);
      try {
        const response = await fetch(
          `/api/meals?month=${encodeURIComponent(targetMonth)}`
        );
        if (!response.ok) {
          throw new Error("Failed to load this month's meal calendar.");
        }

        const data = (await response.json()) as { meals: MealRecord[] };
        setMealsByDate((previous) => {
          const next = { ...previous };
          for (const meal of data.meals) {
            next[meal.date] = {
              ...next[meal.date],
              [meal.memberId]: meal,
            };
          }
          return next;
        });
        setLoadedMonths((previous) => new Set(previous).add(targetMonth));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the calendar."
        );
        return;
      } finally {
        setLoadingMonth(false);
      }
    }

    setViewedMonth(targetMonth);
    setSelectedDate(targetDate);
  }

  function toggleMeal(memberId: string, type: "lunch" | "dinner") {
    setMealsByDate((previous) => {
      const dateMeals = previous[selectedDate] ?? {};
      const meal = dateMeals[memberId] ?? {
        memberId,
        date: selectedDate,
        lunch: false,
        dinner: false,
      };

      return {
        ...previous,
        [selectedDate]: {
          ...dateMeals,
          [memberId]: { ...meal, [type]: !meal[type] },
        },
      };
    });

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
          const meal = mealsByDate[selectedDate]?.[member.id] ?? {
            memberId: member.id,
            date: selectedDate,
            lunch: false,
            dinner: false,
          };

          const response = await fetch("/api/meals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              memberId: member.id,
              memberName: member.name,
              date: selectedDate,
              lunch: meal.lunch,
              dinner: meal.dinner,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save ${member.name}'s meal.`);
          }
        })
      );

      setMessage(`Meal statuses for ${selectedDate} saved successfully.`);
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
    label,
    onClick,
  }: {
    checked: boolean;
    label: string;
    onClick: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={checked}
        aria-label={`${label}: ${checked ? "ON" : "OFF"}`}
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
            description: "Selected day's confirmed meals",
          },
          {
            title: "Dinner Meals",
            value: dinnerCount,
            icon: Utensils,
            description: "Selected day's confirmed meals",
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

      {/* Monthly calendar */}
      <div className="overflow-hidden rounded-xl border border-[#292D35] bg-[#12151A]">
        <div className="flex flex-col justify-between gap-3 border-b border-[#292D35] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Monthly Meal Calendar</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Select any date to manage each member&apos;s lunch and dinner.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Settings2 size={16} />
            Admin control
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => void changeMonth(-1)}
              disabled={loadingMonth}
              aria-label="Previous month"
              className="rounded-lg border border-[#292D35] p-2 text-zinc-300 transition hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">{monthLabel}</h3>
            <button
              type="button"
              onClick={() => void changeMonth(1)}
              disabled={loadingMonth}
              aria-label="Next month"
              className="rounded-lg border border-[#292D35] p-2 text-zinc-300 transition hover:border-[#CCFF00] hover:text-[#CCFF00] disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {loadingMonth ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 size={18} className="animate-spin" />
              Loading meal calendar...
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-xs font-semibold text-zinc-500"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: firstWeekday }, (_, index) => (
                <div key={`empty-${index}`} aria-hidden="true" />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const date = `${viewedMonth}-${String(day).padStart(2, "0")}`;
                const dayMeals = members.map((member) => (
                  mealsByDate[date]?.[member.id]
                ));
                const dayLunchCount = dayMeals.filter((meal) => meal?.lunch).length;
                const dayDinnerCount = dayMeals.filter((meal) => meal?.dinner).length;
                const selected = date === selectedDate;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setMessage("");
                      setError("");
                    }}
                    aria-pressed={selected}
                    className={`min-h-20 rounded-lg border p-1.5 text-left transition sm:min-h-24 sm:p-2 ${
                      selected
                        ? "border-[#CCFF00] bg-[#CCFF00]/10"
                        : "border-[#292D35] bg-[#181C22] hover:border-zinc-500"
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        date === today ? "text-[#CCFF00]" : "text-zinc-200"
                      }`}
                    >
                      {day}
                    </span>
                    <span className="mt-2 flex flex-col gap-1 text-[10px] leading-tight text-zinc-400 sm:text-xs">
                      <span>Lunch {dayLunchCount}</span>
                      <span>Dinner {dayDinnerCount}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#292D35]">
          <div className="flex flex-col justify-between gap-3 border-b border-[#292D35] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Member Meal Status</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Lunch and dinner for {selectedDate}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <CalendarDays size={16} />
              {loadingMonth ? "Loading..." : "Selected date"}
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
                  const meal = mealsByDate[selectedDate]?.[member.id] ?? {
                    memberId: member.id,
                    date: selectedDate,
                    lunch: false,
                    dinner: false,
                  };

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
                            label={`${member.name}'s lunch`}
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
                            label={`${member.name}'s dinner`}
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

        {/* Save selected date */}
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
      </div>
    </>
  );
}
