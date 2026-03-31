import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { myTickets, purchaseTickets, refundTicket, validateTicket } from "../controllers/ticket.controller.js";

const router = express.Router();

router.post("/purchase", requireAuth, purchaseTickets);
router.get("/my", requireAuth, myTickets);
router.post("/:ticketId/refund", requireAuth, refundTicket);
router.post("/validate", requireAuth, validateTicket);

export default router;
