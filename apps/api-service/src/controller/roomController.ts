import { Request, Response, NextFunction } from "express";
import * as roomService from "../service/roomService";
import { RoomMode } from "../types";
import { WebSocketActionType } from "@instasync/shared";
import { pubWSMessage } from "@/config/redis";

export const getAllRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isDefault, size, requiresModeration } = req.query;
    // enableModes
    const filters = {
      // ...(enableModes !== undefined &&
      //   Object.values(RoomMode).includes(
      //     (enableModes as string).toUpperCase() as RoomMode
      //   ) && {
      //     enableModes: (enableModes as string).toUpperCase() as RoomMode,
      //   }),
      ...(isDefault !== undefined &&
        isDefault !== "" && {
          isDefault: isDefault === "true" || isDefault === "1",
        }),
      ...(requiresModeration !== undefined &&
        requiresModeration !== "" && {
          requiresModeration:
            requiresModeration === "true" || requiresModeration === "1",
        }),
      ...(size !== undefined &&
        !isNaN(Number(size)) && {
          size: Number(size),
        }),
    };

    const rooms = await roomService.getAllRooms(filters);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await roomService.createRoom(req.body);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);

    pubWSMessage({
      type: WebSocketActionType.SET_DISPLAY_MODE,
      data: {
        roomId: room.id,
        enableModes: room.enableModes as RoomMode[],
      },
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await roomService.deleteRoom(req.params.id);
    res.json(room);
  } catch (error) {
    next(error);
  }
};
