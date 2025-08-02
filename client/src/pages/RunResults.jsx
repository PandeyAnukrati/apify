import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiKey } from "../context/ApiKeyContext";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Copy,
} from "lucide-react";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import toast from "react-hot-toast";

const RunResults = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { apiKey, isAuthenticated } = useApiKey();

  const [runStatus, setRunStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    fetchRunStatus();
  }, [runId, isAuthenticated, navigate]);

  useEffect(() => {
    let interval;

    if (
      autoRefresh &&
      runStatus?.status &&
      !["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(
        runStatus.status
      )
    ) {
      interval = setInterval(() => {
        fetchRunStatus();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, runStatus?.status]);

  const fetchRunStatus = async () => {
    try {
      setError("");

      apiService.setApiKey(apiKey);
      const response = await apiService.getRunStatus(runId);

      setRunStatus(response.data);

      // If run is completed, fetch results
      if (response.data.status === "SUCCEEDED") {
        setAutoRefresh(false);
        if (!results) {
          fetchResults();
        }
      } else if (
        ["FAILED", "ABORTED", "TIMED-OUT"].includes(response.data.status)
      ) {
        setAutoRefresh(false);
        // Automatically fetch logs for failed runs
        if (response.data.status === "FAILED" && !logs) {
          fetchLogs();
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch run status";
      setError(errorMessage);
      setAutoRefresh(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);

      apiService.setApiKey(apiKey);
      const response = await apiService.getRunResults(runId);

      setResults(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch run results";
      toast.error(errorMessage);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);

      apiService.setApiKey(apiKey);
      const response = await apiService.getRunLogs(runId);

      setLogs(response.data);
      setShowLogs(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch run logs";
      toast.error(errorMessage);
    } finally {
      setLoadingLogs(false);
    }
  };

  const copyLogs = async () => {
    try {
      const logText =
        typeof logs === "string" ? logs : JSON.stringify(logs, null, 2);
      await navigator.clipboard.writeText(logText);
      toast.success("Logs copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy logs");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "FAILED":
      case "ABORTED":
      case "TIMED-OUT":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "RUNNING":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCEEDED":
        return "bg-green-100 text-green-800";
      case "FAILED":
      case "ABORTED":
      case "TIMED-OUT":
        return "bg-red-100 text-red-800";
      case "RUNNING":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt, finishedAt) => {
    if (!startedAt) return "N/A";

    const start = new Date(startedAt);
    const end = finishedAt ? new Date(finishedAt) : new Date();
    const duration = Math.round((end - start) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600)
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor(
      (duration % 3600) / 60
    )}m`;
  };

  const downloadResults = () => {
    if (!results?.items) return;

    const dataStr = JSON.stringify(results.items, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `apify-run-${runId}-results.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/actors")}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Actors</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Run Results</h1>
        <p className="text-gray-600">Run ID: {runId}</p>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {/* Run Status */}
      {runStatus && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Run Status</h2>
            <button
              onClick={fetchRunStatus}
              disabled={loading}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-2">
                {getStatusIcon(runStatus.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    runStatus.status
                  )}`}
                >
                  {runStatus.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Started
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(runStatus.startedAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finished
              </label>
              <p className="text-sm text-gray-900">
                {formatDate(runStatus.finishedAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <p className="text-sm text-gray-900">
                {formatDuration(runStatus.startedAt, runStatus.finishedAt)}
              </p>
            </div>
          </div>

          {runStatus.stats && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Statistics
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {runStatus.stats.inputBodyLen && (
                  <div>
                    <span className="text-gray-600">Input Size:</span>
                    <span className="ml-2 font-medium">
                      {runStatus.stats.inputBodyLen} bytes
                    </span>
                  </div>
                )}
                {runStatus.stats.resurrectCount !== undefined && (
                  <div>
                    <span className="text-gray-600">Resurrections:</span>
                    <span className="ml-2 font-medium">
                      {runStatus.stats.resurrectCount}
                    </span>
                  </div>
                )}
                {runStatus.stats.restartCount !== undefined && (
                  <div>
                    <span className="text-gray-600">Restarts:</span>
                    <span className="ml-2 font-medium">
                      {runStatus.stats.restartCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {runStatus?.status === "SUCCEEDED" && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="flex space-x-2">
              {!results && (
                <button
                  onClick={fetchResults}
                  disabled={loadingResults}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>Load Results</span>
                </button>
              )}
              {results?.items && results.items.length > 0 && (
                <button
                  onClick={downloadResults}
                  className="btn-primary text-sm flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download JSON</span>
                </button>
              )}
            </div>
          </div>

          {loadingResults ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : results ? (
            <div>
              {results.items && results.items.length > 0 ? (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    Found {results.items.length} result
                    {results.items.length !== 1 ? "s" : ""}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(results.items, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No results found for this run.
                  </p>
                  {results.message && (
                    <p className="text-sm text-gray-400 mt-2">
                      {results.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Click "Load Results" to fetch the run results.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Failed Run Info */}
      {["FAILED", "ABORTED", "TIMED-OUT"].includes(runStatus?.status) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Run Failed</h2>
            {!logs && (
              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>View Logs</span>
              </button>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">
              The actor run {runStatus.status.toLowerCase()}.
              {runStatus.status === "TIMED-OUT" &&
                " The run exceeded the maximum allowed time."}
              {runStatus.status === "FAILED" &&
                " Check the actor logs below for more details."}
              {runStatus.status === "ABORTED" &&
                " The run was manually stopped."}
            </p>
          </div>

          {/* Logs Section */}
          {loadingLogs && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}

          {logs && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Actor Logs</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyLogs}
                    className="btn-secondary text-sm flex items-center space-x-2"
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {showLogs ? "Hide" : "Show"} Logs
                  </button>
                </div>
              </div>

              {showLogs && (
                <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-medium">
                      Actor Execution Logs
                    </span>
                    <span className="text-xs text-gray-400">
                      Scroll to view all content
                    </span>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto overflow-x-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono break-all leading-tight">
                      {typeof logs === "string"
                        ? logs.length > 5000
                          ? logs.substring(0, 5000) +
                            "\n\n... (truncated, use Copy button for full logs)"
                          : logs
                        : JSON.stringify(logs, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Running Status */}
      {runStatus?.status === "RUNNING" && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <h2 className="text-xl font-semibold">Actor is Running</h2>
          </div>
          <p className="text-gray-600 mb-4">
            The actor is currently running. Results will appear here once the
            run completes.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Auto-refreshing every 3 seconds...</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-primary-600 hover:text-primary-700 underline"
            >
              {autoRefresh ? "Stop" : "Start"} auto-refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunResults;
