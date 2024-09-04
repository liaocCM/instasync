import prisma from "@/config/prisma";
import { IUser } from "@/types";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

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
    data: {
      ...userData,
      roles: JSON.stringify(userData.roles || []),
    },
  });

  const token = jwt.sign(
    { userId: newUser.id, roles: JSON.parse(newUser.roles as string) },
    JWT_SECRET,
    { expiresIn: "5d" }
  );

  return { ...newUser, token };
};

export const updateUser = async (
  id: string,
  userData: Pick<IUser, "name" | "profilePicture" | "banned"> & {
    roles?: string[];
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
        roles: userData.roles ? JSON.stringify(userData.roles) : undefined,
      },
    });

    const token = jwt.sign(
      {
        userId: updatedUser.id,
        roles: JSON.parse(updatedUser.roles as string),
      },
      JWT_SECRET,
      { expiresIn: "360d" }
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
