import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { CreateGroup } from "../usecases/CreateGroup.js";
import { AddUserToGroup } from "../usecases/AddUserToGroup.js";
import { FastifyInstance } from "fastify";
import { ErrorSchema } from "../schema/index.js";
import { requireRole } from "../lib/route-guards.js";
import { GetGroups } from "../usecases/GetGroups.js";

export const manageGroupsRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/groups",
    preHandler: [requireRole(["ADMIN"])],
    schema: {
      tags: ["Groups"],
      summary: "List groups",
      response: {
        200: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            users: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }),
            ),
            eventos: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ),
          }),
        ),
        401: ErrorSchema,
        403: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      const getGroups = new GetGroups();
      const result = await getGroups.execute();
      return reply.status(200).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/create-group",
    preHandler: [requireRole(["ADMIN"])],
    schema: {
      tags: ["Groups"],
      summary: "Create a new group",
      body: z.object({
        name: z.string(),
      }),
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const createGroup = new CreateGroup();
      const result = await createGroup.execute(request.body);
      return reply.status(201).send(result);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/groups/add-users-to-group",
    preHandler: [requireRole(["ADMIN"])],
    schema: {
      tags: ["Groups"],
      summary: "Add users to a group",
      body: z.object({
        groupId: z.string(),
        userIds: z.array(z.string()).min(1),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          users: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          ),
        }),
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const addUserToGroup = new AddUserToGroup();
      const result = await addUserToGroup.execute(request.body);

      return reply.status(200).send(result);
    },
  });
};
