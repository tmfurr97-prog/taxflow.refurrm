import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 rounded-lg border-2 border-gray-200 bg-white shadow-lg">
        <h1 className="text-6xl font-bold mb-4 text-blue-600">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page not found</p>
        <p className="text-sm text-gray-500 mb-6">Redirecting to home in 3 seconds...</p>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home Now
        </button>
      </div>
    </div>
  );
};

export default NotFound;
