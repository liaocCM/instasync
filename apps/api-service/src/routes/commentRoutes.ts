import { Router } from "express";
import * as commentController from "@/controller/commentController";
import uploader from "@/config/multerUploader";

const router = Router();

router
  .route("/")
  .get(commentController.getComments)
  .post(uploader.single("photoFile"), commentController.createComment);

router
  .route("/:id")
  .get(commentController.getCommentById)
  .put(commentController.updateComment)
  .delete(commentController.deleteComment);

export default router;
