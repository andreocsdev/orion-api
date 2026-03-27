import { prisma } from "../lib/db.js";

export class GetAvailableUsers {
  async execute() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
