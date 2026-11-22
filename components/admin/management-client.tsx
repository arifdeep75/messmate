"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  resource: "bazar" | "deposits" | "guest-meals" | "shopping-list" | "notices" | "settings";
  title: string;
}

export default function ManagementClient({ resource, title }: Props) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const [recordResponse, memberResponse] = await Promise.all([
        fetch(`/api/admin/${resource}`),
        resource === "deposits" ? fetch("/api/admin/members") : Promise.resolve(null),
      ]);
      const recordData = await recordResponse.json();
      if (!recordResponse.ok) throw new Error(recordData.message || "Failed to load records.");
      setRecords(recordData.records);
      if (memberResponse) {
        const memberData = await memberResponse.json();
        if (memberResponse.ok) {
          setMembers(memberData.members.filter((member: { status: string }) => member.status === "approved").map((member: { id: string; name: string }) => ({ id: member.id, name: member.name })));
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function fetchRecords() {
      try {
        const recordResponse = await fetch(`/api/admin/${resource}`);
        const recordData = await recordResponse.json();
        if (!recordResponse.ok) throw new Error(recordData.message || "Failed to load records.");
        if (active) setRecords(recordData.records);
        if (resource === "deposits") {
          const memberResponse = await fetch("/api/admin/members");
          const memberData = await memberResponse.json();
          if (memberResponse.ok && active) {
            setMembers(memberData.members.filter((member: { status: string }) => member.status === "approved").map((member: { id: string; name: string }) => ({ id: member.id, name: member.name })));
          }
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load records.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchRecords();
    return () => { active = false; };
  }, [resource]);

  function setField(name: string, value: string | boolean) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if ("amount" in form) payload.amount = Number(form.amount);
      if ("count" in form) payload.count = Number(form.count);
      if (resource === "shopping-list") payload.completed = Boolean(form.completed);

      const response = await fetch(`/api/admin/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save.");
      toast.success(data.message);
      setForm({});
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord() {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete.");
      toast.success(data.message);
      setDeleteId(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete.");
    }
  }

  const inputClass = "h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-sm text-white outline-none focus:border-[#CCFF00]";

  return (
    <>
      <form onSubmit={submit} className="mb-8 grid gap-4 rounded-xl border border-[#292D35] bg-[#16191F] p-5 md:grid-cols-2 lg:grid-cols-4">
        {resource === "bazar" && (
          <>
            <input required type="number" min="1" step="0.01" placeholder="Amount" value={String(form.amount || "")} onChange={(e) => setField("amount", e.target.value)} className={inputClass} />
            <input required type="date" value={String(form.date || "")} onChange={(e) => setField("date", e.target.value)} className={inputClass} />
            <input required placeholder="Description" value={String(form.description || "")} onChange={(e) => setField("description", e.target.value)} className={inputClass} />
            <input required placeholder="Purchaser" value={String(form.purchaser || "")} onChange={(e) => setField("purchaser", e.target.value)} className={inputClass} />
          </>
        )}
        {resource === "deposits" && (
          <>
            <input required type="number" min="1" step="0.01" placeholder="Amount" value={String(form.amount || "")} onChange={(e) => setField("amount", e.target.value)} className={inputClass} />
            <select required value={String(form.memberId || "")} onChange={(e) => setField("memberId", e.target.value)} className={inputClass}><option value="">Select member</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>
            <input required type="date" value={String(form.date || "")} onChange={(e) => setField("date", e.target.value)} className={inputClass} />
            <input placeholder="Payment method / note" value={String(form.method || form.note || "")} onChange={(e) => setField("method", e.target.value)} className={inputClass} />
          </>
        )}
        {resource === "guest-meals" && (
          <>
            <input required type="number" min="1" placeholder="Guest count" value={String(form.count || "")} onChange={(e) => setField("count", e.target.value)} className={inputClass} />
            <input required type="date" value={String(form.date || "")} onChange={(e) => setField("date", e.target.value)} className={inputClass} />
            <input required className={inputClass} placeholder="Description" value={String(form.description || "")} onChange={(e) => setField("description", e.target.value)} />
          </>
        )}
        {resource === "shopping-list" && (
          <input required className={inputClass} placeholder="Shopping item" value={String(form.item || "")} onChange={(e) => setField("item", e.target.value)} />
        )}
        {resource === "notices" && (
          <>
            <input required className={inputClass} placeholder="Notice title" value={String(form.title || "")} onChange={(e) => setField("title", e.target.value)} />
            <textarea required className="min-h-11 rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 py-3 text-sm text-white md:col-span-2" placeholder="Notice body" value={String(form.body || "")} onChange={(e) => setField("body", e.target.value)} />
          </>
        )}
        {resource === "settings" && (
          <>
            <input required className={inputClass} placeholder="Setting key" value={String(form.key || "")} onChange={(e) => setField("key", e.target.value)} />
            <input required className={inputClass} placeholder="Setting value" value={String(form.value || "")} onChange={(e) => setField("value", e.target.value)} />
          </>
        )}
        <button disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#CCFF00] px-5 text-sm font-bold text-[#0B0D10] disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add {title}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-[#292D35] bg-[#16191F]">
        {loading ? (
          <p className="p-10 text-center text-zinc-400">Loading...</p>
        ) : records.length === 0 ? (
          <p className="p-10 text-center text-zinc-500">No records found.</p>
        ) : (
          <div className="divide-y divide-[#292D35]">
            {records.map((record) => (
              <div key={String(record.id)} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{String(record.description || record.title || record.item || record.key || record.memberId || "Record")}</p>
                  <p className="mt-1 text-xs text-zinc-500">{String(record.date || record.count ? `${record.date || ""}${record.count ? ` · ${record.count} guests` : ""}` : "")}{record.amount !== undefined ? ` · ৳ ${Number(record.amount).toLocaleString("en-BD")}` : ""}</p>
                </div>
                <button onClick={() => setDeleteId(String(record.id))} className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10" aria-label="Delete record"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#292D35] bg-[#16191F] p-6">
            <h2 className="text-lg font-bold">Delete record?</h2><p className="mt-2 text-sm text-zinc-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="rounded-lg border border-[#292D35] px-4 py-2 text-sm">Cancel</button><button onClick={removeRecord} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400">Delete</button></div>
          </div>
        </div>
      )}
    </>
  );
}
