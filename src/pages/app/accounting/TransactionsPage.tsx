import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  Search, ArrowUpRight, ArrowDownRight, AlertCircle,
  CheckCircle, Bot, Tag, Download, Upload,
} from "lucide-react";
import { bankTransactions } from "@/lib/accounting-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type TxFilter = "all" | "uncategorized" | "credit" | "debit";

export default function TransactionsPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;
  const [filter, setFilter] = useState<TxFilter>("all");
  const [search, setSearch] = useState("");

  if (!isDemo) {
    return (
      <motion.div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <ArrowUpRight className="h-10 w-10 text-primary/50" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Transactions bancaires</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-2">
          Aucune transaction importée.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          Importez vos relevés bancaires CSV via l'Intelligence Comptable.
          Vos transactions seront catégorisées automatiquement par IA.
        </p>
        <Button asChild size="sm" className="gradient-primary text-primary-foreground">
          <Link to="/app/accounting/intelligence">
            <Upload className="h-3.5 w-3.5 mr-1.5" />Importer un relevé bancaire
          </Link>
        </Button>
      </motion.div>
    );
  }

  const filtered = bankTransactions.filter(tx => {
    if (filter === "uncategorized") return !tx.categorized;
    if (filter === "credit") return tx.type === "credit";
    if (filter === "debit") return tx.type === "debit";
    if (search) {
      const q = search.toLowerCase();
      return tx.label.toLowerCase().includes(q);
    }
    return true;
  });

  const uncategorizedCount = bankTransactions.filter(t => !t.categorized).length;
  const totalCredit = bankTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit  = bankTransactions.filter(t => t.type === "debit").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">Suivi et catégorisation de vos mouvements bancaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Bot className="h-3.5 w-3.5 mr-1.5" />Catégoriser tout (IA)</Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total entrées</span>
                <InfoTooltip title="Total entrées" description="Somme de tous les encaissements sur vos comptes." benefit="Comparez avec votre CA facturé pour détecter des paiements non enregistrés." />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
            </div>
            <p className="text-lg font-display font-bold text-success">{fmt(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total sorties</span>
                <InfoTooltip title="Total sorties" description="Somme de tous les prélèvements et paiements." benefit="Surveillez l'évolution pour anticiper les tensions de trésorerie." />
              </div>
              <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
            </div>
            <p className="text-lg font-display font-bold text-destructive">{fmt(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Solde net</span>
              <InfoTooltip title="Solde net" description="Entrées − Sorties sur la période." formula="Total entrées − Total sorties" benefit="Un solde net positif = plus encaissé que dépensé." />
            </div>
            <p className="text-lg font-display font-bold">{fmt(totalCredit - totalDebit)}</p>
          </CardContent>
        </Card>
        <Card className={uncategorizedCount > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Non catégorisées</span>
                <InfoTooltip title="Non catégorisées" description="Transactions sans catégorie comptable." benefit="Catégorisez pour un résultat comptable fiable." />
              </div>
              <AlertCircle className="h-3.5 w-3.5 text-warning" />
            </div>
            <p className={`text-lg font-display font-bold ${uncategorizedCount > 0 ? "text-warning" : "text-success"}`}>{uncategorizedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une transaction..." className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {(["all", "uncategorized", "credit", "debit"] as TxFilter[]).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${filter === f ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setFilter(f)}>
              {f === "all" && "Tout"}
              {f === "uncategorized" && `Non catégorisées (${uncategorizedCount})`}
              {f === "credit" && "Entrées"}
              {f === "debit" && "Sorties"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-3.5 hover:bg-muted/20 transition-colors">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"}`}>
                  {tx.type === "credit" ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{tx.label}</p>
                    {tx.matched && <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString("fr-FR")}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{tx.bankAccount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {tx.categorized ? (
                    <Badge variant="secondary" className="text-[10px]">
                      <Tag className="h-2.5 w-2.5 mr-1" />{tx.category}
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="h-6 text-[10px] border-warning/30 text-warning hover:bg-warning/10">
                      <Bot className="h-3 w-3 mr-1" />Catégoriser
                    </Button>
                  )}
                  <span className={`text-sm font-semibold min-w-[80px] text-right ${tx.type === "credit" ? "text-success" : "text-foreground"}`}>
                    {tx.type === "credit" ? "+" : ""}{fmt(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <ArrowUpRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Aucune transaction trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
