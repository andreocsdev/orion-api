import { prisma } from "../lib/db.js";

interface Dto {
  groupId: string;
  userIds: string[];
}

export class AddUserToGroup {
  async execute(dto: Dto) {
    const userIds = [...new Set(dto.userIds)];

    if (userIds.length === 0) {
      throw new Error("At least one user must be provided");
    }

    const group = await prisma.grupos.findUnique({
      where: {
        id: dto.groupId,
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length !== userIds.length) {
      const foundUserIds = new Set(users.map((user) => user.id));
      const missingUserIds = userIds.filter((userId) => !foundUserIds.has(userId));

      throw new Error(`Users not found: ${missingUserIds.join(", ")}`);
    }

    await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        groupId: dto.groupId,
      },
    });

    const updatedGroup = await prisma.grupos.findUniqueOrThrow({
      where: {
        id: dto.groupId,
      },
      select: {
        id: true,
        name: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedGroup;
  }
}
