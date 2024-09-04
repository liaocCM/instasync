import express from "express";
import cors from "cors";
import { errorHandler } from "@/middleware/errorHandler";
import routes from "@/routes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
