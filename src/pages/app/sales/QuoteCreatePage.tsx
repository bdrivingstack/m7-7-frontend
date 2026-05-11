import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, Send, Eye, Bot, Copy } from "lucide-react";
import { fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

interface Line {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
}

const emptyLine = (): Line => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unitPrice: 0,
  vatRate: 20,
  discount: 0,
});

export default function QuoteCreatePage() {
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [aiPrompt, setAiPrompt] = useState("");

  const addLine = () => setLines([...lines, emptyLine()]);
  const removeLine = (id: string) => setLines(lines.filter((l) => l.id !== id));
  const updateLine = (id: string, field: keyof Line, value: string | number) =>
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const lineTotal = (l: Line) => {
    const base = l.quantity * l.unitPrice;
    return base - (base * l.discount) / 100;
  };

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const vatTotal = lines.reduce((s, l) => s + (lineTotal(l) * l.vatRate) / 100, 0);
  const total = subtotal + vatTotal;

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/sales/quotes">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-fluid-2xl font-display font-bold">Nouveau devis</h1>
            <p className="text-sm text-muted-foreground">Créez une proposition commerciale</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5 mr-1.5" />Prévisualiser</Button>
          <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5 mr-1.5" />Brouillon</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Send className="h-3.5 w-3.5 mr-1.5" />Envoyer au client
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">

          {/* Client + infos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Informations du devis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Client *</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C001">Acme Corp</SelectItem>
                      <SelectItem value="C002">TechFlow SAS</SelectItem>
                      <SelectItem value="C003">Digital Wave</SelectItem>
                      <SelectItem value="C004">Studio Créatif</SelectItem>
                      <SelectItem value="C005">Green Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Numéro</Label>
                  <Input className="mt-1" value="D-2024-032" readOnly />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Date d'émission</Label>
                  <Input type="date" className="mt-1" defaultValue="2024-03-09" />
                </div>
                <div>
                  <Label className="text-xs">Valide jusqu'au</Label>
                  <Input type="date" className="mt-1" defaultValue="2024-04-09" />
                </div>
                <div>
                  <Label className="text-xs">Validité</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="45">45 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Objet du devis</Label>
                <Input className="mt-1" placeholder="Ex: Refonte site web corporate, Phase 1" />
              </div>
            </CardContent>
          </Card>

          {/* Lignes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Lignes du devis</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Copy className="h-3 w-3 mr-1" />Depuis modèle
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={addLine}>
                    <Plus className="h-3 w-3 mr-1" />Ajouter une ligne
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.map((line) => (
                <div key={line.id} className="p-3 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px]">Description</Label>
                      <Input
                        className="mt-0.5 text-sm"
                        placeholder="Description du service ou produit"
                        value={line.description}
                        onChange={(e) => updateLine(line.id, "description", e.target.value)}
                      />
                    </div>
                    {lines.length > 1 && (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 mt-4 text-destructive/60 hover:text-destructive"
                        onClick={() => removeLine(line.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px]">Quantité</Label>
                      <Input
                        type="number" min="0.5" step="0.5" className="mt-0.5 text-sm"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">P.U. HT</Label>
                      <Input
                        type="number" min="0" step="0.01" className="mt-0.5 text-sm"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.id, "unitPrice", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">TVA %</Label>
                      <Select
                        value={String(line.vatRate)}
                        onValueChange={(v) => updateLine(line.id, "vatRate", Number(v))}
                      >
                        <SelectTrigger className="mt-0.5"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5.5">5.5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px]">Remise %</Label>
                      <Input
                        type="number" min="0" max="100" className="mt-0.5 text-sm"
                        value={line.discount}
                        onChange={(e) => updateLine(line.id, "discount", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Total HT</Label>
                      <div className="mt-0.5 h-9 flex items-center justify-end px-3 rounded-md bg-muted/50 text-sm font-semibold">
                        {fmtEUR(lineTotal(line))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conditions & notes */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label className="text-xs">Conditions particulières</Label>
                <Textarea
                  className="mt-1 text-sm" rows={3}
                  placeholder="Conditions de réalisation, délais, modalités..."
                />
              </div>
              <div>
                <Label className="text-xs">Note interne (non visible par le client)</Label>
                <Textarea
                  className="mt-1 text-sm" rows={2}
                  placeholder="Contexte, négociation, remarques internes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Récapitulatif */}
          <Card className="sticky top-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span className="font-medium">{fmtEUR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span className="font-medium">{fmtEUR(vatTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold">Total TTC</span>
                <span className="font-bold text-xl font-display">{fmtEUR(total)}</span>
              </div>
              <Separator />
              <div className="space-y-2 pt-1">
                <Button className="w-full gradient-primary text-primary-foreground text-xs" size="sm">
                  <Send className="h-3.5 w-3.5 mr-1.5" />Envoyer au client
                </Button>
                <Button variant="outline" className="w-full text-xs" size="sm">
                  <Save className="h-3.5 w-3.5 mr-1.5" />Sauvegarder brouillon
                </Button>
                <Button variant="outline" className="w-full text-xs" size="sm">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />Prévisualiser PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* IA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Générer avec l'IA</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Décrivez la prestation en langage naturel et l'IA remplira les lignes automatiquement.
              </p>
              <Textarea
                className="text-xs" rows={3}
                placeholder="Ex: Refonte site vitrine pour une PME, 5j dev + 2j design + 1j recette à 650€/j..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button className="w-full gradient-primary text-primary-foreground text-xs" size="sm">
                <Bot className="h-3 w-3 mr-1.5" />Générer les lignes
              </Button>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium">Options avancées</p>
              <div>
                <Label className="text-xs">Signature électronique</Label>
                <Select defaultValue="none">
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Désactivée</SelectItem>
                    <SelectItem value="click">Acceptation par clic</SelectItem>
                    <SelectItem value="sign">Signature manuscrite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Acompte à la commande</Label>
                <Select defaultValue="0">
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Aucun acompte</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
