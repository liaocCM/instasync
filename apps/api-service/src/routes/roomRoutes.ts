import { Router } from "express";
import * as roomController from "@/controller/roomController";

const router = Router();

router
  .route("/")
  .get(roomController.getAllRooms)
  .post(roomController.createRoom);

router
  .route("/:id")
  .get(roomController.getRoomById)
  .put(roomController.updateRoom)
  .delete(roomController.deleteRoom);

export default router;
