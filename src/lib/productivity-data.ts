// Productivity mock data

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "active" | "paused" | "completed" | "at_risk";
export type OpportunityStage = "lead" | "contacted" | "proposal" | "negotiation" | "won" | "lost";

// ─── TASKS / KANBAN ────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  projectName?: string;
  assignee?: string;
  dueDate?: string;
  tags: string[];
  timeEstimate?: number; // heures
  timeSpent?: number;    // heures
  clientId?: string;
  clientName?: string;
  createdAt: string;
}

export const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  backlog:     { label: "Backlog",      color: "text-muted-foreground", bg: "bg-muted/40" },
  todo:        { label: "À faire",      color: "text-blue-600",         bg: "bg-blue-500/10" },
  in_progress: { label: "En cours",     color: "text-warning",          bg: "bg-warning/10" },
  review:      { label: "En révision",  color: "text-violet-600",       bg: "bg-violet-500/10" },
  done:        { label: "Terminé",      color: "text-success",          bg: "bg-success/10" },
};

export const taskPriorityConfig: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  low:    { label: "Faible",  color: "text-muted-foreground", dot: "bg-slate-400" },
  medium: { label: "Moyen",   color: "text-blue-500",         dot: "bg-blue-400" },
  high:   { label: "Élevé",   color: "text-warning",          dot: "bg-amber-400" },
  urgent: { label: "Urgent",  color: "text-destructive",      dot: "bg-red-500" },
};

export const tasks: Task[] = [
  { id: "T01", title: "Maquettes page d'accueil Acme Corp", status: "in_progress", priority: "high", projectId: "P01", projectName: "Refonte Acme Corp", assignee: "Jean D.", dueDate: "2024-03-15", tags: ["Design", "UI"], timeEstimate: 8, timeSpent: 5, clientId: "C001", clientName: "Acme Corp", createdAt: "2024-03-01" },
  { id: "T02", title: "Intégration API paiement Stripe", status: "in_progress", priority: "urgent", projectId: "P02", projectName: "Migration TechFlow", assignee: "Jean D.", dueDate: "2024-03-12", tags: ["Dev", "Backend"], timeEstimate: 12, timeSpent: 8, clientId: "C002", clientName: "TechFlow SAS", createdAt: "2024-03-02" },
  { id: "T03", title: "Rédaction specs techniques v2", status: "todo", priority: "medium", projectId: "P01", projectName: "Refonte Acme Corp", assignee: "Jean D.", dueDate: "2024-03-18", tags: ["Documentation"], timeEstimate: 4, timeSpent: 0, clientId: "C001", clientName: "Acme Corp", createdAt: "2024-03-03" },
  { id: "T04", title: "Tests unitaires module auth", status: "review", priority: "high", projectId: "P02", projectName: "Migration TechFlow", assignee: "Jean D.", dueDate: "2024-03-11", tags: ["Dev", "Tests"], timeEstimate: 6, timeSpent: 6, clientId: "C002", clientName: "TechFlow SAS", createdAt: "2024-02-28" },
  { id: "T05", title: "Démo client Digital Wave", status: "todo", priority: "urgent", projectId: "P03", projectName: "Module e-commerce", assignee: "Jean D.", dueDate: "2024-03-10", tags: ["Client"], timeEstimate: 2, timeSpent: 0, clientId: "C003", clientName: "Digital Wave", createdAt: "2024-03-05" },
  { id: "T06", title: "Optimisation performances DB", status: "backlog", priority: "medium", projectId: "P02", projectName: "Migration TechFlow", dueDate: "2024-03-25", tags: ["Dev", "Perf"], timeEstimate: 8, timeSpent: 0, clientId: "C002", clientName: "TechFlow SAS", createdAt: "2024-03-06" },
  { id: "T07", title: "Livraison rapport SEO", status: "done", priority: "medium", projectId: "P04", projectName: "Consulting Studio Créatif", assignee: "Jean D.", dueDate: "2024-03-08", tags: ["SEO", "Livrable"], timeEstimate: 5, timeSpent: 4.5, clientId: "C004", clientName: "Studio Créatif", createdAt: "2024-03-01" },
  { id: "T08", title: "Retouches maquettes mobile", status: "done", priority: "low", projectId: "P01", projectName: "Refonte Acme Corp", assignee: "Jean D.", dueDate: "2024-03-07", tags: ["Design"], timeEstimate: 3, timeSpent: 2, clientId: "C001", clientName: "Acme Corp", createdAt: "2024-03-02" },
  { id: "T09", title: "Onboarding Green Solutions", status: "todo", priority: "medium", tags: ["Client", "Admin"], timeEstimate: 1, timeSpent: 0, clientId: "C005", clientName: "Green Solutions", createdAt: "2024-03-07" },
  { id: "T10", title: "Préparation devis StartupXYZ Phase 2", status: "backlog", priority: "low", tags: ["Commercial"], timeEstimate: 2, timeSpent: 0, clientId: "C007", clientName: "StartupXYZ", createdAt: "2024-03-08" },
  { id: "T11", title: "Migration hébergement Vercel → AWS", status: "backlog", priority: "low", projectId: "P02", projectName: "Migration TechFlow", tags: ["Dev", "Infra"], timeEstimate: 16, timeSpent: 0, clientId: "C002", clientName: "TechFlow SAS", createdAt: "2024-03-04" },
  { id: "T12", title: "Validation recette client", status: "review", priority: "high", projectId: "P03", projectName: "Module e-commerce", assignee: "Jean D.", dueDate: "2024-03-14", tags: ["Recette", "Client"], timeEstimate: 3, timeSpent: 2, clientId: "C003", clientName: "Digital Wave", createdAt: "2024-03-06" },
];

