import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    sessionUserId?: string;
    sessionUserRole?: "ADMIN" | "USER";
  }
}
