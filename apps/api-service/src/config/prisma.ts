import { RoomMode, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const initializePrisma = async () => {
  await prisma.$connect();
  console.log("Connected to the database");

  const defaultRoom = await prisma.room.findFirst({
    where: { isDefault: true },
  });

  if (!defaultRoom) {
    await prisma.room.create({
      data: {
        mode: RoomMode.VIDEO,
        isDefault: true,
        requiresModeration: true,
      },
    });
    console.log("Default room created");
  }
};

export default prisma;
