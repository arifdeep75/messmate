
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const authClientBaseURL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL
    : typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!authClientBaseURL) {
  throw new Error("Set NEXT_PUBLIC_APP_URL for the production Better Auth client.");
}

export const authClient = createAuthClient({
  baseURL: new URL(authClientBaseURL).origin,

  plugins: [adminClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
