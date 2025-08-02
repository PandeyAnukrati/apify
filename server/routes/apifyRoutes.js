import express from "express";
import { ApifyController } from "../controllers/apifyController.js";

const router = express.Router();

// Get all actors for the authenticated user
router.get("/actors", ApifyController.getActors);

// Get actor schema by ID
router.get("/actors/:actorId/schema", ApifyController.getActorSchema);

// Run an actor with provided input
router.post("/actors/:actorId/run", ApifyController.runActor);

// Get run status
router.get("/runs/:runId/status", ApifyController.getRunStatus);

// Get run logs
router.get("/runs/:runId/logs", ApifyController.getRunLogs);

// Get run results
router.get("/runs/:runId/results", ApifyController.getRunResults);

export default router;