// ─── TIME TRACKING ────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  date: string;
  taskId?: string;
  taskTitle: string;
  projectId?: string;
  projectName?: string;
  clientName?: string;
  duration: number; // minutes
  billable: boolean;
  billed: boolean;
  rate?: number; // €/h
  notes?: string;
}

export const timeEntries: TimeEntry[] = [
  { id: "TE01", date: "2024-03-08", taskTitle: "Maquettes page d'accueil Acme Corp", projectName: "Refonte Acme Corp", clientName: "Acme Corp", duration: 180, billable: true, billed: true, rate: 650 },
  { id: "TE02", date: "2024-03-08", taskTitle: "Réunion kick-off TechFlow", projectName: "Migration TechFlow", clientName: "TechFlow SAS", duration: 90, billable: true, billed: false, rate: 650 },
  { id: "TE03", date: "2024-03-07", taskTitle: "Intégration API Stripe", projectName: "Migration TechFlow", clientName: "TechFlow SAS", duration: 240, billable: true, billed: false, rate: 650 },
  { id: "TE04", date: "2024-03-07", taskTitle: "Retouches maquettes mobile", projectName: "Refonte Acme Corp", clientName: "Acme Corp", duration: 120, billable: true, billed: true, rate: 650 },
  { id: "TE05", date: "2024-03-06", taskTitle: "Rapport SEO Studio Créatif", projectName: "Consulting Studio Créatif", clientName: "Studio Créatif", duration: 150, billable: true, billed: true, rate: 550 },
  { id: "TE06", date: "2024-03-06", taskTitle: "Tests unitaires auth", projectName: "Migration TechFlow", clientName: "TechFlow SAS", duration: 210, billable: true, billed: false, rate: 650 },
  { id: "TE07", date: "2024-03-05", taskTitle: "Admin & compta interne", duration: 60, billable: false, billed: false },
  { id: "TE08", date: "2024-03-05", taskTitle: "Préparation démo Digital Wave", projectName: "Module e-commerce", clientName: "Digital Wave", duration: 90, billable: true, billed: false, rate: 650 },
  { id: "TE09", date: "2024-03-04", taskTitle: "Validation recette e-commerce", projectName: "Module e-commerce", clientName: "Digital Wave", duration: 120, billable: true, billed: false, rate: 650 },
  { id: "TE10", date: "2024-03-04", taskTitle: "Veille technologique", duration: 45, billable: false, billed: false },
];

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;        // € budget total
  spent: number;         // € dépensé (heures facturées)
  tasksTotal: number;
  tasksDone: number;
  hoursEstimate: number;
  hoursSpent: number;
  description: string;
  tags: string[];
  color: string;
}

export const projectStatusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  active:    { label: "En cours",  color: "bg-success/10 text-success" },
  paused:    { label: "En pause",  color: "bg-warning/10 text-warning" },
  completed: { label: "Terminé",   color: "bg-muted text-muted-foreground" },
  at_risk:   { label: "À risque",  color: "bg-destructive/10 text-destructive" },
};

export const projects: Project[] = [
  { id: "P01", name: "Refonte Acme Corp", clientId: "C001", clientName: "Acme Corp", status: "active", startDate: "2024-02-01", endDate: "2024-04-30", budget: 12000, spent: 7800, tasksTotal: 8, tasksDone: 3, hoursEstimate: 80, hoursSpent: 52, description: "Refonte complète du site corporate, maquettes, intégration, tests.", tags: ["Design", "Dev"], color: "from-violet-500 to-purple-600" },
  { id: "P02", name: "Migration TechFlow", clientId: "C002", clientName: "TechFlow SAS", status: "at_risk", startDate: "2024-01-15", endDate: "2024-03-31", budget: 18000, spent: 16200, tasksTotal: 12, tasksDone: 7, hoursEstimate: 120, hoursSpent: 108, description: "Migration infrastructure cloud, refactoring backend, CI/CD.", tags: ["Dev", "Infra"], color: "from-blue-500 to-cyan-600" },
  { id: "P03", name: "Module e-commerce", clientId: "C003", clientName: "Digital Wave", status: "active", startDate: "2024-02-15", endDate: "2024-05-15", budget: 9500, spent: 4200, tasksTotal: 7, tasksDone: 2, hoursEstimate: 65, hoursSpent: 28, description: "Développement module boutique en ligne avec paiement intégré.", tags: ["Dev", "E-commerce"], color: "from-emerald-500 to-teal-600" },
  { id: "P04", name: "Consulting Studio Créatif", clientId: "C004", clientName: "Studio Créatif", status: "completed", startDate: "2024-01-01", endDate: "2024-03-01", budget: 5500, spent: 5100, tasksTotal: 6, tasksDone: 6, hoursEstimate: 36, hoursSpent: 34, description: "Audit SEO, stratégie digitale, rapport et recommandations.", tags: ["SEO", "Consulting"], color: "from-orange-500 to-amber-600" },
  { id: "P05", name: "Maintenance Green Solutions", clientId: "C005", clientName: "Green Solutions", status: "active", startDate: "2024-01-01", endDate: "2024-12-31", budget: 9360, spent: 2160, tasksTotal: 0, tasksDone: 0, hoursEstimate: 72, hoursSpent: 16, description: "Contrat de maintenance annuel — 6h/mois.", tags: ["Maintenance"], color: "from-green-500 to-emerald-600" },
];

