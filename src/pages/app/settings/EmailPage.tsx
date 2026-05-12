import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle, Save, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

export default function EmailPage() {
  const { data: emailData, loading: emailLoading } = useApi<any>("/api/settings/email");
  const cfg = emailData?.data;

  const [senderName,   setSenderName]   = useState("");
  const [senderEmail,  setSenderEmail]  = useState("");
  const [replyTo,      setReplyTo]      = useState("");
  const [smtpEnabled,  setSmtpEnabled]  = useState(false);
  const [smtpHost,     setSmtpHost]     = useState("");
  const [smtpPort,     setSmtpPort]     = useState("587");
  const [smtpSecurity, setSmtpSecurity] = useState("STARTTLS");
  const [smtpUser,     setSmtpUser]     = useState("");
  const [smtpPass,     setSmtpPass]     = useState("");
  const [signature,    setSignature]    = useState("Cordialement,\n\n");
  const [notifSendCopy,     setNotifSendCopy]     = useState(true);
  const [notifPaymentAlert, setNotifPaymentAlert] = useState(true);
  const [notifWeeklySummary,setNotifWeeklySummary]= useState(true);
  const [saving,   setSaving]   = useState(false);
  const [testing,  setTesting]  = useState(false);

  useEffect(() => {
    if (!cfg) return;
    setSenderName(cfg.senderName  ?? "");
    setSenderEmail(cfg.senderEmail ?? "");
    setReplyTo(cfg.replyTo ?? "");
    setSmtpEnabled(cfg.smtpEnabled ?? false);
    setSmtpHost(cfg.smtpHost ?? "");
    setSmtpPort(String(cfg.smtpPort ?? 587));
    setSmtpSecurity(cfg.smtpSecurity ?? "STARTTLS");
    setSmtpUser(cfg.smtpUser ?? "");
    setSignature(cfg.signature ?? "Cordialement,\n\n");
    setNotifSendCopy(cfg.notifSendCopy ?? true);
    setNotifPaymentAlert(cfg.notifPaymentAlert ?? true);
    setNotifWeeklySummary(cfg.notifWeeklySummary ?? true);
  }, [cfg]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        senderName, senderEmail, replyTo, smtpEnabled,
        smtpHost, smtpPort: Number(smtpPort), smtpSecurity, smtpUser,
        signature, notifSendCopy, notifPaymentAlert, notifWeeklySummary,
      };
      if (smtpPass) body.smtpPass = smtpPass;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/settings/email`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: "Configuration enregistrée", description: "Paramètres email mis à jour avec succès." });
        setSmtpPass("");
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur", description: err?.message ?? "Impossible d'enregistrer.", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!smtpHost || !smtpUser || !smtpPass) {
      toast({ title: "Champs manquants", description: "Remplissez l'hôte, l'identifiant et le mot de passe SMTP.", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/settings/email/test`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smtpHost, smtpPort: Number(smtpPort), smtpSecurity, smtpUser, smtpPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Connexion réussie", description: data.message ?? "Le serveur SMTP répond correctement." });
      } else {
        toast({ title: "Connexion échouée", description: data.message ?? "Vérifiez les paramètres SMTP.", variant: "destructive" });
      }
    } finally {
      setTesting(false);
    }
  };

  if (emailLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">Configuration email</h1>
        <p className="text-sm text-muted-foreground">Paramétrez l'envoi de vos factures, devis et relances</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />Expéditeur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom d'expéditeur</Label>
              <Input value={senderName} onChange={e => setSenderName(e.target.value)} className="h-9 text-sm" placeholder="Mon Entreprise" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email d'expédition</Label>
              <Input value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="h-9 text-sm flex-1" placeholder="facturation@monentreprise.fr" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email de réponse (reply-to)</Label>
            <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} className="h-9 text-sm" placeholder="contact@monentreprise.fr" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Serveur SMTP personnalisé</CardTitle>
            <Switch checked={smtpEnabled} onCheckedChange={setSmtpEnabled} />
          </div>
        </CardHeader>
        {smtpEnabled && (
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5" />
              Assurez-vous que votre serveur SMTP supporte TLS/STARTTLS. Désactivez pour utiliser notre infrastructure sécurisée.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">Hôte SMTP</Label>
                <Input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.votredomaine.fr" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Port</Label>
                <Input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sécurité</Label>
                <select
                  value={smtpSecurity}
                  onChange={e => setSmtpSecurity(e.target.value)}
                  className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"
                >
                  <option value="STARTTLS">STARTTLS</option>
                  <option value="TLS">TLS</option>
                  <option value="NONE">Aucune</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Identifiant</Label>
                <Input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="user@domaine.fr" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Mot de passe</Label>
                <Input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••" className="h-9 text-sm" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleTest} disabled={testing}>
              {testing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
              Tester la connexion
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Signature email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={signature} onChange={e => setSignature(e.target.value)} rows={5} className="text-sm font-mono" />
          <p className="text-xs text-muted-foreground">Signature ajoutée automatiquement à tous vos emails sortants.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Notifications automatiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Confirmation d'envoi de facture", sub: "Recevez une copie à chaque facture envoyée", value: notifSendCopy, set: setNotifSendCopy },
            { label: "Alerte paiement reçu",            sub: "Notification quand un client paie",          value: notifPaymentAlert, set: setNotifPaymentAlert },
            { label: "Résumé hebdomadaire",              sub: "Synthèse des factures et paiements le lundi", value: notifWeeklySummary, set: setNotifWeeklySummary },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <Switch checked={item.value} onCheckedChange={item.set} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Enregistrer
        </Button>
      </div>
    </motion.div>
  );
}
