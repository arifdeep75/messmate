
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin } from "better-auth/plugins";
import { client } from "@/lib/mongo";
import clientPromise from "@/lib/mongo";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const configuredURLs = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter((value): value is string => Boolean(value));
const configuredOrigins = [...new Set(configuredURLs.map((value) => {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Better Auth URLs must use HTTP or HTTPS.");
  }
  return url.origin;
}))];

if (
  process.env.NODE_ENV === "production" &&
  !process.env.BETTER_AUTH_URL &&
  !process.env.NEXT_PUBLIC_APP_URL
) {
  throw new Error("Set BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL in production.");
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.BETTER_AUTH_URL &&
  process.env.NEXT_PUBLIC_APP_URL &&
  new URL(process.env.BETTER_AUTH_URL).origin !==
    new URL(process.env.NEXT_PUBLIC_APP_URL).origin
) {
  throw new Error("BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL must use the same production origin.");
}

const configuredBaseURL =
  configuredOrigins[0] || "http://localhost:3000";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "production"
      ? configuredBaseURL
      : {
          allowedHosts: [
            "localhost",
            "localhost:*",
            "127.0.0.1",
            "127.0.0.1:*",
          ],
          fallback: configuredBaseURL,
          protocol: "http",
        },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    ...(process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:*", "http://127.0.0.1:*"]),
    ...configuredOrigins,
  ],

  database: mongodbAdapter(client.db("messmate"), {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === "admin") return;

          const database = (await clientPromise).db("messmate");
          const members = database.collection("members");
          await members.createIndex({ userId: 1 }, { unique: true });
          const now = new Date();
          await members.updateOne(
            { userId: user.id },
            {
              $setOnInsert: {
                userId: user.id,
                name: user.name,
                email: user.email.toLowerCase(),
                profileImage: user.image || "",
                previousBalance: 0,
                status: "pending",
                isActive: false,
                createdAt: now,
              },
              $set: { updatedAt: now },
            },
            { upsert: true }
          );
        },
      },
    },
  },

  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  
});
export async function getCurrentSession(headers: Headers) {
  return await auth.api.getSession({
    headers,
  });
}