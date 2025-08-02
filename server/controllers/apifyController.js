import { ApifyService } from "../services/apifyService.js";

export class ApifyController {
  static async getActors(req, res, next) {
    try {
      const { apikey } = req.headers;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      const actors = await ApifyService.getActors(apikey);

      res.status(200).json({
        success: true,
        data: actors,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActorSchema(req, res, next) {
    try {
      const { apikey } = req.headers;
      const { actorId } = req.params;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      if (!actorId) {
        return res.status(400).json({
          success: false,
          message: "Actor ID is required",
        });
      }

      const schema = await ApifyService.getActorSchema(apikey, actorId);

      res.status(200).json({
        success: true,
        data: schema,
      });
    } catch (error) {
      next(error);
    }
  }

  static async runActor(req, res, next) {
    try {
      const { apikey } = req.headers;
      const { actorId } = req.params;
      const { input } = req.body;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      if (!actorId) {
        return res.status(400).json({
          success: false,
          message: "Actor ID is required",
        });
      }

      const result = await ApifyService.runActor(apikey, actorId, input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRunStatus(req, res, next) {
    try {
      const { apikey } = req.headers;
      const { runId } = req.params;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      if (!runId) {
        return res.status(400).json({
          success: false,
          message: "Run ID is required",
        });
      }

      const status = await ApifyService.getRunStatus(apikey, runId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRunLogs(req, res, next) {
    try {
      const { apikey } = req.headers;
      const { runId } = req.params;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      if (!runId) {
        return res.status(400).json({
          success: false,
          message: "Run ID is required",
        });
      }

      const logs = await ApifyService.getRunLogs(apikey, runId);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRunResults(req, res, next) {
    try {
      const { apikey } = req.headers;
      const { runId } = req.params;

      if (!apikey) {
        return res.status(400).json({
          success: false,
          message: "API key is required in headers",
        });
      }

      if (!runId) {
        return res.status(400).json({
          success: false,
          message: "Run ID is required",
        });
      }

      const results = await ApifyService.getRunResults(apikey, runId);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
