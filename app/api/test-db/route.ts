
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongo";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("messmate").command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully!",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Database Connection Failed" },
      { status: 500 }
    );
  }
}
