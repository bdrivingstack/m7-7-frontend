import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { accountingCategories } from "@/lib/accounting-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "@/hooks/use-toast";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function CategoriesPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;

  const revenueCats = isDemo ? accountingCategories.filter(c => c.type === "revenue") : [];
  const expenseCats = isDemo ? accountingCategories.filter(c => c.type === "expense") : [];

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Catégories comptables</h1>
          <p className="text-sm text-muted-foreground">Organisez vos transactions par catégorie</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground"
          onClick={() => toast({ title: "Bientôt disponible", description: "La gestion des catégories sera disponible prochainement." })}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle catégorie
        </Button>
      </div>

      {!isDemo && (
        <p className="text-xs text-muted-foreground">
          Aucune catégorie configurée. Les catégories comptables seront créées automatiquement lors de l'import de vos premières transactions bancaires.
        </p>
      )}

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Recettes ({revenueCats.length})</TabsTrigger>
          <TabsTrigger value="expense">Dépenses ({expenseCats.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Répartition par catégorie de recettes</CardTitle>
                <InfoTooltip title="Répartition par catégorie de recettes" description="CA généré par catégorie." benefit="Identifiez vos activités les plus rentables." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                {revenueCats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueCats} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}k€`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="hsl(250 75% 57%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            {revenueCats.map(cat => (
              <CategoryRow key={cat.id} cat={cat} type="revenue" />
            ))}
            {revenueCats.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucune catégorie de recettes</p>
                  <p className="text-xs mt-1">Les catégories seront créées automatiquement à l'import.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Répartition par catégorie de dépenses</CardTitle>
                <InfoTooltip title="Répartition par catégorie de dépenses" description="Charges par poste." benefit="Repérez les postes disproportionnés." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                {expenseCats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCats} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}k€`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="hsl(0 72% 55% / 0.6)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            {expenseCats.map(cat => (
              <CategoryRow key={cat.id} cat={cat} type="expense" />
            ))}
            {expenseCats.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Aucune catégorie de dépenses</p>
                  <p className="text-xs mt-1">Les catégories seront créées automatiquement à l'import.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function CategoryRow({ cat, type }: { cat: typeof accountingCategories[0]; type: "revenue" | "expense" }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
            {type === "revenue" ? (
              <ArrowUpRight className="h-4 w-4" style={{ color: cat.color }} />
            ) : (
              <ArrowDownRight className="h-4 w-4" style={{ color: cat.color }} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{cat.name}</p>
            <p className="text-[10px] text-muted-foreground">{cat.count} transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${type === "revenue" ? "text-success" : ""}`}>{fmt(cat.total)}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
