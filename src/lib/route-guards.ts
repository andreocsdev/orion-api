import type { FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import { prisma } from "./db.js";

type AppRole = "ADMIN" | "USER";

async function getSession(request: FastifyRequest) {
  return auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return reply.status(401).send({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  request.sessionUserId = session.user.id;
}

export function requireRole(allowedRoles: AppRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const session = await getSession(request);

    if (!session?.user?.id) {
      return reply.status(401).send({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const rows = await prisma.$queryRaw<Array<{ role: AppRole }>>`
      SELECT "role"
      FROM "user"
      WHERE "id" = ${session.user.id}
      LIMIT 1
    `;

    const role = rows[0]?.role;

    if (!role || !allowedRoles.includes(role)) {
      return reply.status(403).send({
        error: "Forbidden",
        code: "FORBIDDEN",
      });
    }

    request.sessionUserId = session.user.id;
    request.sessionUserRole = role;
  };
}
