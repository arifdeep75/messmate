
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentSession } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { z } from "zod";

const DB_NAME = "messmate";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const meals = await db
      .collection("meals")
      .find({ date: today })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({
      meals: meals.map((meal) => ({
        memberId: meal.memberId,
        memberName: meal.memberName,
        date: meal.date,
        lunch: Boolean(meal.lunch),
        dinner: Boolean(meal.dinner),
      })),
    });
  } catch (error) {
    console.error("GET meals error:", error);

    return NextResponse.json(
      { message: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession(await headers());

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const parsed = z.object({
      memberId: z.string().trim().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      lunch: z.boolean(),
      dinner: z.boolean(),
    }).safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid meal data" },
        { status: 400 }
      );
    }
    const { memberId, date, lunch, dinner } = parsed.data;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const member = await db.collection("members").findOne({
      userId: memberId,
      status: "approved",
      isActive: true,
    });
    if (!member) {
      return NextResponse.json({ message: "Approved member not found." }, { status: 404 });
    }

    const result = await db.collection("meals").updateOne(
      { memberId, date },
      {
        $set: {
          memberName: member.name,
          lunch,
          dinner,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Meal status saved successfully",
      result,
    });
  } catch (error) {
    console.error("POST meals error:", error);

    return NextResponse.json(
      { message: "Failed to save meal status" },
      { status: 500 }
    );
  }
}
