import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">M7Sept</h1>
        <Button className="w-full gradient-primary text-primary-foreground"
          onClick={() => navigate("/app/dashboard")}>
          👀 Accéder à l'espace démo
        </Button>
      </div>
    </div>
  );
}