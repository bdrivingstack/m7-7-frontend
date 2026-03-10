import { useLocation } from "react-router-dom";
import { FileText, Clock, CheckCircle } from "lucide-react";

export default function PlaceholderPage() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const title = segments[segments.length - 1]?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Page";

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-display font-bold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-md">
        Ce module est en cours de développement. Il sera bientôt disponible avec toutes les fonctionnalités prévues.
      </p>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>Prochainement</span>
      </div>
    </div>
  );
}
