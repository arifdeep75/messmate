
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const authClientBaseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000");

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
