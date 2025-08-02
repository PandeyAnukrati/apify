import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApiKey } from "../context/ApiKeyContext";
import { apiService } from "../services/api";
import { Play, User, Calendar, BarChart3, Search } from "lucide-react";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";

const ActorList = () => {
  const { apiKey, isAuthenticated } = useApiKey();
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    fetchActors();
  }, [isAuthenticated, navigate]);

  const fetchActors = async () => {
    try {
      setLoading(true);
      setError("");

      apiService.setApiKey(apiKey);
      const response = await apiService.getActors();

      if (response.success) {
        setActors(response.data.actors || []);
      } else {
        setError("Failed to fetch actors");
      }
    } catch (err) {
      console.error("Error fetching actors:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch actors. Please check your API key."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = actors.filter(
    (actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Actors</h1>
        <p className="text-gray-600">
          Select an actor to view its schema and execute it with custom inputs.
        </p>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {!error && (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search actors by name, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Actor Grid */}
          {filteredActors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No actors found" : "No actors available"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Create some actors in your Apify Console to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActors.map((actor) => (
                <Link
                  key={actor.id}
                  to={`/actors/${actor.id}`}
                  className="card hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {actor.title || actor.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono">
                        {actor.username}/{actor.name}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <Play className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>

                  {actor.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {actor.description}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="flex items-center space-x-1">
                        <User size={12} />
                        <span>{actor.isPublic ? "Public" : "Private"}</span>
                      </div>
                      {actor.stats?.totalRuns && (
                        <div className="flex items-center space-x-1">
                          <BarChart3 size={12} />
                          <span>{actor.stats.totalRuns} runs</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-8">
                      <Calendar size={12} />
                      <span>{formatDate(actor.modifiedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Summary */}
          {filteredActors.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-500">
              Showing {filteredActors.length} of {actors.length} actors
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActorList;
