import prisma from "@/config/prisma";
import { IRoom, RoomMode } from "@/types";

export const getAllRooms = async (
  filters?: Partial<
    Pick<IRoom, "isDefault" | "requiresModeration"> & { size?: number }
  >
) => {
  const rooms = await prisma.room.findMany({
    where: {
      // enableModes: filters?.enableModes,
      isDefault: filters?.isDefault,
      requiresModeration: filters?.requiresModeration,
    },
    take: filters?.size ?? undefined,
  });
  return rooms;
};

export const getRoomById = async (id: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });
  return room;
};

export const createRoom = async ({
  enableModes,
  isDefault,
  requiresModeration,
}: Pick<IRoom, "enableModes" | "isDefault" | "requiresModeration">) => {
  const room = await prisma.room.create({
    data: {
      enableModes,
      isDefault,
      requiresModeration,
    },
  });
  return room;
};

export const createDefaultRoom = async () => {
  const room = await prisma.room.create({
    data: {
      enableModes: [RoomMode.VIDEO],
      isDefault: true,
      requiresModeration: true,
    },
  });
  return room;
};

export const updateRoom = async (
  id: string,
  {
    enableModes,
    isDefault,
    requiresModeration,
  }: Pick<IRoom, "enableModes" | "isDefault" | "requiresModeration">
) => {
  const room = await prisma.room.update({
    where: { id },
    data: {
      enableModes,
      isDefault,
      requiresModeration,
    },
  });
  return room;
};

export const deleteRoom = async (id: string) => {
  const room = await prisma.room.delete({
    where: { id },
  });
  return room;
};
