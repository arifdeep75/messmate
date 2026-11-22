
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { z } from "zod";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role === "admin") return NextResponse.json({ message: "Admin does not have a member profile." }, { status: 403 });

  const client = await clientPromise;
  const member = await client.db("messmate").collection("members").findOne({ userId: session.user.id });
  if (!member) return NextResponse.json({ message: "Member profile not found." }, { status: 404 });

  return NextResponse.json({
    member: {
      id: member.userId,
      name: member.name,
      email: member.email,
      profileImage: member.profileImage || "",
      status: member.status || "pending",
      isActive: Boolean(member.isActive),
      previousBalance: Number(member.previousBalance || 0),
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    profileImage: z.string().trim().url().max(2048).or(z.literal("")).optional(),
  }).safeParse(await request.json());

  if (!parsed.success) return NextResponse.json({ message: "Invalid profile data." }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("messmate");
  const member = await db.collection("members").findOne({ userId: session.user.id });
  if (!member) return NextResponse.json({ message: "Member profile not found." }, { status: 404 });
  if (member.status !== "approved" || !member.isActive) {
    return NextResponse.json({ message: "Your account must be approved before profile updates." }, { status: 403 });
  }

  const update: Record<string, string> = {};
  if (parsed.data.name !== undefined) update.name = parsed.data.name;
  if (parsed.data.profileImage !== undefined) update.profileImage = parsed.data.profileImage;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ message: "No changes provided." }, { status: 400 });
  }

  await db.collection("members").updateOne(
    { userId: session.user.id },
    { $set: { ...update, updatedAt: new Date() } }
  );

  if (update.name) {
    await db.collection("meals").updateMany(
      { memberId: session.user.id },
      { $set: { memberName: update.name } }
    );
  }

  return NextResponse.json({ success: true, message: "Profile updated successfully." });
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role === "admin") {
      return NextResponse.json(
        { message: "Admin does not need a member profile." },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("messmate");

    const members = db.collection("members");

    await members.updateOne(
      { userId: session.user.id },
      {
        $setOnInsert: {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email.toLowerCase(),
          profileImage: "",
          previousBalance: 0,
          status: "pending",
          isActive: false,
          createdAt: new Date(),
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Handle older profiles that do not have a status yet.
    await members.updateOne(
      {
        userId: session.user.id,
        status: { $exists: false },
      },
      {
        $set: {
          status: "pending",
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    const member = await members.findOne({
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      status: member?.status ?? "pending",
      message: "Your registration is waiting for admin approval.",
    });
  } catch (error) {
    console.error("Member profile creation error:", error);

    return NextResponse.json(
      { message: "Failed to create member profile." },
      { status: 500 }
    );
  }
}
