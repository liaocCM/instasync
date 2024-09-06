import { CommentType } from "@instasync/shared";
import prisma from "../config/prisma";
import { IComment } from "../types";

export const getAllComments = async (
  filters?: Partial<
    Pick<IComment, "userId" | "status" | "hidden" | "type"> & {
      size?: number;
      orderBy?: string;
      isRandom?: boolean;
    }
  >
) => {
  let skip = 0;
  if (filters?.isRandom) {
    const totalCount = await prisma.comment.count();
    skip = Math.max(
      0,
      Math.floor(Math.random() * (totalCount - filters?.size + 1))
    );
  }

  const comments = await prisma.comment.findMany({
    where: {
      userId: filters?.userId,
      status: filters?.status,
      hidden: filters?.hidden,
      type: filters?.type,
    },
    skip,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: filters?.isRandom
      ? {
          id: "asc", // Use a consistent order to avoid duplicates
        }
      : {
          createdAt: "desc",
        },
    take: filters?.size,
  });

  if (filters?.isRandom) {
    return comments.sort(() => Math.random() - 0.5);
  }
  return comments;
};

// export const getRandomComments = async ({
//   size,
//   type,
// }: {
//   size: number;
//   type: CommentType;
// }) => {
//   const totalCount = await prisma.comment.count();
//   const randomSkip = Math.max(
//     0,
//     Math.floor(Math.random() * (totalCount - size + 1))
//   );

//   const comments = await prisma.comment.findMany({
//     take: size,
//     skip: randomSkip,
//     where: {
//       type,
//     },
//     include: {
//       user: {
//         select: {
//           id: true,
//           name: true,
//           profilePicture: true,
//         },
//       },
//     },
//     orderBy: {
//       id: "asc", // Use a consistent order to avoid duplicates
//     },
//   });
//   // Shuffle the results
//   return comments.sort(() => Math.random() - 0.5);
// };

export const getCommentById = async (id: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });
  return comment;
};

export const createComment = async (
  commentData: Pick<
    IComment,
    "userId" | "roomId" | "content" | "photoUrl" | "type" | "status" | "color"
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
    "userId" | "content" | "photoUrl" | "type" | "status" | "hidden" | "color"
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
