import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, Download, DollarSign, Users, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
const mrrData = [
  {month:"Oct",mrr:8200},{month:"Nov",mrr:9100},{month:"Déc",mrr:10400},{month:"Jan",mrr:11800},
  {month:"Fév",mrr:13200},{month:"Mar",mrr:14850},
];
const recentTx = [
  {org:"ACME Corp",plan:"Pro",amount:29,date:"01/03/2024",status:"paid"},
  {org:"Bernard & Fils",plan:"Business",amount:79,date:"01/03/2024",status:"paid"},
  {org:"Dubois SAS",plan:"Micro",amount:9,date:"01/03/2024",status:"failed"},
  {org:"Tech Solutions",plan:"Expert",amount:499,date:"01/03/2024",status:"paid"},
];
export default function AdminBillingPage() {
  const mrr = mrrData[mrrData.length-1].mrr;
  const arr = mrr*12;
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Facturation plateforme</h1><p className="text-sm text-muted-foreground">MRR, ARR, revenus et paiements</p></div>
        <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1.5"/>Export comptable</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{label:"MRR",value:`${mrr.toLocaleString()} €`,sub:"+12.5% vs mois préc.",color:"text-success"},{label:"ARR",value:`${arr.toLocaleString()} €`,sub:"Annualisé",color:""},{label:"Abonnés actifs",value:"1 295",sub:"+23 ce mois",color:""},{label:"Churn rate",value:"2.1%",sub:"Objectif < 3%",color:"text-success"}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{s.label}</p><p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p><p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4"/>Évolution MRR (6 mois)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mrrData}>
              <defs><linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4}/>
              <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:any)=>[`${Number(v).toLocaleString()} €`,"MRR"]} contentStyle={{fontSize:11,borderRadius:8}}/>
              <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#mrrGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Derniers paiements</CardTitle></CardHeader>
        <CardContent className="p-0"><table className="w-full text-xs">
          <thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Organisation</th><th className="text-center p-3 font-medium text-muted-foreground">Plan</th><th className="text-right p-3 font-medium text-muted-foreground">Montant</th><th className="text-center p-3 font-medium text-muted-foreground">Statut</th><th className="text-right p-3 font-medium text-muted-foreground">Date</th></tr></thead>
          <tbody>{recentTx.map((t,i)=>(
            <tr key={i} className="border-b border-border/40 hover:bg-muted/20">
              <td className="p-3 font-medium">{t.org}</td>
              <td className="p-3 text-center"><Badge variant="secondary" className="text-[10px]">{t.plan}</Badge></td>
              <td className="p-3 text-right font-bold">{t.amount} €</td>
              <td className="p-3 text-center"><Badge variant="secondary" className={`text-[10px] ${t.status==="paid"?"bg-success/10 text-success":"bg-destructive/10 text-destructive"}`}>{t.status==="paid"?"Payé":"Échoué"}</Badge></td>
              <td className="p-3 text-right text-muted-foreground">{t.date}</td>
            </tr>
          ))}</tbody>
        </table></CardContent>
      </Card>
    </motion.div>
  );
}
