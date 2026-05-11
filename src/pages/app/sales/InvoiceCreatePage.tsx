import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, Send, Eye, Bot } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function InvoiceCreatePage() {
  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  const addLine = () => setLines([...lines, emptyLine()]);
  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));
  const updateLine = (id: string, field: keyof Line, value: string | number) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const lineTotal = (l: Line) => {
    const base = l.quantity * l.unitPrice;
    return base - (base * l.discount / 100);
  };

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const vatTotal = lines.reduce((s, l) => s + (lineTotal(l) * l.vatRate / 100), 0);
  const total = subtotal + vatTotal;

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/sales/invoices">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-fluid-2xl font-display font-bold">Nouvelle facture</h1>
            <p className="text-sm text-muted-foreground">Créez une facture détaillée</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5 mr-1.5" />Prévisualiser</Button>
          <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5 mr-1.5" />Brouillon</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Send className="h-3.5 w-3.5 mr-1.5" />Valider & Envoyer
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Client + dates */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Client</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">Acme Corp</SelectItem>
                      <SelectItem value="c2">TechFlow SAS</SelectItem>
                      <SelectItem value="c3">Digital Wave</SelectItem>
                      <SelectItem value="c4">Studio Créatif</SelectItem>
                      <SelectItem value="c5">Green Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Numéro</Label>
                  <Input className="mt-1" value="F-2024-048" readOnly />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Date d'émission</Label>
                  <Input type="date" className="mt-1" defaultValue="2024-03-09" />
                </div>
                <div>
                  <Label className="text-xs">Date d'échéance</Label>
                  <Input type="date" className="mt-1" defaultValue="2024-04-09" />
                </div>
                <div>
                  <Label className="text-xs">Conditions</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immédiat</SelectItem>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="45">45 jours</SelectItem>
                      <SelectItem value="60">60 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Lignes de facturation</CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={addLine}>
                  <Plus className="h-3 w-3 mr-1" />Ajouter une ligne
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lines.map((line, i) => (
                <div key={line.id} className="p-3 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Label className="text-[10px]">Description</Label>
                      <Input
                        className="mt-0.5 text-sm"
                        placeholder="Description du service ou produit"
                        value={line.description}
                        onChange={e => updateLine(line.id, "description", e.target.value)}
                      />
                    </div>
                    {lines.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 mt-4 text-destructive/60 hover:text-destructive" onClick={() => removeLine(line.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px]">Quantité</Label>
                      <Input
                        type="number" min="1" className="mt-0.5 text-sm"
                        value={line.quantity}
                        onChange={e => updateLine(line.id, "quantity", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Prix unitaire HT</Label>
                      <Input
                        type="number" min="0" step="0.01" className="mt-0.5 text-sm"
                        value={line.unitPrice}
                        onChange={e => updateLine(line.id, "unitPrice", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">TVA %</Label>
                      <Select value={String(line.vatRate)} onValueChange={v => updateLine(line.id, "vatRate", Number(v))}>
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
                        onChange={e => updateLine(line.id, "discount", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Total HT</Label>
                      <div className="mt-0.5 h-9 flex items-center justify-end px-3 rounded-md bg-muted/50 text-sm font-medium">
                        {fmtEUR(lineTotal(line))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="p-5">
              <Label className="text-xs">Notes / Conditions particulières</Label>
              <Textarea className="mt-1 text-sm" placeholder="Conditions, remarques, références projet..." rows={3} />
            </CardContent>
          </Card>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
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

              <div className="space-y-2 pt-2">
                <Button className="w-full gradient-primary text-primary-foreground text-xs" size="sm">
                  <Send className="h-3.5 w-3.5 mr-1.5" />Valider & Envoyer
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

          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Assistant IA</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Décrivez la prestation et l'IA remplira les lignes automatiquement.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                <Bot className="h-3 w-3 mr-1.5" />Générer avec l'IA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
