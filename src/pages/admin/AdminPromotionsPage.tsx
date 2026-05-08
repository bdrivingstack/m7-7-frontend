import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreHorizontal, Tag, Percent, Euro, Calendar, Users,
  TrendingDown, AlertTriangle, Copy, Edit, Trash2, ToggleLeft,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type DiscountType   = "percentage" | "fixed";
type TargetPlan     = "all" | "micro" | "pro" | "business" | "expert";
type TargetClient   = "all" | "micro_entrepreneur" | "tpe" | "pme" | "cabinet";

interface Promotion {
  id:           string;
  name:         string;
  code:         string;
  type:         DiscountType;
  value:        number;
  refPrice:     number;   // prix de référence DGCCRF (plus bas prix 30j précédents)
  startDate:    string;
  endDate:      string;
  maxUses:      number | null;
  usedCount:    number;
  targetPlan:   TargetPlan;
  targetClient: TargetClient;
  active:       boolean;
  stripeId?:    string;
}

// ─── Données mock ─────────────────────────────────────────────────────────────

const initialPromos: Promotion[] = [
  {
    id: "PROMO001",
    name: "Lancement été 2025",
    code: "ETE25",
    type: "percentage",
    value: 30,
    refPrice: 29,
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    maxUses: 200,
    usedCount: 87,
    targetPlan: "pro",
    targetClient: "all",
    active: true,
    stripeId: "promo_abc123",
  },
  {
    id: "PROMO002",
    name: "Micro-entrepreneurs Q3",
    code: "MICRO30",
    type: "fixed",
    value: 3,
    refPrice: 9,
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    maxUses: 500,
    usedCount: 241,
    targetPlan: "micro",
    targetClient: "micro_entrepreneur",
    active: true,
    stripeId: "promo_def456",
  },
  {
    id: "PROMO003",
    name: "Cabinets comptables",
    code: "CAB2025",
    type: "percentage",
    value: 20,
    refPrice: 79,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    maxUses: null,
    usedCount: 34,
    targetPlan: "business",
    targetClient: "cabinet",
    active: false,
    stripeId: "promo_ghi789",
  },
];

const emptyPromo: Omit<Promotion, "id" | "usedCount" | "stripeId"> = {
  name: "", code: "", type: "percentage", value: 10, refPrice: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  maxUses: null,
  targetPlan: "all", targetClient: "all",
  active: true,
};

