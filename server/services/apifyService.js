import axios from "axios";

export class ApifyService {
  static baseURL = process.env.APIFY_API_BASE_URL || "https://api.apify.com/v2";

  static createAxiosInstance(apiKey) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 60000, // Increased timeout to 60 seconds
    });
  }

  static async getActors(apiKey) {
    try {
      const api = this.createAxiosInstance(apiKey);
      const response = await api.get("/acts");

      return {
        actors: response.data.data.items.map((actor) => ({
          id: actor.id,
          name: actor.name,
          title: actor.title,
          description: actor.description,
          username: actor.username,
          isPublic: actor.isPublic,
          createdAt: actor.createdAt,
          modifiedAt: actor.modifiedAt,
          stats: actor.stats,
        })),
        total: response.data.data.total,
        count: response.data.data.count,
      };
    } catch (error) {
      console.error(
        "Error fetching actors:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message ||
          "Failed to fetch actors from Apify API"
      );
    }
  }

  static async getActorSchema(apiKey, actorId) {
    try {
      const api = this.createAxiosInstance(apiKey);

      // Get actor details first
      const actorResponse = await api.get(`/acts/${actorId}`);
      const actor = actorResponse.data.data;

      // Get the latest version to fetch input schema
      let inputSchema = null;

      if (actor.versions && actor.versions.length > 0) {
        // Get the latest version
        const latestVersion = actor.versions[0];
        console.log(
          `Fetching schema for actor ${actorId}, version ${latestVersion.versionNumber}`
        );
        const versionResponse = await api.get(
          `/acts/${actorId}/versions/${latestVersion.versionNumber}`
        );

        const versionData = versionResponse.data.data;
        console.log("Version data keys:", Object.keys(versionData));

        // Try different possible locations for input schema
        inputSchema =
          versionData.inputSchema ||
          versionData.input_schema ||
          versionData.sourceFiles?.find((f) => f.name === "INPUT_SCHEMA.json")
            ?.content ||
          null;

        console.log(
          "Input schema fetched:",
          JSON.stringify(inputSchema, null, 2)
        );

        // If still no schema, try to get it from the actor's default run
        if (!inputSchema) {
          console.log("No input schema in version, trying actor default...");
          try {
            // Some actors have input schema in their default configuration
            if (actor.defaultRunOptions?.input) {
              console.log(
                "Found default run options:",
                actor.defaultRunOptions.input
              );
            }
          } catch (e) {
            console.log("No default run options available");
          }
        }
      } else {
        console.log(`No versions found for actor ${actorId}`);
      }

      // If no schema found, create a default one based on actor type
      if (!inputSchema) {
        console.log("Creating fallback schema for actor:", actor.name);

        // Check if this is a web scraper actor
        const isWebScraper =
          actor.name?.toLowerCase().includes("scraper") ||
          actor.title?.toLowerCase().includes("scraper") ||
          actor.description?.toLowerCase().includes("scraper");

        if (isWebScraper) {
          inputSchema = {
            title: "Web Scraper Input",
            type: "object",
            description: "Input configuration for web scraper",
            properties: {
              startUrls: {
                title: "Start URLs",
                type: "array",
                description: "List of URLs to scrape",
                editor: "requestListSources",
                example: [{ url: "https://example.com" }],
              },
              maxRequestsPerCrawl: {
                title: "Max requests per crawl",
                type: "integer",
                description: "Maximum number of pages to crawl",
                default: 100,
                minimum: 1,
              },
              pageFunction: {
                title: "Page function",
                type: "string",
                description: "JavaScript function to extract data from pages",
                editor: "javascript",
                default: `async function pageFunction(context) {
    const { page, request } = context;
    
    const title = await page.title();
    const url = request.url;
    
    return {
        title,
        url,
        timestamp: new Date().toISOString()
    };
}`,
              },
            },
            required: ["startUrls", "pageFunction"],
          };
        } else {
          // Fallback: provide a generic 'url' field for actors that may require it
          inputSchema = {
            title: "Default Input",
            type: "object",
            description: "Fallback input schema for actors with optional fields",
            properties: {
              url: {
                title: "URL",
                type: "string",
                description: "URL to process (optional)",
                example: "https://example.com"
              }
            }
            // No 'required' field, so all fields are optional
          };
        }
      }

      return {
        actor: {
          id: actor.id,
          name: actor.name,
          title: actor.title,
          description: actor.description,
          username: actor.username,
        },
        inputSchema: inputSchema,
      };
    } catch (error) {
      console.error("Error fetching actor schema:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);
      console.error("Actor ID:", actorId);

      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          `Failed to fetch actor schema: ${error.message}`
      );
    }
  }

  static async getRunLogs(apiKey, runId) {
    try {
      const api = this.createAxiosInstance(apiKey);
      const response = await api.get(`/logs/${runId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching run logs:", error.message);
      throw new Error("Failed to fetch run logs");
    }
  }

  static async runActor(apiKey, actorId, input = {}) {
    try {
      const api = this.createAxiosInstance(apiKey);

      // Start the actor run
      const response = await api.post(`/acts/${actorId}/runs`, input, {
        params: {
          waitForFinish: 30, // Wait up to 30 seconds for completion
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      const run = response.data.data;

      return {
        runId: run.id,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats,
        output: run.output,
        defaultDatasetId: run.defaultDatasetId,
      };
    } catch (error) {
      console.error("Error running actor:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);
      console.error("Actor ID:", actorId);
      console.error("Input:", input);

      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          `Failed to run actor: ${error.message}`
      );
    }
  }

  static async getRunStatus(apiKey, runId) {
    try {
      const api = this.createAxiosInstance(apiKey);
      const response = await api.get(`/actor-runs/${runId}`);

      const run = response.data.data;

      return {
        runId: run.id,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        stats: run.stats,
        output: run.output,
        defaultDatasetId: run.defaultDatasetId,
      };
    } catch (error) {
      console.error(
        "Error fetching run status:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message || "Failed to fetch run status"
      );
    }
  }

  static async getRunResults(apiKey, runId) {
    try {
      const api = this.createAxiosInstance(apiKey);

      // First get the run to find the dataset ID
      const runResponse = await api.get(`/actor-runs/${runId}`);
      const run = runResponse.data.data;

      if (!run.defaultDatasetId) {
        return {
          items: [],
          message: "No dataset available for this run",
        };
      }

      // Get the dataset items
      const datasetResponse = await api.get(
        `/datasets/${run.defaultDatasetId}/items`
      );

      return {
        items: datasetResponse.data,
        runInfo: {
          runId: run.id,
          status: run.status,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          stats: run.stats,
        },
      };
    } catch (error) {
      console.error(
        "Error fetching run results:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message || "Failed to fetch run results"
      );
    }
  }
}
