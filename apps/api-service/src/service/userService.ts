import prisma from "@/config/prisma";
import { IUser, UserRole } from "@/types";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "365d";

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const createUser = async (
  userData: Pick<IUser, "name" | "profilePicture" | "banned" | "roles">
) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const newUser = await prisma.user.create({
    data: userData,
  });

  const token = jwt.sign(
    { userId: newUser.id, roles: newUser.roles },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { ...newUser, token };
};

export const updateUser = async (
  id: string,
  userData: Pick<IUser, "name" | "profilePicture" | "banned"> & {
    roles?: UserRole[];
  }
) => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        roles: userData.roles || [],
      },
    });

    const token = jwt.sign(
      {
        userId: updatedUser.id,
        roles: updatedUser.roles,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { ...updatedUser, token };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("User not found");
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });
};
