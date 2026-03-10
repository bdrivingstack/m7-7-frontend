import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, Plus, Search, MoreHorizontal, Shield, Crown,
  Eye, Edit, Trash2, Mail, Clock, CheckCircle, XCircle,
  AlertTriangle, RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

type Role = "owner" | "admin" | "accountant" | "manager" | "viewer";
type UserStatus = "active" | "invited" | "suspended";

interface TeamUser {
  id: string; name: string; email: string; role: Role;
  status: UserStatus; lastLogin?: string; avatar: string; mfa: boolean;
}

const roleConfig: Record<Role, { label: string; color: string; desc: string }> = {
  owner:      { label: "Propriétaire", color: "bg-amber-500/10 text-amber-500",   desc: "Accès complet + gestion du compte" },
  admin:      { label: "Admin",        color: "bg-destructive/10 text-destructive", desc: "Accès complet sauf facturation" },
  accountant: { label: "Comptable",    color: "bg-violet-500/10 text-violet-600",  desc: "Comptabilité, exports, lecture factures" },
  manager:    { label: "Gestionnaire", color: "bg-blue-500/10 text-blue-600",      desc: "Factures, devis, clients" },
  viewer:     { label: "Lecteur",      color: "bg-muted text-muted-foreground",    desc: "Lecture seule sur tout" },
};

const statusConfig: Record<UserStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: "Actif",    color: "bg-success/10 text-success",           icon: CheckCircle },
  invited:   { label: "Invité",   color: "bg-warning/10 text-warning",           icon: Mail },
  suspended: { label: "Suspendu", color: "bg-destructive/10 text-destructive",   icon: XCircle },
};

const users: TeamUser[] = [
  { id: "U1", name: "Jean Dupont",    email: "jean@acme.fr",     role: "owner",      status: "active",    lastLogin: "2024-03-09T09:15:00", avatar: "JD", mfa: true },
  { id: "U2", name: "Marie Martin",  email: "marie@acme.fr",    role: "admin",      status: "active",    lastLogin: "2024-03-08T17:30:00", avatar: "MM", mfa: true },
  { id: "U3", name: "Paul Bernard",  email: "paul@acme.fr",     role: "accountant", status: "active",    lastLogin: "2024-03-07T11:00:00", avatar: "PB", mfa: false },
  { id: "U4", name: "Sophie Leroy",  email: "sophie@acme.fr",   role: "manager",    status: "active",    lastLogin: "2024-03-09T08:45:00", avatar: "SL", mfa: true },
  { id: "U5", name: "Thomas Morel",  email: "thomas@acme.fr",   role: "viewer",     status: "invited",   avatar: "TM", mfa: false },
  { id: "U6", name: "Clara Petit",   email: "clara@acme.fr",    role: "manager",    status: "suspended", lastLogin: "2024-02-15T10:00:00", avatar: "CP", mfa: false },
];

