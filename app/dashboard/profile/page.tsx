import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import clientPromise from "@/lib/mongo";
import MemberProfileForm from "@/components/member-profile-form";

export const instant = false;

export default async function MemberProfilePage() {
  const session = await getCurrentSession(await headers());
  if (!session) redirect("/login");
  if (session.user.role === "admin") redirect("/admin/profile");

  const db = (await clientPromise).db("messmate");
  const member = await db.collection("members").findOne({ userId: session.user.id });
  if (!member || member.status !== "approved" || !member.isActive) {
    redirect("/login?status=pending");
  }

  return <MemberProfileForm />;
}
