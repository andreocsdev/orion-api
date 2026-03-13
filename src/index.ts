import "dotenv/config";
import fastifyApiReference from "@scalar/fastify-api-reference";
import fastifySwagger from "@fastify/swagger";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import Fastify from "fastify";
import { auth } from "./lib/auth.js";
import fastifyCors from "@fastify/cors";
import { CreateGroup } from "./usecases/CreateGroup.js";
import { CreateEvent } from "./usecases/CreateEvent.js";
import { AddUserToGroup } from "./usecases/AddUserToGroup.js";
import { GetOrCreateDailyCheck } from "./usecases/GetOrCreateDailyCheck.js";
import { UpdateDailyChecks } from "./usecases/UpdateDailyChecks.js";
import { GetDailyChecksHistory } from "./usecases/GetDailyChecksHistory.js";
import { manageGroupsRoutes } from "./routes/manage-groups.js";
import { manageDailyCheckRoutes } from "./routes/manage-daily-check.js";
import { manageEventsRoutes } from "./routes/manage-events.js";

const app = Fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "ÓrionApi",
      description: "API para o Site do Ministério Órion",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3000",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifyCors, {
  origin: "http://localhost:3000", //! Substitua pelo domínio do seu frontend
  credentials: true,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "Órion API",
        slug: "orion-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

//Routes
await app.register(manageEventsRoutes);
await app.register(manageGroupsRoutes);
await app.register(manageDailyCheckRoutes);


app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

try {
  await app.listen({ port: Number(process.env.PORT) || 3000 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
