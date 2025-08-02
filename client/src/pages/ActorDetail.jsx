import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiKey } from "../context/ApiKeyContext";
import { apiService } from "../services/api";
import { ArrowLeft, Play, User, Calendar, Info } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";
import DynamicForm from "../components/Forms/DynamicForm";

const ActorDetail = () => {
  const { actorId } = useParams();
  const { apiKey, isAuthenticated } = useApiKey();
  const [actor, setActor] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    fetchActorDetails();
  }, [actorId, isAuthenticated, navigate]);

  const fetchActorDetails = async () => {
    try {
      setLoading(true);
      setError("");

      apiService.setApiKey(apiKey);
      const response = await apiService.getActorSchema(actorId);

      if (response.success) {
        setActor(response.data.actor);
        setSchema(response.data.inputSchema);
      } else {
        setError("Failed to fetch actor details");
      }
    } catch (err) {
      console.error("Error fetching actor details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch actor details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRunActor = async (inputData) => {
    try {
      setIsRunning(true);

      apiService.setApiKey(apiKey);
      const response = await apiService.runActor(actorId, inputData);

      if (response.success) {
        const runId = response.data.runId;
        toast.success("Actor started successfully!");

        // Navigate to results page
        navigate(`/runs/${runId}/results`);
      } else {
        toast.error("Failed to start actor");
      }
    } catch (err) {
      console.error("Error running actor:", err);
      toast.error(
        err.response?.data?.message || "Failed to run actor. Please try again."
      );
    } finally {
      setIsRunning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/actors")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Actors</span>
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/actors")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Actors</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {actor?.title || actor?.name}
            </h1>
            <p className="text-gray-600 font-mono text-sm mb-4">
              {actor?.username}/{actor?.name}
            </p>
            {actor?.description && (
              <p className="text-gray-700 mb-4">{actor?.description}</p>
            )}
          </div>
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
            <Play className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        {/* Actor Info */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <User size={16} />
            <span>{actor?.isPublic ? "Public" : "Private"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>Modified {formatDate(actor?.modifiedAt)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Schema Information */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Input Schema
            </h2>
          </div>

          {schema ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 text-lg">
                  {schema.title || "Actor Input"}
                </h3>
                {schema.description && (
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {schema.description}
                  </p>
                )}
              </div>

              {schema.properties &&
              Object.keys(schema.properties).length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 text-base mb-4">
                    Available Fields:
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(schema.properties).map(
                      ([key, property]) => (
                        <div
                          key={key}
                          className="flex justify-between items-start p-4 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-medium text-base text-gray-900">
                                {property.title || key}
                              </span>
                              {schema.required?.includes(key) && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                                  Required
                                </span>
                              )}
                            </div>
                            {property.description && (
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {property.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded font-mono font-medium">
                            {property.type}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No input parameters required</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No schema information available</p>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Play className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Run Actor</h2>
          </div>

          <DynamicForm
            key={`${actorId}-${JSON.stringify(schema)}`}
            schema={schema}
            onSubmit={handleRunActor}
            isSubmitting={isRunning}
            submitButtonText={isRunning ? "Starting Actor..." : "Run Actor"}
          />
        </div>
      </div>
    </div>
  );
};

export default ActorDetail;
