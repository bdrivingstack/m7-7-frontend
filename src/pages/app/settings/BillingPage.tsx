import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

const plans = [
  { id:"micro",    name:"Micro",    price:9,   users:1,   features:["Factures illimitées","1 utilisateur","5 Go stockage","Support email"] },
  { id:"pro",      name:"Pro",      price:29,  users:10,  features:["Tout Micro","10 utilisateurs","IA intégrée","API access","50 Go stockage"] },
  { id:"business", name:"Business", price:79,  users:50,  features:["Tout Pro","50 utilisateurs","SSO / SAML","Intégrations premium","200 Go stockage"] },
  { id:"expert",   name:"Expert",   price:null,users:999, features:["Tout Business","Utilisateurs illimités","SLA garanti","Account manager dédié"] },
];

const planNames: Record<string, string> = {
  MICRO: "Micro", PRO: "Pro", BUSINESS: "Business", EXPERT: "Expert",
};

export default function BillingPage() {
  const { data: orgData, loading } = useApi<any>("/api/settings/org");
  const org = orgData?.data;
  const currentPlan = org?.plan ?? "PRO";
  const trialEnds   = org?.trialEnds;

  return (
    <motion.div className="p-6 space-y-6 max-w-3xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">Facturation</h1>
        <p className="text-sm text-muted-foreground">Gérez votre abonnement et vos paiements</p>
      </div>

      {/* Plan actuel */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">Plan {planNames[currentPlan] ?? currentPlan}</p>
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Actif</Badge>
                    </div>
                    {trialEnds ? (
                      <p className="text-sm text-warning">Période d'essai — expire le {new Date(trialEnds).toLocaleDateString("fr-FR")}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Abonnement actif</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs"
                    onClick={() => toast({ title: "Bientôt disponible", description: "La gestion de l'abonnement via portail Stripe sera disponible prochainement." })}>
                    Gérer
                  </Button>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs"
                    onClick={() => toast({ title: "Bientôt disponible", description: "Le changement de plan sera disponible prochainement." })}>
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />Upgrader
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map((plan) => {
          const isCurrent = plan.id.toUpperCase() === currentPlan;
          return (
            <Card key={plan.id} className={`relative ${isCurrent ? "border-primary/40" : "border-border/60"}`}>
              {isCurrent && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] gradient-primary text-primary-foreground px-2 py-0.5 rounded-full">Actuel</div>
              )}
              <CardContent className="p-4">
                <p className="font-semibold text-sm">{plan.name}</p>
                <p className="text-2xl font-display font-bold mt-1">
                  {plan.price ? `${plan.price}€` : "Sur mesure"}
                  {plan.price && <span className="text-xs font-normal text-muted-foreground">/mois</span>}
                </p>
                <p className="text-[10px] text-muted-foreground mb-3">{plan.users === 999 ? "Illimité" : `${plan.users}`} utilisateurs</p>
                <div className="space-y-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <CheckCircle className="h-2.5 w-2.5 text-success flex-shrink-0 mt-0.5" />{f}
                    </div>
                  ))}
                </div>
                {!isCurrent && (
                  <Button size="sm" variant={plan.price ? "default" : "outline"}
                    className={`w-full mt-3 text-xs h-7 ${plan.price ? "gradient-primary text-primary-foreground" : ""}`}
                    onClick={() => toast({ title: "Bientôt disponible", description: "Le changement de plan sera disponible prochainement." })}>
                    {plan.price ? "Choisir" : "Contacter"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Moyen de paiement */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />Moyen de paiement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <CreditCard className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Aucun moyen de paiement enregistré.</p>
            <Button variant="outline" size="sm" className="text-xs"
              onClick={() => toast({ title: "Bientôt disponible", description: "L'ajout d'une carte de paiement sera disponible prochainement." })}>
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />Ajouter une carte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique factures */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Historique de facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <Zap className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">Aucune facture d'abonnement disponible.</p>
            <p className="text-[10px] text-muted-foreground">L'historique de facturation apparaîtra ici une fois votre abonnement activé.</p>
          </div>
        </CardContent>
      </Card>

      {/* Cancel */}
      <Card className="border-destructive/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Résilier l'abonnement</p>
            <p className="text-xs text-muted-foreground">Votre accès restera actif jusqu'à la fin de la période en cours.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/40"
            onClick={() => toast({ title: "Contactez le support", description: "Pour résilier, contactez support@m7app.fr", variant: "destructive" })}>
            Résilier
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
