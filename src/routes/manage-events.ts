import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CreateEvent } from "../usecases/CreateEvent.js";
import { GetEventsByUserGroup } from "../usecases/GetEventsByUserGroup.js";
import { ErrorSchema } from "../schema/index.js";
import { GetEvents } from "../usecases/GetEvents.js";
import { requireAuth, requireRole } from "../lib/route-guards.js";

export const manageEventsRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/create-event",
    preHandler: [requireRole(["ADMIN"])],
    schema: {
      tags: ["Events"],
      summary: "Create a new event",
      body: z.object({
        name: z.string(),
        date: z.string(),
        location: z.string(),
        grupoId: z.string().optional(),
      }),
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          date: z.string(),
          location: z.string(),
          grupoId: z.string().nullable(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const createEvent = new CreateEvent();
      const result = await createEvent.execute(request.body);
      return reply.status(201).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/events/by-user-group",
    preHandler: [requireAuth],
    schema: {
      tags: ["Events"],
      summary: "List events by the user's group",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            date: z.string(),
            location: z.string(),
            grupoId: z.string().nullable(),
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

      const getEventsByUserGroup = new GetEventsByUserGroup();
      const result = await getEventsByUserGroup.execute({
        userId: request.sessionUserId,
      });
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/events",
    schema: {
      tags: ["Events"],
      summary: "List events",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            date: z.string(),
            location: z.string(),
          }),
        ),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      const getEvents = new GetEvents();
      const result = await getEvents.execute();
      return reply.status(200).send(result);
    },
  });
};
