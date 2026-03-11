import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Landmark, RefreshCw, Plus, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { bankAccounts } from "@/lib/accounting-data";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function BanksPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Comptes bancaires</h1>
          <p className="text-sm text-muted-foreground">Gérez vos connexions bancaires et suivez vos soldes</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Connecter une banque
        </Button>
      </div>

      {/* Total balance */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                Solde total
                <InfoTooltip title="Solde total consolidé" description="Somme des soldes de tous vos comptes bancaires connectés à M7Sept en temps réel." benefit="Cette vue consolidée vous donne une image instantanée de votre trésorerie disponible, tous comptes confondus." />
              </p>
              <p className="text-3xl font-display font-bold">
                {fmt(bankAccounts.reduce((s, a) => s + a.balance, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{bankAccounts.length} comptes connectés</p>
            </div>
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Landmark className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank accounts */}
      <div className="grid gap-3">
        {bankAccounts.map(account => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{account.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{account.bank}</Badge>
                    {account.status === "connected" ? (
                      <Wifi className="h-3 w-3 text-success" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{account.iban}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Dernière sync : {new Date(account.lastSync).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-display font-bold">{fmt(account.balance)}</p>
                  <Badge variant="secondary" className={`text-[10px] ${account.status === "connected" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {account.status === "connected" ? "Connecté" : "Déconnecté"}
                  </Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-[10px]">
                    <RefreshCw className="h-3 w-3 mr-1" />Sync
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]">
                    <ExternalLink className="h-3 w-3 mr-1" />Voir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
            <Landmark className="h-4 w-4 text-info" />
          </div>
          <div>
            <p className="text-sm font-medium">Synchronisation sécurisée</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vos données bancaires sont synchronisées de manière sécurisée via des connexions chiffrées.
              Nous ne stockons jamais vos identifiants bancaires.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
