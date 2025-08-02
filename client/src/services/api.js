import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  setApiKey(apiKey) {
    if (apiKey) {
      this.client.defaults.headers["apikey"] = apiKey;
    } else {
      delete this.client.defaults.headers["apikey"];
    }
  }

  // Actor endpoints
  async getActors() {
    const response = await this.client.get("/apify/actors");
    return response.data;
  }

  async getActorSchema(actorId) {
    const response = await this.client.get(`/apify/actors/${actorId}/schema`);
    return response.data;
  }

  async runActor(actorId, input) {
    const response = await this.client.post(
      `/apify/actors/${actorId}/run`,
      {
        input,
      },
      {
        timeout: 120000, // 2 minutes for actor runs
      }
    );
    return response.data;
  }

  async getRunStatus(runId) {
    const response = await this.client.get(`/apify/runs/${runId}/status`);
    return response.data;
  }

  async getRunResults(runId) {
    const response = await this.client.get(`/apify/runs/${runId}/results`);
    return response.data;
  }

  async getRunLogs(runId) {
    const response = await this.client.get(`/apify/runs/${runId}/logs`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get("/health");
    return response.data;
  }
}

export const apiService = new ApiService();
