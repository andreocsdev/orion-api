import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { GetOrCreateDailyCheck } from "../usecases/GetOrCreateDailyCheck.js";
import { UpdateDailyChecks } from "../usecases/UpdateDailyChecks.js";
import { GetDailyChecksHistory } from "../usecases/GetDailyChecksHistory.js";
import { ErrorSchema } from "../schema/index.js";
import { requireAuth } from "../lib/route-guards.js";

export const manageDailyCheckRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/daily-check",
    preHandler: [requireAuth],
    schema: {
      tags: ["Daily Check"],
      summary: "Get or create daily check",
      response: {
        200: z.object({
          id: z.string(),
          userId: z.string(),
          checkDate: z.string(),
          read_bible: z.boolean(),
          read_lesson: z.boolean(),
        }),
        400: ErrorSchema,
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

      const getOrCreateDailyCheck = new GetOrCreateDailyCheck();
      const result = await getOrCreateDailyCheck.execute({
        userId: request.sessionUserId,
      });
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/daily-check",
    preHandler: [requireAuth],
    schema: {
      tags: ["Daily Check"],
      summary: "Update daily check",
      body: z
        .object({
          read_bible: z.boolean().optional(),
          read_lesson: z.boolean().optional(),
        })
        .refine(
          (data) =>
            data.read_bible !== undefined || data.read_lesson !== undefined,
          {
            message:
              "At least one of read_bible or read_lesson must be provided",
          },
        ),
      response: {
        200: z.object({
          id: z.string(),
          userId: z.string(),
          checkDate: z.string(),
          read_bible: z.boolean(),
          read_lesson: z.boolean(),
        }),
        400: ErrorSchema,
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

      const updateDailyChecks = new UpdateDailyChecks();
      const result = await updateDailyChecks.execute({
        userId: request.sessionUserId,
        ...request.body,
      });
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/daily-check/history",
    preHandler: [requireAuth],
    schema: {
      tags: ["Daily Check"],
      summary: "Get daily check history",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            userId: z.string(),
            checkDate: z.string(),
            read_bible: z.boolean(),
            read_lesson: z.boolean(),
          }),
        ),
        400: ErrorSchema,
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

      const getDailyChecksHistory = new GetDailyChecksHistory();
      const result = await getDailyChecksHistory.execute({
        userId: request.sessionUserId,
      });
      return reply.status(200).send(result);
    },
  });
};
