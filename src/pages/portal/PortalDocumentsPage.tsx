import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderOpen, Download, FileText, Search, Shield, Lock, Eye } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
type DocType = "facture"|"devis"|"contrat"|"autre";
const typeConfig: Record<DocType,{label:string;color:string}> = {
  facture:{label:"Facture",color:"bg-primary/10 text-primary"},
  devis:{label:"Devis",color:"bg-warning/10 text-warning"},
  contrat:{label:"Contrat",color:"bg-violet-500/10 text-violet-600"},
  autre:{label:"Autre",color:"bg-muted text-muted-foreground"},
};
const docs = [
  {id:1,name:"Contrat de prestation 2024.pdf",type:"contrat" as DocType,size:"245 Ko",date:"01/01/2024",protected:true},
  {id:2,name:"F-2024-052.pdf",type:"facture" as DocType,size:"89 Ko",date:"05/03/2024",protected:false},
  {id:3,name:"F-2024-047.pdf",type:"facture" as DocType,size:"76 Ko",date:"08/02/2024",protected:false},
  {id:4,name:"D-2024-031.pdf",type:"devis" as DocType,size:"112 Ko",date:"01/03/2024",protected:false},
  {id:5,name:"Conditions générales de vente.pdf",type:"autre" as DocType,size:"180 Ko",date:"01/01/2024",protected:false},
  {id:6,name:"Rapport mensuel Février 2024.pdf",type:"autre" as DocType,size:"420 Ko",date:"01/03/2024",protected:false},
];
export default function PortalDocumentsPage() {
  const [search, setSearch] = useState("");
  const filtered = docs.filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Mes documents</h1><p className="text-sm text-muted-foreground">Tous vos fichiers partagés</p></div>
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2 text-xs">
        <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"/>
        <span>Vos documents sont stockés chiffrés (AES-256) et accessibles uniquement depuis votre compte sécurisé. Les téléchargements sont journalisés.</span>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="space-y-2">
        {filtered.map(doc=>{
          const tc=typeConfig[doc.type];
          return <Card key={doc.id} className="hover:shadow-sm transition-all">
            <CardContent className="p-3.5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><FileText className="h-4.5 w-4.5 text-muted-foreground"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-medium truncate">{doc.name}</p>
                  {doc.protected&&<Lock className="h-3 w-3 text-muted-foreground flex-shrink-0"/>}
                </div>
                <div className="flex items-center gap-2 mt-0.5"><Badge variant="secondary" className={`text-[9px] ${tc.color}`}>{tc.label}</Badge><span className="text-[10px] text-muted-foreground">{doc.size} · {doc.date}</span></div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5"/></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button>
              </div>
            </CardContent>
          </Card>;
        })}
      </div>
    </motion.div>
  );
}
