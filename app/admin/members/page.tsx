"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RefreshCw, Users, X } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  async function loadMembers() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/members");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load members.");
      setMembers(data.members);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function fetchMembers() {
      try {
        const response = await fetch("/api/admin/members");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load members.");
        if (active) setMembers(data.members);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load members.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchMembers();
    return () => { active = false; };
  }, []);

  async function handleAction() {
    if (!confirm) return;
    setProcessingId(confirm.id);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: confirm.id, action: confirm.action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Action failed.");
      toast.success(data.message);
      setConfirm(null);
      await loadMembers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setProcessingId(null);
    }
  }

  const pending = members.filter((member) => member.status === "pending");

  return (
    <main className="min-h-screen bg-[#0B0D10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#CCFF00]">
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#CCFF00]">MEMBER MANAGEMENT</p>
            <h1 className="text-3xl font-bold sm:text-4xl">Member Approvals</h1>
            <p className="mt-2 text-sm text-zinc-400">{pending.length} pending registrations</p>
          </div>
          <button onClick={loadMembers} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#292D35] px-4 py-3 text-sm hover:border-[#CCFF00] disabled:opacity-50">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#292D35] bg-[#16191F]">
          <div className="border-b border-[#292D35] px-5 py-4 font-semibold">Registrations</div>
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-400">Loading registrations...</div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center text-zinc-400"><Users size={36} className="mx-auto mb-3" />No registrations found.</div>
          ) : (
            <div className="divide-y divide-[#292D35]">
              {members.map((member) => (
                <div key={member.id} className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="mt-1 break-all text-sm text-zinc-400">{member.email}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Registered: {new Date(member.createdAt).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      member.status === "approved"
                        ? "bg-[#CCFF00]/10 text-[#CCFF00]"
                        : member.status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {member.status}
                    </span>
                    {member.status === "pending" && (
                      <>
                        <button onClick={() => setConfirm({ id: member.id, action: "approve" })} disabled={processingId !== null} className="inline-flex items-center gap-2 rounded-lg bg-[#CCFF00] px-4 py-2.5 text-sm font-semibold text-[#0B0D10]">
                          <Check size={16} /> Approve
                        </button>
                        <button onClick={() => setConfirm({ id: member.id, action: "reject" })} disabled={processingId !== null} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-400">
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#292D35] bg-[#16191F] p-6">
            <h2 className="text-lg font-bold">{confirm.action === "approve" ? "Approve member?" : "Reject registration?"}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {confirm.action === "approve" ? "This member will gain member dashboard access." : "This registration will be marked rejected."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="rounded-lg border border-[#292D35] px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleAction} disabled={processingId !== null} className="rounded-lg bg-[#CCFF00] px-4 py-2 text-sm font-bold text-[#0B0D10] disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
