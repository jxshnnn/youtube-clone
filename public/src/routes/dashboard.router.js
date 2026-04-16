import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJwT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwT); // all dashboard routes are protected

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;


// ─── Mount in app.js ──────────────────────────────────────────────────────────

// import dashboardRouter from "./routes/dashboard.routes.js";
// app.use("/api/v1/dashboard", dashboardRouter);