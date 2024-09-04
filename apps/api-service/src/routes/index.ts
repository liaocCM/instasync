import { Router, Request, Response } from "express";
import commentRoutes from "./commentRoutes";
import userRoutes from "./userRoutes";
import roomRoutes from "./roomRoutes";

const router = Router();

router.use("/comment", commentRoutes);
router.use("/user", userRoutes);
router.use("/room", roomRoutes);

router.post("/verify", (req: Request, res: Response) => {
  if (req.body?.accessCode === "916088") {
    return res.json(true);
  }
  res.json(false);
});

router.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

export default router;