// Permissions matrix
const permissions = [
  { feature: "Tableaux de bord",     owner: true, admin: true, accountant: true,  manager: true,  viewer: true  },
  { feature: "Créer des factures",   owner: true, admin: true, accountant: false, manager: true,  viewer: false },
  { feature: "Approuver des devis",  owner: true, admin: true, accountant: false, manager: true,  viewer: false },
  { feature: "Comptabilité",         owner: true, admin: true, accountant: true,  manager: false, viewer: false },
  { feature: "Exports FEC",          owner: true, admin: true, accountant: true,  manager: false, viewer: false },
  { feature: "Gestion clients",      owner: true, admin: true, accountant: false, manager: true,  viewer: true  },
  { feature: "Paramètres",           owner: true, admin: true, accountant: false, manager: false, viewer: false },
  { feature: "Gérer les utilisateurs",owner: true,admin: false,accountant: false, manager: false, viewer: false },
  { feature: "Facturation du plan",  owner: true, admin: false,accountant: false, manager: false, viewer: false },
  { feature: "Clés API",             owner: true, admin: true, accountant: false, manager: false, viewer: false },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="p-6 space-y-6 max-w-4xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">Gérez les accès et rôles de votre équipe</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Inviter un utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Actifs</p>
          <p className="text-2xl font-display font-bold">{users.filter(u => u.status === "active").length}</p>
          <p className="text-xs text-muted-foreground">/ 10 max (Plan Pro)</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">2FA activé</p>
          <p className="text-2xl font-display font-bold text-success">{users.filter(u => u.mfa).length}</p>
          <p className="text-xs text-muted-foreground">/ {users.length} utilisateurs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Invitations en attente</p>
          <p className="text-2xl font-display font-bold text-warning">{users.filter(u => u.status === "invited").length}</p>
          <p className="text-xs text-muted-foreground">en attente</p>
        </CardContent></Card>
      </div>

      {/* Alerte MFA */}
      {users.some(u => u.status === "active" && !u.mfa) && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Sécurité :</span>
            <span className="text-muted-foreground"> {users.filter(u => u.status === "active" && !u.mfa).length} utilisateur(s) actifs n'ont pas activé le 2FA.</span>
          </div>
          <Button size="sm" variant="outline" className="text-xs h-7 border-warning/40 text-warning flex-shrink-0">
            Forcer le 2FA
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowMatrix(!showMatrix)}>
          <Shield className="h-3.5 w-3.5 mr-1.5" />{showMatrix ? "Masquer" : "Voir"} les permissions
        </Button>
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Utilisateur</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Rôle</th>
                <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Statut</th>
                <th className="text-center p-3 font-medium text-muted-foreground hidden md:table-cell">2FA</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">Dernière connexion</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const rc = roleConfig[user.role];
                const sc = statusConfig[user.status];
                const StatusIcon = sc.icon;
                return (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground text-[10px] font-bold flex-shrink-0 ${user.role === "owner" ? "bg-amber-500" : "gradient-primary"}`}>
                          {user.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium">{user.name}</p>
                            {user.role === "owner" && <Crown className="h-3 w-3 text-amber-500" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className={`text-[10px] ${rc.color}`}>{rc.label}</Badge>
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${sc.color}`}>
                        <StatusIcon className="h-2.5 w-2.5" />{sc.label}
                      </span>
                    </td>
                    <td className="p-3 text-center hidden md:table-cell">
                      {user.mfa
                        ? <CheckCircle className="h-4 w-4 text-success mx-auto" />
                        : <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </td>
                    <td className="p-3 text-right hidden lg:table-cell text-muted-foreground">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier le rôle</DropdownMenuItem>
                          {user.status === "invited" && <DropdownMenuItem><RefreshCw className="h-3 w-3 mr-2" />Renvoyer l'invitation</DropdownMenuItem>}
                          {user.status === "active" && <DropdownMenuItem><XCircle className="h-3 w-3 mr-2" />Suspendre</DropdownMenuItem>}
                          {user.status === "suspended" && <DropdownMenuItem><CheckCircle className="h-3 w-3 mr-2" />Réactiver</DropdownMenuItem>}
                          {user.role !== "owner" && (
                            <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Permissions matrix */}
      {showMatrix && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />Matrice des permissions par rôle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Fonctionnalité</th>
                  {(["owner", "admin", "accountant", "manager", "viewer"] as Role[]).map((r) => (
                    <th key={r} className="text-center p-3 font-medium text-muted-foreground">
                      <Badge variant="secondary" className={`text-[9px] ${roleConfig[r].color}`}>{roleConfig[r].label}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.feature} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="p-3 font-medium">{perm.feature}</td>
                    {(["owner", "admin", "accountant", "manager", "viewer"] as Role[]).map((r) => (
                      <td key={r} className="p-3 text-center">
                        {perm[r]
                          ? <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Roles description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Description des rôles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(Object.entries(roleConfig) as [Role, typeof roleConfig[Role]][]).map(([role, cfg]) => (
            <div key={role} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
              <Badge variant="secondary" className={`text-[10px] flex-shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
              <p className="text-xs text-muted-foreground">{cfg.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
