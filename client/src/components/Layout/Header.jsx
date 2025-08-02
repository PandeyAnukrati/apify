import { Link, useLocation } from "react-router-dom";
import { useApiKey } from "../../context/ApiKeyContext";
import { LogOut, Key } from "lucide-react";

const Header = () => {
  const { isAuthenticated, clearApiKey } = useApiKey();
  const location = useLocation();

  const handleLogout = () => {
    clearApiKey();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Apify Integration
            </Link>

            {isAuthenticated && (
              <nav className="flex items-center space-x-6">
                <Link
                  to="/actors"
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                    location.pathname.startsWith("/actors")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  Actors
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center">
            {!isAuthenticated && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md">
                <Key size={16} />
                <span>Not authenticated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
