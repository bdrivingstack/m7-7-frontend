import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Filter, ArrowUpRight, ArrowDownRight, AlertCircle,
  CheckCircle, Bot, Tag, Landmark, Calendar, Download,
} from "lucide-react";
import { bankTransactions } from "@/lib/accounting-data";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type TxFilter = "all" | "uncategorized" | "credit" | "debit";

export default function TransactionsPage() {
  const [filter, setFilter] = useState<TxFilter>("all");

  const filtered = bankTransactions.filter(tx => {
    if (filter === "uncategorized") return !tx.categorized;
    if (filter === "credit") return tx.type === "credit";
    if (filter === "debit") return tx.type === "debit";
    return true;
  });

  const uncategorizedCount = bankTransactions.filter(t => !t.categorized).length;
  const totalCredit = bankTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = bankTransactions.filter(t => t.type === "debit").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">Suivi et catégorisation de vos mouvements bancaires</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Bot className="h-3.5 w-3.5 mr-1.5" />Catégoriser tout (IA)</Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total entrées</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
            </div>
            <p className="text-lg font-display font-bold text-success">{fmt(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total sorties</span>
              <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
            </div>
            <p className="text-lg font-display font-bold text-destructive">{fmt(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Solde net</span>
            </div>
            <p className="text-lg font-display font-bold">{fmt(totalCredit - totalDebit)}</p>
          </CardContent>
        </Card>
        <Card className={uncategorizedCount > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Non catégorisées</span>
              <AlertCircle className="h-3.5 w-3.5 text-warning" />
            </div>
            <p className={`text-lg font-display font-bold ${uncategorizedCount > 0 ? "text-warning" : "text-success"}`}>{uncategorizedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une transaction..." className="pl-9 h-8 text-sm" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "uncategorized", "credit", "debit"] as TxFilter[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 ${filter === f ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" && "Tout"}
              {f === "uncategorized" && `Non catégorisées (${uncategorizedCount})`}
              {f === "credit" && "Entrées"}
              {f === "debit" && "Sorties"}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-3.5 hover:bg-muted/20 transition-colors">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === "credit" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  {tx.type === "credit" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{tx.label}</p>
                    {tx.matched && (
                      <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                    )}
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
                  <span className={`text-sm font-semibold min-w-[80px] text-right ${
                    tx.type === "credit" ? "text-success" : "text-foreground"
                  }`}>
                    {tx.type === "credit" ? "+" : ""}{fmt(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
