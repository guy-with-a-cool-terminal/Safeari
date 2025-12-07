import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeariFullLogo from "@/assets/logofull.svg";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link to="/" className="block transition-transform hover:scale-105 duration-300">
            <img src={SafeariFullLogo} alt="Safeari" className="h-16 sm:h-20 w-auto" />
          </Link>
        </div>

        {/* 404 Message */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-8xl font-bold text-primary/20">404</h1>
            <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
