import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Zap, CheckCircle, Clock, ExternalLink, FileText, Shield } from "lucide-react";
import { motion } from "framer-motion";
export default function EInvoicingSalesPage() {
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">E-Facture</h1><p className="text-sm text-muted-foreground">Conformité à la réforme française de facturation électronique 2026</p></div>
      <Card className="border-success/30 bg-success/5"><CardContent className="p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-success flex-shrink-0"/>
        <div><p className="font-semibold text-sm text-success">Votre compte est conforme e-facture</p><p className="text-xs text-muted-foreground">Factur-X activé · Chorus Pro configuré · Peppol disponible</p></div>
      </CardContent></Card>
      <div className="grid gap-3">
        {[{title:"Factur-X (PDF/A-3)",desc:"Format hybride PDF + XML — obligatoire dès sept. 2026",status:"active"},{title:"Chorus Pro",desc:"Portail national B2G — factures aux administrations",status:"active"},{title:"Peppol",desc:"Réseau européen interopérable B2B",status:"available"}].map(item=>(
          <Card key={item.title}><CardContent className="p-4 flex items-center gap-4">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Zap className="h-4 w-4 text-primary"/></div>
            <div className="flex-1"><p className="font-semibold text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
            <Badge variant="secondary" className={`text-[10px] ${item.status==="active"?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{item.status==="active"?"Actif":"Disponible"}</Badge>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="h-4 w-4"/>Calendrier réforme<InfoTooltip title="Calendrier de la réforme e-facture" description="Dates clés de l'obligation de facturation électronique en France : réception puis émission obligatoires selon la taille de l'entreprise." benefit="LE BELVEDERE vous accompagnera automatiquement dans chaque étape de la conformité. Aucune action requise de votre part pour l'instant." /></CardTitle></CardHeader>
        <CardContent className="space-y-2 text-xs">
          {[{date:"1er sept. 2026",label:"Grandes entreprises & ETI — réception obligatoire",done:false},{date:"1er sept. 2027",label:"PME & micro-entreprises — émission et réception",done:false}].map(r=>(
            <div key={r.date} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
              <div><p className="font-medium">{r.date}</p><p className="text-muted-foreground">{r.label}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
