
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import { z } from "zod";

async function verifyAdmin(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
}

// Get all pending registrations
export async function GET(request: Request) {
  try {
    const session = await verifyAdmin(request);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("messmate");

    const members = await db
      .collection("members")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      members: members.map((member) => ({
        id: member.userId,
        name: member.name,
        email: member.email,
        status: member.status || "pending",
        isActive: Boolean(member.isActive),
        createdAt: member.createdAt,
      })),
    });
  } catch (error) {
    console.error("Pending members error:", error);

    return NextResponse.json(
      { message: "Failed to load pending registrations." },
      { status: 500 }
    );
  }
}

// Approve or reject a registration
export async function PATCH(request: Request) {
  try {
    const session = await verifyAdmin(request);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const parsed = z
      .object({
        userId: z.string().trim().min(1),
        action: z.enum(["approve", "reject"]),
      })
      .safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }
    const { userId, action } = parsed.data;

    const client = await clientPromise;
    const db = client.db("messmate");

    const status = action === "approve" ? "approved" : "rejected";
    const isActive = action === "approve";

    const result = await db.collection("members").updateOne(
      {
        userId,
        status: "pending",
      },
      {
        $set: {
          status,
          isActive,
          updatedAt: new Date(),
          approvedBy: action === "approve" ? session.user.id : null,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Pending member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Member approved successfully."
          : "Registration rejected successfully.",
    });
  } catch (error) {
    console.error("Member approval error:", error);

    return NextResponse.json(
      { message: "Failed to update registration." },
      { status: 500 }
    );
  }
}
