import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./db.js";
import { env } from "./env.js";

console.log("trustedOrigins:", [env.WEB_APP_BASE_URL, "https://orion.aosc.com.br"]);
console.log("baseURL:", env.API_BASE_URL);

export const auth = betterAuth({
  trustedOrigins: [env.WEB_APP_BASE_URL], //! Substitua pelo domínio do seu frontend
  baseURL: env.API_BASE_URL,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [openAPI()],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        env.NODE_ENV === "production" ? ".aosc.com.br" : undefined,
    },
  },
});
