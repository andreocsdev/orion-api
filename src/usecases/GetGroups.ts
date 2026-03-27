import { prisma } from "../lib/db.js";

export class GetGroups {
  async execute() {
    return prisma.grupos.findMany({
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        eventos: {
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
