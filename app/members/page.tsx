import clientPromise from "@/lib/mongo";
import { Users } from "lucide-react";
import Image from "next/image";
import { connection } from "next/server";

export const instant = false;

export default async function MembersPage() {
  await connection();
  const db = (await clientPromise).db("messmate");
  const members = await db.collection("members").find({ status: "approved", isActive: true }).sort({ name: 1 }).toArray();
  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold text-[#CCFF00]">MESS COMMUNITY</p><h1 className="mt-2 text-4xl font-bold">Approved Members</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.length === 0 ? <p className="text-zinc-500">No approved members yet.</p> : members.map((member) => (
            <div key={String(member._id)} className="rounded-xl border border-[#292D35] bg-[#12151A] p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#CCFF00]/10 text-[#CCFF00]">
                {member.profileImage ? (
                  <Image src={member.profileImage} alt={member.name} width={48} height={48} className="h-full w-full object-cover" />
                ) : (
                  <Users />
                )}
              </div>
              <h2 className="font-bold">{member.name}</h2>
              <p className="mt-1 text-xs text-zinc-500">Approved member</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
