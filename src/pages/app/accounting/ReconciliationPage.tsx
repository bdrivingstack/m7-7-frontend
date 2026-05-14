import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, XCircle, AlertCircle, GitBranch, Bot,
  ArrowUpRight, ArrowDownRight, Link2, FileText, RefreshCw, Upload,
} from "lucide-react";
import { reconciliationItems, bankTransactions } from "@/lib/accounting-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function ReconciliationPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;

  const reconcItems = isDemo ? reconciliationItems : [];
  const txs         = isDemo ? bankTransactions    : [];
  const matched     = reconcItems.filter(r => r.status === "matched");
  const unmatched   = reconcItems.filter(r => r.status === "unmatched");
  const taux        = reconcItems.length > 0 ? Math.round((matched.length / reconcItems.length) * 100) : 0;

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Rapprochement bancaire</h1>
          <p className="text-sm text-muted-foreground">Associez vos transactions bancaires à vos factures et dépenses</p>
        </div>
        <div className="flex gap-2">
          {isDemo && (
            <>
              <Button variant="outline" size="sm"><Bot className="h-3.5 w-3.5 mr-1.5" />Rapprochement IA</Button>
              <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Synchroniser</Button>
            </>
          )}
          <Button asChild size="sm" className="gradient-primary text-primary-foreground">
            <Link to="/app/accounting/intelligence">
              <Upload className="h-3.5 w-3.5 mr-1.5" />Importer un relevé bancaire
            </Link>
          </Button>
        </div>
      </div>

      {!isDemo && (
        <p className="text-xs text-muted-foreground">
          Aucune transaction importée. Importez vos relevés bancaires CSV via l'Intelligence Comptable. Vos transactions seront catégorisées automatiquement par IA.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rapprochées</span>
              <InfoTooltip title="Transactions rapprochées" description="Mouvements bancaires associés à une facture ou dépense." benefit="Une transaction rapprochée = comptabilité alignée avec le relevé bancaire." />
            </div>
            <p className="text-2xl font-display font-bold text-success">{matched.length}</p>
          </CardContent>
        </Card>
        <Card className={unmatched.length > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">En attente</span>
              <InfoTooltip title="Transactions en attente" description="Mouvements bancaires importés non encore associés." benefit="Rapprochez rapidement pour maintenir une comptabilité fiable." />
            </div>
            <p className="text-2xl font-display font-bold text-warning">{unmatched.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Taux</span>
              <InfoTooltip title="Taux de rapprochement" description="Pourcentage de transactions rapprochées." formula="(Rapprochées ÷ Total) × 100" benefit="100% = comptabilité parfaitement alignée." />
            </div>
            <p className="text-2xl font-display font-bold text-primary">{taux}%</p>
          </CardContent>
        </Card>
      </div>

      {unmatched.length > 0 && (
        <Card className="border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Transactions à rapprocher ({unmatched.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unmatched.map(item => {
              const tx = txs.find(t => t.id === item.transactionId);
              if (!tx) return null;
              return (
                <div key={item.transactionId} className="flex items-center gap-4 p-3 rounded-lg border border-warning/20 bg-warning/5">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {tx.type === "credit" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.label}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString("fr-FR")} · {tx.bankAccount}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "credit" ? "text-success" : ""}`}>
                    {tx.type === "credit" ? "+" : ""}{fmt(tx.amount)}
                  </span>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 text-[10px] gradient-primary text-primary-foreground">
                      <Link2 className="h-3 w-3 mr-1" />Associer
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-[10px]">
                      <Bot className="h-3 w-3 mr-1" />IA
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Transactions rapprochées ({matched.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {matched.map(item => {
            const tx = txs.find(t => t.id === item.transactionId);
            if (!tx) return null;
            return (
              <div key={item.transactionId} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"}`}>
                  {tx.type === "credit" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.label}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px]">
                    <FileText className="h-2.5 w-2.5 mr-1" />{item.invoiceId}
                  </Badge>
                </div>
                <span className={`text-sm font-semibold min-w-[80px] text-right ${tx.type === "credit" ? "text-success" : ""}`}>
                  {tx.type === "credit" ? "+" : ""}{fmt(tx.amount)}
                </span>
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              </div>
            );
          })}
          {matched.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Aucune transaction rapprochée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
