import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongo";

const collections = {
  bazar: "bazar",
  deposits: "deposits",
  "guest-meals": "guest-meals",
  "shopping-list": "shopping-list",
  notices: "notices",
  settings: "settings",
} as const;

type Resource = keyof typeof collections;

async function adminSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") return null;
  return session;
}

function recordSchema(resource: Resource) {
  if (resource === "bazar") {
    return z.object({
      amount: z.number().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      description: z.string().trim().min(2).max(300),
      purchaser: z.string().trim().min(2).max(80),
    });
  }
  if (resource === "deposits") {
    return z.object({
      amount: z.number().positive(),
      memberId: z.string().trim().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      method: z.string().trim().min(1).max(80).optional(),
      note: z.string().trim().max(300).optional(),
    });
  }
  if (resource === "guest-meals") {
    return z.object({
      count: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      description: z.string().trim().min(2).max(300),
    });
  }
  if (resource === "shopping-list") {
    return z.object({
      item: z.string().trim().min(2).max(200),
      completed: z.boolean().optional(),
    });
  }
  if (resource === "notices") {
    return z.object({
      title: z.string().trim().min(2).max(160),
      body: z.string().trim().min(2).max(5000),
      published: z.boolean().optional(),
    });
  }
  return z.object({
    key: z.string().trim().min(2).max(100),
    value: z.unknown(),
  });
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await context.params;
  if (!(resource in collections)) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });

  const db = (await clientPromise).db("messmate");
  const records = await db
    .collection(collections[resource as Resource])
    .find({})
    .sort({ date: -1, createdAt: -1 })
    .limit(500)
    .toArray();

  return NextResponse.json({ records: records.map((record) => ({ ...record, id: String(record._id) })) });
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await context.params;
  if (!(resource in collections)) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });

  const parsed = recordSchema(resource as Resource).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ message: "Invalid record data." }, { status: 400 });

  const db = (await clientPromise).db("messmate");
  if (resource === "deposits") {
    if (!("memberId" in parsed.data)) {
      return NextResponse.json({ message: "Invalid record data." }, { status: 400 });
    }
    const member = await db.collection("members").findOne({
      userId: parsed.data.memberId,
      status: "approved",
      isActive: true,
    });
    if (!member) return NextResponse.json({ message: "Approved member not found." }, { status: 404 });
  }

  const now = new Date();
  const result = await db.collection(collections[resource as Resource]).insertOne({
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
    createdBy: session.user.id,
  });
  return NextResponse.json({ success: true, id: String(result.insertedId), message: "Record created successfully." });
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await context.params;
  if (!(resource in collections)) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });

  const body = await request.json();
  if (typeof body.id !== "string" || !ObjectId.isValid(body.id)) {
    return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
  }
  const { id, ...data } = body;
  const parsed = recordSchema(resource as Resource).safeParse(data);
  if (!parsed.success) return NextResponse.json({ message: "Invalid record data." }, { status: 400 });

  const db = (await clientPromise).db("messmate");
  const result = await db.collection(collections[resource as Resource]).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...parsed.data, updatedAt: new Date(), updatedBy: session.user.id } }
  );
  if (result.matchedCount === 0) return NextResponse.json({ message: "Record not found." }, { status: 404 });
  return NextResponse.json({ success: true, message: "Record updated successfully." });
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  const session = await adminSession(request);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { resource } = await context.params;
  if (!(resource in collections)) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });

  const body = await request.json();
  if (typeof body.id !== "string" || !ObjectId.isValid(body.id)) {
    return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
  }
  const db = (await clientPromise).db("messmate");
  const result = await db.collection(collections[resource as Resource]).deleteOne({ _id: new ObjectId(body.id) });
  if (result.deletedCount === 0) return NextResponse.json({ message: "Record not found." }, { status: 404 });
  return NextResponse.json({ success: true, message: "Record deleted successfully." });
}
