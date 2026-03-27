import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/db.js";
import { ErrorSchema } from "../schema/index.js";
import { GetRanking } from "../usecases/GetRanking.js";
import { GetUserProfile } from "../usecases/GetUserProfile.js";
import { requireAuth, requireRole } from "../lib/route-guards.js";
import { GetAvailableUsers } from "../usecases/GetAvailableUsers.js";

export const manageUsersRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users/resolve-login",
    schema: {
      tags: ["Users"],
      summary: "Resolve username or email to login email",
      querystring: z.object({
        login: z.string().min(1),
      }),
      response: {
        200: z.object({
          email: z.string(),
        }),
        404: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const login = request.query.login.trim();

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: login, mode: "insensitive" } },
            { name: { equals: login, mode: "insensitive" } },
          ],
        },
        select: {
          email: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      return reply.status(200).send({ email: user.email });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/ranking",
    schema: {
      tags: ["Users"],
      summary: "Get user ranking based on daily checks",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
            bibleCount: z.number(),
            lessonCount: z.number(),
            score: z.number(),
          }),
        ),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      const getRanking = new GetRanking();
      const result = await getRanking.execute();
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users/profile",
    preHandler: [requireAuth],
    schema: {
      tags: ["Users"],
      summary: "Get profile data for authenticated user",
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.enum(["ADMIN", "USER"]),
          image: z.string().nullable(),
          group: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .nullable(),
          currentStreak: z.number(),
          bestStreak: z.number(),
          groupEvents: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              date: z.string(),
              location: z.string(),
              grupoId: z.string().nullable(),
              responsibleMembers: z.array(
                z.object({
                  name: z.string(),
                  image: z.string().nullable(),
                }),
              ),
            }),
          ),
        }),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      if (!request.sessionUserId) {
        return reply.status(401).send({
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        });
      }

      const getUserProfile = new GetUserProfile();
      const result = await getUserProfile.execute({
        userId: request.sessionUserId,
      });
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/users/available",
    preHandler: [requireRole(["ADMIN"])],
    schema: {
      tags: ["Users"],
      summary: "List users available to be added to a group",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            image: z.string().nullable(),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      const getAvailableUsers = new GetAvailableUsers();
      const result = await getAvailableUsers.execute();
      return reply.status(200).send(result);
    },
  });
};
