"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function MemberProfileForm() {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/members/me");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load profile.");
        if (active) {
          setName(data.member.name || "");
          setProfileImage(data.member.profileImage || "");
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Failed to load profile.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const { error: authError } = await authClient.updateUser({
        name: name.trim(),
        image: profileImage.trim() || null,
      });
      if (authError) throw new Error(authError.message || "Failed to update account profile.");
      const response = await fetch("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile.");
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message || "Password change failed.");
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password change failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0D10] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[#CCFF00]">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        {loading ? <p className="mt-8 text-zinc-500">Loading profile...</p> : (
          <div className="mt-8 space-y-6">
            <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-[#292D35] bg-[#12151A] p-6">
              <label className="block text-sm text-zinc-400">
                Full Name
                <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]" />
              </label>
              <label className="block text-sm text-zinc-400">
                Profile Image URL
                <input type="url" value={profileImage} onChange={(event) => setProfileImage(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]" />
              </label>
              <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#CCFF00] px-5 text-sm font-bold text-[#0B0D10] disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
              </button>
            </form>

            <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-[#292D35] bg-[#12151A] p-6">
              <h2 className="font-bold">Change Password</h2>
              <input required type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]" />
              <input required minLength={8} type="password" autoComplete="new-password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]" />
              <button disabled={saving} className="h-11 rounded-lg border border-[#CCFF00] px-5 text-sm font-bold text-[#CCFF00] disabled:opacity-50">Change Password</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
