
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber">
      <div className="text-center p-6 bg-cyber-muted rounded-lg border border-cyber-accent/10 max-w-md">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-cyber-alert-high/20 p-3">
            <AlertTriangle className="h-8 w-8 text-cyber-alert-high" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-cyber-foreground">404</h1>
        <p className="text-xl text-cyber-muted-foreground mb-6">Security breach detected. Page not found.</p>
        <Link to="/" className="text-cyber-accent hover:text-cyber-accent/80 underline">
          Return to Secure Zone
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
