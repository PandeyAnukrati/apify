import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiKey } from "../context/ApiKeyContext";
import { apiService } from "../services/api";
import { Key, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import ErrorMessage from "../components/UI/ErrorMessage";

const Home = () => {
  const { apiKey, isAuthenticated, saveApiKey } = useApiKey();
  const [inputApiKey, setInputApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/actors");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputApiKey.trim()) {
      setError("Please enter your Apify API key");
      return;
    }

    setIsValidating(true);
    setError("");

    try {
      // Set the API key temporarily to test it
      apiService.setApiKey(inputApiKey.trim());

      // Try to fetch actors to validate the key
      await apiService.getActors();

      // If successful, save the key
      saveApiKey(inputApiKey.trim());
      toast.success("API key validated successfully!");
      navigate("/actors");
    } catch (err) {
      console.error("API key validation failed:", err);
      setError(
        err.response?.data?.message ||
          "Invalid API key. Please check your key and try again."
      );
      apiService.setApiKey(null); // Clear the invalid key
    } finally {
      setIsValidating(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col py-4 px-4">
      <div className="max-w-6xl mx-auto flex-1 flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Apify Integration
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
            Enter your Apify API key to get started with actor management and
            execution.
          </p>
        </div>

        {/* Main Content - Left/Right Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start flex-1">
          {/* Left Side - Form */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Get Started
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Apify API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder="apify_api_..."
                  className="input-field"
                  disabled={isValidating}
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can find your API key in your{" "}
                  <a
                    href="https://console.apify.com/account/integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Apify Console
                  </a>
                </p>
              </div>

              {error && (
                <div className="mt-4">
                  <ErrorMessage message={error} />
                </div>
              )}

              <button
                type="submit"
                disabled={isValidating || !inputApiKey.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                {isValidating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Side - Features */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What you can do
            </h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle
                  size={20}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-medium text-gray-900">Browse Actors</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Explore your Apify actors with detailed information and
                    configurations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle
                  size={20}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Dynamic Input Schemas
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View and understand input requirements for each actor
                    automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle
                  size={20}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-medium text-gray-900">Execute Actors</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Run actors with custom inputs through an intuitive
                    interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
