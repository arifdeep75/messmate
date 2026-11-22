
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin } from "better-auth/plugins";
import { client } from "@/lib/mongo";
import clientPromise from "@/lib/mongo";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const configuredOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].flatMap((value) => (value ? [new URL(value).origin] : []));
const configuredBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

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