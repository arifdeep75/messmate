"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface Props {
  initialName: string;
  initialImage: string;
}

export default function AdminProfileForm({ initialName, initialImage }: Props) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });
      if (error) throw new Error(error.message || "Profile update failed.");
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveProfile} className="mt-8 space-y-5 rounded-xl border border-[#292D35] bg-[#12151A] p-6">
      <label className="block text-sm text-zinc-400">
        Admin Name
        <input
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Profile Image URL
        <input
          type="url"
          value={image}
          onChange={(event) => setImage(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-[#292D35] bg-[#0B0D10] px-3 text-white outline-none focus:border-[#CCFF00]"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#CCFF00] px-5 text-sm font-bold text-[#0B0D10] disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Profile
      </button>
    </form>
  );
}
