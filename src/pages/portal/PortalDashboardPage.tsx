import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Download, CheckCircle, Clock, Eye } from "lucide-react";

const documents = [
  { id: "D-2024-031", type: "Devis", client: "Acme Corp", amount: 8500, status: "pending", date: "2024-03-06" },
  { id: "F-2024-047", type: "Facture", client: "Acme Corp", amount: 4200, status: "paid", date: "2024-03-08" },
  { id: "F-2024-046", type: "Facture", client: "Acme Corp", amount: 2800, status: "sent", date: "2024-03-05" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  paid: { label: "Payée", color: "bg-success/10 text-success" },
  sent: { label: "À payer", color: "bg-warning/10 text-warning" },
  pending: { label: "En attente", color: "bg-info/10 text-info" },
};

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bienvenue</h1>
        <p className="text-sm text-muted-foreground">Retrouvez vos documents et effectuez vos paiements</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Devis en attente</p>
              <p className="text-lg font-display font-bold">1</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">À payer</p>
              <p className="text-lg font-display font-bold">2 800 €</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payées</p>
              <p className="text-lg font-display font-bold">4 200 €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Vos documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.type} {doc.id}</p>
                    <p className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{doc.amount.toLocaleString("fr-FR")} €</span>
                  <Badge variant="secondary" className={`text-[10px] ${statusMap[doc.status]?.color}`}>
                    {statusMap[doc.status]?.label}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    {doc.status === "sent" && (
                      <Button size="sm" className="h-7 text-[10px] gradient-primary text-primary-foreground">Payer</Button>
                    )}
                    {doc.status === "pending" && doc.type === "Devis" && (
                      <Button size="sm" className="h-7 text-[10px] gradient-accent text-accent-foreground">Accepter</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
