import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function PortalProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("portal_authenticated") === "true";
    setAuthenticated(isAuth);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  return <>{children}</>;
}
