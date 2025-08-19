import { Router } from "express";
import { conversations } from "../controllers/message.controller";

const router = Router();

router.route("/conversations").get(conversations);

export default router;
