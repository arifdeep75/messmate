import clientPromise from "@/lib/mongo";

export function dhakaNow(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return new Date(
    `${values.year}-${values.month}-${values.day}T00:00:00+06:00`
  );
}

export function dhakaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function monthRange(date = new Date()) {
  const current = dhakaDateString(date);
  const [year, month] = current.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function ensureIndexes() {
  const client = await clientPromise;
  const db = client.db("messmate");
  await db.collection("members").createIndex({ userId: 1 }, { unique: true });
  await db.collection("members").createIndex({ status: 1, isActive: 1 });
  await db.collection("meals").createIndex({ memberId: 1, date: 1 }, { unique: true });
  await db.collection("meals").createIndex({ date: -1 });
  await db.collection("bazar").createIndex({ date: -1 });
  await db.collection("deposits").createIndex({ memberId: 1, date: -1 });
  await db.collection("guest-meals").createIndex({ date: -1 });
  await db.collection("shopping-list").createIndex({ completed: 1, createdAt: -1 });
  await db.collection("notices").createIndex({ createdAt: -1 });
  await db.collection("settings").createIndex({ key: 1 }, { unique: true });
}

export async function getMonthlySummary() {
  await ensureIndexes();
  const client = await clientPromise;
  const db = client.db("messmate");
  const { start, end } = monthRange();

  const approvedMembers = await db
    .collection("members")
    .find({ status: "approved", isActive: true })
    .toArray();
  const approvedIds = new Set(approvedMembers.map((member) => member.userId as string));

  const [meals, bazar, guestMeals, deposits] = await Promise.all([
    db.collection("meals").find({ date: { $gte: start, $lte: end } }).toArray(),
    db.collection("bazar").find({ date: { $gte: start, $lte: end } }).toArray(),
    db.collection("guest-meals").find({ date: { $gte: start, $lte: end } }).toArray(),
    db.collection("deposits").find({ date: { $gte: start, $lte: end } }).toArray(),
  ]);

  const memberMeals = meals
    .filter((meal) => approvedIds.has(meal.memberId))
    .reduce((total, meal) => total + Number(meal.lunch) + Number(meal.dinner), 0);
  const guestMealCount = guestMeals.reduce(
    (total, record) => total + Number(record.count || 0),
    0
  );
  const totalMeals = memberMeals + guestMealCount;
  const bazarExpense = bazar.reduce(
    (total, record) => total + Number(record.amount || 0),
    0
  );
  const depositsTotal = deposits.reduce(
    (total, record) => total + Number(record.amount || 0),
    0
  );
  const mealRate = totalMeals > 0 ? bazarExpense / totalMeals : 0;

  return {
    approvedMemberCount: approvedMembers.length,
    memberMeals,
    guestMealCount,
    totalMeals,
    bazarExpense,
    depositsTotal,
    mealRate,
  };
}
