import prisma from "../config/prisma";
import { IComment } from "../types";

export const getAllComments = async (
  filters?: Partial<
    Pick<IComment, "userId" | "status" | "hidden" | "type"> & {
      size?: number;
      orderBy?: string;
    }
  >
) => {
  const comments = await prisma.comment.findMany({
    where: {
      userId: filters?.userId,
      status: filters?.status,
      hidden: filters?.hidden,
      type: filters?.type,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: filters?.size,
  });
  return comments;
};

export const getCommentById = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });
  return comment;
};

export const createComment = async (
  commentData: Pick<
    IComment,
    "userId" | "roomId" | "content" | "photoUrl" | "type" | "status"
  >
) => {
  const newComment = await prisma.comment.create({
    data: commentData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });
  return newComment;
};

export const updateComment = async (
  id: string,
  commentData: Pick<
    IComment,
    "userId" | "content" | "photoUrl" | "type" | "status" | "hidden"
  >
) => {
  const updatedComment = await prisma.comment.update({
    where: { id },
    data: commentData,
  });
  return updatedComment;
};

export const deleteComment = async (id: string) => {
  await prisma.comment.delete({
    where: { id },
  });
};
