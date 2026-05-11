import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, CheckCircle, Zap, ArrowUpRight, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  { id:"micro",    name:"Micro",    price:9,   users:1,  features:["Factures illimitées","1 utilisateur","5 Go stockage","Support email"] },
  { id:"pro",      name:"Pro",      price:29,  users:10, features:["Tout Micro","10 utilisateurs","IA intégrée","API access","50 Go stockage"], current:true },
  { id:"business", name:"Business", price:79,  users:50, features:["Tout Pro","50 utilisateurs","SSO / SAML","Intégrations premium","200 Go stockage"] },
  { id:"expert",   name:"Expert",   price:null,users:999,features:["Tout Business","Utilisateurs illimités","SLA garanti","Account manager dédié"] },
];

const invoices = [
  { id:"INV-2024-03", date:"01/03/2024", amount:"29,00 €", status:"Payée" },
  { id:"INV-2024-02", date:"01/02/2024", amount:"29,00 €", status:"Payée" },
  { id:"INV-2024-01", date:"01/01/2024", amount:"29,00 €", status:"Payée" },
];

export default function BillingPage() {
  return (
    <motion.div className="p-6 space-y-6 max-w-3xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">Facturation</h1>
        <p className="text-sm text-muted-foreground">Gérez votre abonnement et vos paiements</p>
      </div>

      {/* Plan actuel */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">Plan Pro</p>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Actif</Badge>
                </div>
                <p className="text-sm text-muted-foreground">29 € / mois · Renouvellement le 01/04/2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">Gérer</Button>
              <Button size="sm" className="gradient-primary text-primary-foreground text-xs">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />Upgrader
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-background/60 rounded-lg p-2.5 text-center">
              <p className="font-bold text-lg">7</p><p className="text-muted-foreground">/ 10 utilisateurs</p>
            </div>
            <div className="bg-background/60 rounded-lg p-2.5 text-center">
              <p className="font-bold text-lg">82%</p><p className="text-muted-foreground">Crédits IA</p>
            </div>
            <div className="bg-background/60 rounded-lg p-2.5 text-center">
              <p className="font-bold text-lg">18 Go</p><p className="text-muted-foreground">/ 50 Go stockage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.current ? "border-primary/40" : "border-border/60"}`}>
            {plan.current && <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] gradient-primary text-primary-foreground px-2 py-0.5 rounded-full">Actuel</div>}
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
              {!plan.current && (
                <Button size="sm" variant={plan.price ? "default" : "outline"}
                  className={`w-full mt-3 text-xs h-7 ${plan.price ? "gradient-primary text-primary-foreground" : ""}`}>
                  {plan.price ? "Choisir" : "Contacter"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Moyen de paiement */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4"/>Moyen de paiement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 rounded bg-gradient-to-r from-blue-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold">VISA</div>
              <div>
                <p className="text-sm font-medium">Visa se terminant par 4242</p>
                <p className="text-xs text-muted-foreground">Expiration : 12/2026</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Principal</Badge>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><CreditCard className="h-3.5 w-3.5 mr-1.5"/>Changer de carte</Button>
        </CardContent>
      </Card>

      {/* Historique factures */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Historique de facturation</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Facture</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
              <th className="text-right p-3 font-medium text-muted-foreground">PDF</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono font-medium">{inv.id}</td>
                  <td className="p-3 text-muted-foreground">{inv.date}</td>
                  <td className="p-3 text-right font-semibold">{inv.amount}</td>
                  <td className="p-3 text-center"><Badge variant="secondary" className="text-[10px] bg-success/10 text-success">{inv.status}</Badge></td>
                  <td className="p-3 text-right"><Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Cancel */}
      <Card className="border-destructive/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Résilier l'abonnement</p>
            <p className="text-xs text-muted-foreground">Votre accès restera actif jusqu'au 01/04/2024.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/40">Résilier</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