// ─── OPPORTUNITIES (CRM) ──────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  name: string;
  clientName: string;
  clientId?: string;
  stage: OpportunityStage;
  value: number;       // € estimé
  probability: number; // %
  expectedClose: string;
  assignee: string;
  source: string;
  notes?: string;
  lastActivity: string;
  createdAt: string;
}

export const opportunityStageConfig: Record<OpportunityStage, { label: string; color: string; step: number }> = {
  lead:        { label: "Lead",        color: "bg-slate-500/10 text-slate-500",    step: 1 },
  contacted:   { label: "Contacté",    color: "bg-blue-500/10 text-blue-500",      step: 2 },
  proposal:    { label: "Proposition", color: "bg-violet-500/10 text-violet-500",  step: 3 },
  negotiation: { label: "Négociation", color: "bg-warning/10 text-warning",        step: 4 },
  won:         { label: "Gagné",       color: "bg-success/10 text-success",        step: 5 },
  lost:        { label: "Perdu",       color: "bg-destructive/10 text-destructive", step: 5 },
};

export const opportunities: Opportunity[] = [
  { id: "OPP01", name: "Phase 2 — Application mobile Acme", clientName: "Acme Corp", clientId: "C001", stage: "proposal", value: 24000, probability: 70, expectedClose: "2024-04-15", assignee: "Jean D.", source: "Client existant", notes: "Suite logique du projet refonte. RDV prévu le 12 mars.", lastActivity: "2024-03-07", createdAt: "2024-02-20" },
  { id: "OPP02", name: "Audit sécurité TechFlow", clientName: "TechFlow SAS", clientId: "C002", stage: "negotiation", value: 8500, probability: 80, expectedClose: "2024-03-20", assignee: "Jean D.", source: "Client existant", notes: "Budget validé, en attente bon de commande.", lastActivity: "2024-03-08", createdAt: "2024-02-28" },
  { id: "OPP03", name: "Site vitrine StartupXYZ v2", clientName: "StartupXYZ", clientId: "C007", stage: "contacted", value: 6800, probability: 40, expectedClose: "2024-04-30", assignee: "Jean D.", source: "Recommandation", notes: "Premier contact positif, devis en préparation.", lastActivity: "2024-03-05", createdAt: "2024-03-01" },
  { id: "OPP04", name: "Formation équipe React — Cabinet Lebrun", clientName: "Cabinet Lebrun", clientId: "C008", stage: "lead", value: 3200, probability: 25, expectedClose: "2024-05-15", assignee: "Jean D.", source: "LinkedIn", lastActivity: "2024-03-04", createdAt: "2024-03-04" },
  { id: "OPP05", name: "Plateforme RH — NewCorp", clientName: "NewCorp", stage: "proposal", value: 35000, probability: 50, expectedClose: "2024-05-01", assignee: "Jean D.", source: "Salon B2B", notes: "Grosse opportunité. Concurrence avec 2 autres agences.", lastActivity: "2024-03-06", createdAt: "2024-02-15" },
  { id: "OPP06", name: "Refonte identité Digital Wave", clientName: "Digital Wave", clientId: "C003", stage: "won", value: 5500, probability: 100, expectedClose: "2024-03-01", assignee: "Jean D.", source: "Client existant", lastActivity: "2024-03-01", createdAt: "2024-02-10" },
  { id: "OPP07", name: "ERP PME — Dubois Industries", clientName: "Dubois Industries", stage: "lost", value: 42000, probability: 0, expectedClose: "2024-02-28", assignee: "Jean D.", source: "Appel d'offres", notes: "Perdu face à un grand cabinet. Prix trop élevé.", lastActivity: "2024-02-28", createdAt: "2024-01-15" },
];

export const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const fmtHours = (h: number) =>
  h < 1 ? `${Math.round(h * 60)}min` : `${h % 1 === 0 ? h : h.toFixed(1)}h`;
