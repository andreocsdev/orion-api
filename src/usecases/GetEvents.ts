import { prisma } from "../lib/db.js";

export class GetEvents {
  async execute() {
    const events = await prisma.eventos.findMany({
      orderBy: { date: "asc" },
    });

    return events.map((event) => ({
      ...event,
      date: event.date.toISOString(),
    }));
  }
}
