import prisma from "@/config/prisma";
import { IRoom, RoomMode } from "@/types";

export const getAllRooms = async (
  filters?: Partial<
    Pick<IRoom, "mode" | "isDefault" | "requiresModeration"> & { size?: number }
  >
) => {
  const rooms = await prisma.room.findMany({
    where: {
      mode: filters?.mode,
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
  mode,
  isDefault,
  requiresModeration,
}: Pick<IRoom, "mode" | "isDefault" | "requiresModeration">) => {
  const room = await prisma.room.create({
    data: {
      mode,
      isDefault,
      requiresModeration,
    },
  });
  return room;
};

export const createDefaultRoom = async () => {
  const room = await prisma.room.create({
    data: {
      mode: RoomMode.VIDEO,
      isDefault: true,
      requiresModeration: true,
    },
  });
  return room;
};

export const updateRoom = async (
  id: string,
  {
    mode,
    isDefault,
    requiresModeration,
  }: Pick<IRoom, "mode" | "isDefault" | "requiresModeration">
) => {
  const room = await prisma.room.update({
    where: { id },
    data: {
      mode,
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
