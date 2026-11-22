import clientPromise from "@/lib/mongo";
import { Bell } from "lucide-react";
import { connection } from "next/server";

export const instant = false;

export default async function NoticesPage() {
  await connection();
  const db = (await clientPromise).db("messmate");
  const notices = await db.collection("notices").find({ published: { $ne: false } }).sort({ createdAt: -1 }).toArray();
  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-[#CCFF00]">ANNOUNCEMENTS</p><h1 className="mt-2 text-4xl font-bold">Notice Board</h1>
        <div className="mt-8 space-y-5">
          {notices.length === 0 ? <p className="rounded-xl border border-[#292D35] bg-[#12151A] p-8 text-center text-zinc-500">No notices published.</p> : notices.map((notice) => (
            <article key={String(notice._id)} className="rounded-xl border border-[#292D35] bg-[#12151A] p-6"><div className="flex items-start gap-3"><Bell className="mt-1 shrink-0 text-[#CCFF00]" /><div><h2 className="font-bold">{notice.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-400">{notice.body}</p><p className="mt-4 text-xs text-zinc-600">{new Date(notice.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}</p></div></div></article>
          ))}
        </div>
      </div>
    </main>
  );
}