const planLabels: Record<TargetPlan,   string> = { all: "Tous les plans", micro: "Micro", pro: "Pro", business: "Business", expert: "Expert" };
const clientLabels: Record<TargetClient, string> = { all: "Tous", micro_entrepreneur: "Micro-entrepreneur", tpe: "TPE", pme: "PME", cabinet: "Cabinet comptable" };

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminPromotionsPage() {
  const [promos,      setPromos]      = useState<Promotion[]>(initialPromos);
  const [showModal,   setShowModal]   = useState(false);
  const [editPromo,   setEditPromo]   = useState<Partial<Promotion> & typeof emptyPromo>(emptyPromo as any);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);

  // KPIs
  const activePromos  = promos.filter((p) => p.active).length;
  const totalUses     = promos.reduce((s, p) => s + p.usedCount, 0);
  const estimatedSavings = promos.reduce((s, p) => {
    if (p.type === "percentage") return s + (p.refPrice * (p.value / 100) * p.usedCount);
    return s + (p.value * p.usedCount);
  }, 0);

  const openCreate = () => {
    setEditingId(null);
    setEditPromo({ ...emptyPromo } as any);
    setShowModal(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setEditPromo({ ...p });
    setShowModal(true);
  };

  const handleToggle = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => p.id === id ? { ...p, active: !p.active } : p)
    );
    const promo = promos.find((p) => p.id === id);
    toast({ title: promo?.active ? "Promotion désactivée" : "Promotion activée", description: promo?.name });
  };

  const handleDelete = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Promotion supprimée", description: "La promotion a été retirée." });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copié", description: `"${code}" copié dans le presse-papiers.` });
  };

  const handleSave = async () => {
    if (!editPromo.name || !editPromo.code || !editPromo.value || !editPromo.endDate) {
      toast({ title: "Champs manquants", description: "Remplissez tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    if (editPromo.refPrice === 0) {
      toast({ title: "Prix de référence manquant", description: "Requis par la réglementation DGCCRF.", variant: "destructive" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // Simule appel API POST /api/promotions

    if (editingId) {
      setPromos((prev) => prev.map((p) => p.id === editingId ? { ...p, ...editPromo } as Promotion : p));
      toast({ title: "Promotion mise à jour", description: editPromo.name });
    } else {
      const newPromo: Promotion = {
        ...editPromo as any,
        id: `PROMO${Date.now()}`,
        usedCount: 0,
      };
      setPromos((prev) => [newPromo, ...prev]);
      toast({ title: "Promotion créée", description: `Code "${editPromo.code}" actif.` });
    }
    setSaving(false);
    setShowModal(false);
  };

  const discountDisplay = (p: Promotion) =>
    p.type === "percentage" ? `-${p.value}%` : `-${p.value}€`;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Promotions & Codes promo</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les offres de réduction et leurs conditions d'application.
          </p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle promotion
        </Button>
      </div>

      {/* Alerte DGCCRF */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Conformité DGCCRF — Réglementation française sur les prix barrés</p>
          <p>
            Toute annonce de réduction doit afficher le <strong>prix de référence</strong>, défini comme le prix
            le plus bas pratiqué dans les <strong>30 jours précédant la promotion</strong> (Art. L112-1-1 Code de la consommation).
            La durée de la promotion doit être clairement indiquée.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Promotions actives</p>
              <p className="text-2xl font-display font-bold">{activePromos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilisations totales</p>
              <p className="text-2xl font-display font-bold">{totalUses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remises accordées</p>
              <p className="text-2xl font-display font-bold">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(estimatedSavings)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Toutes les promotions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom / Code</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Prix réf.</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((p) => {
                const usagePct = p.maxUses ? Math.round((p.usedCount / p.maxUses) * 100) : null;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.code}</code>
                          <button onClick={() => handleCopyCode(p.code)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-success/10 text-success font-mono">
                        {discountDisplay(p)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{p.refPrice}€/mois</span>
                      <p className="text-[10px] text-muted-foreground">prix réf. 30j</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div>{new Date(p.startDate).toLocaleDateString("fr-FR")}</div>
                      <div className="text-muted-foreground">→ {new Date(p.endDate).toLocaleDateString("fr-FR")}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p>{planLabels[p.targetPlan]}</p>
                        <p className="text-muted-foreground">{clientLabels[p.targetClient]}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="font-medium">{p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : " / ∞"}</p>
                        {usagePct !== null && (
                          <div className="mt-1 h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePct > 80 ? "bg-warning" : "gradient-primary"}`}
                              style={{ width: `${Math.min(usagePct, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.active}
                          onCheckedChange={() => handleToggle(p.id)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">{p.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Edit className="h-3.5 w-3.5 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyCode(p.code)}>
                            <Copy className="h-3.5 w-3.5 mr-2" />Copier le code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(p.id)}>
                            <ToggleLeft className="h-3.5 w-3.5 mr-2" />
                            {p.active ? "Désactiver" : "Activer"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" />Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Créer / Modifier */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la promotion" : "Nouvelle promotion"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom *</Label>
                <Input
                  placeholder="Ex: Lancement été 2025"
                  value={editPromo.name ?? ""}
                  onChange={(e) => setEditPromo((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Code promo *</Label>
                <Input
                  placeholder="ETE25"
                  value={editPromo.code ?? ""}
                  onChange={(e) => setEditPromo((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Type de réduction *</Label>
                <Select
                  value={editPromo.type}
                  onValueChange={(v) => setEditPromo((p) => ({ ...p, type: v as DiscountType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage"><Percent className="h-3.5 w-3.5 inline mr-1.5" />Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed"><Euro className="h-3.5 w-3.5 inline mr-1.5" />Montant fixe (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Valeur * {editPromo.type === "percentage" ? "(%)" : "(€/mois)"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={editPromo.type === "percentage" ? 100 : undefined}
                  value={editPromo.value ?? ""}
                  onChange={(e) => setEditPromo((p) => ({ ...p, value: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Prix de référence DGCCRF */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Prix de référence DGCCRF * (€/mois)
              </Label>
              <Input
                type="number"
                min={0}
                placeholder="Prix le plus bas des 30 derniers jours"
                value={editPromo.refPrice || ""}
                onChange={(e) => setEditPromo((p) => ({ ...p, refPrice: Number(e.target.value) }))}
              />
              <p className="text-[10px] text-muted-foreground">
                Requis par la loi : prix le plus bas pratiqué dans les 30 jours précédant la promotion.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Date de début *</Label>
                <Input
                  type="date"
                  value={editPromo.startDate ?? ""}
                  onChange={(e) => setEditPromo((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Date de fin *</Label>
                <Input
                  type="date"
                  value={editPromo.endDate ?? ""}
                  onChange={(e) => setEditPromo((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Plan cible</Label>
                <Select
                  value={editPromo.targetPlan}
                  onValueChange={(v) => setEditPromo((p) => ({ ...p, targetPlan: v as TargetPlan }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(planLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type client</Label>
                <Select
                  value={editPromo.targetClient}
                  onValueChange={(v) => setEditPromo((p) => ({ ...p, targetClient: v as TargetClient }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(clientLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Utilisations max (vide = illimité)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Ex: 500 — laissez vide pour illimité"
                value={editPromo.maxUses ?? ""}
                onChange={(e) => setEditPromo((p) => ({ ...p, maxUses: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editPromo.active ?? true}
                onCheckedChange={(v) => setEditPromo((p) => ({ ...p, active: v }))}
              />
              <Label className="text-xs">Promotion active dès la création</Label>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-[10px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-xs">Intégration Stripe</p>
              <p>Après création, la promotion sera synchronisée avec Stripe via l'API <code>/api/promotions</code>. Le code sera utilisable au checkout. La réduction sera appliquée automatiquement aux abonnements Stripe concernés.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer la promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
