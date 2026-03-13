import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./db.js";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000"], //! Substitua pelo domínio do seu frontend
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [openAPI()],
});
