import { Request, Response, NextFunction } from "express";
import * as commentService from "../service/commentService";
import * as roomService from "../service/roomService";
import { RoomMode, CommentStatus, UserRole } from "../types";
import fs from "fs/promises";
import path from "path";
import { uploadFileAndGetUrl } from "../utils";
// import { sendWSMessage } from "../websocket";
import { CommentType, WebSocketActionType } from "@instasync/shared";
import { pubWSMessage } from "@/config/redis";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userId,
      status,
      type,
      hidden,
      size,
      sortBy = "createdAt:asc",
    } = req.query;

    const filters = {
      ...(userId !== undefined && { userId: userId as string }),
      ...(status !== undefined && { status: status as CommentStatus }),
      ...(type !== undefined && { type: type as RoomMode }),
      ...(hidden !== undefined && { hidden: hidden === "true" }),
      ...(size !== undefined && { size: Number(size) }),
    };

    const comments = await commentService.getAllComments(filters);

    if (sortBy) {
      const [field, order] = (sortBy as string).split(":");
      comments.sort((a, b) => {
        const aValue =
          field === "createdAt" ? a.createdAt.getTime() : a.updatedAt.getTime();
        const bValue =
          field === "createdAt" ? b.createdAt.getTime() : b.updatedAt.getTime();
        if (order === "asc") {
          return aValue - bValue;
        } else if (order === "desc") {
          return bValue - aValue;
        } else {
          return 0;
        }
      });
    }

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const getCommentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roomId, content, type, status, color } = req.body;
    let photoUrl = "";
    const defaultRooms = await roomService.getAllRooms({ isDefault: true });

    if (req.file) {
      photoUrl = await uploadFileAndGetUrl(req.file, "photo-wall/original");
    }

    // Create comment
    const createdComment = await commentService.createComment({
      userId,
      roomId,
      content,
      photoUrl,
      type,
      color,
      // status: CommentStatus.APPROVED,
      status:
        status ||
        (type === RoomMode.PHOTO && defaultRooms[0].requiresModeration
          ? CommentStatus.PENDING
          : CommentStatus.APPROVED),
    });

    pubWSMessage(
      {
        type: WebSocketActionType.ADD_COMMENT,
        data: {
          id: createdComment.id,
          type: createdComment.type as CommentType,
          userId: createdComment.userId,
          username: createdComment.user.name,
          content: createdComment.content,
          photoUrl: createdComment.photoUrl || "",
          hidden: createdComment.hidden,
          color: createdComment.color,
          timestamp: Date.now(),
        },
      },
      createdComment.type === CommentType.PHOTO ? UserRole.ADMIN : null
    );

    res.status(201).json(createdComment);
  } catch (error) {
    // If there's an error and a file was uploaded, attempt to delete it
    if (req.file) {
      try {
        await fs.unlink(path.join(process.cwd(), req.file.path));
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }
    next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const commentId = req.params.id;
    const comment = await commentService.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const updatedComment = await commentService.updateComment(
      commentId,
      req.body
    );

    if (comment.hidden !== updatedComment.hidden) {
      pubWSMessage({
        type: WebSocketActionType.HIDE_SHOW_COMMENT,
        data: {
          id: updatedComment.id,
          type: updatedComment.type as CommentType,
          hidden: updatedComment.hidden,
        },
      });
    }

    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await commentService.deleteComment(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
