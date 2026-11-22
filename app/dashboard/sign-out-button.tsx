
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="mt-6 rounded-md bg-black px-5 py-2.5 text-white hover:bg-gray-800"
    >
      Sign Out
    </button>
  );
}
