// Customers mock data

export type CustomerStatus = "active" | "inactive" | "at_risk";
export type RiskScore = "low" | "medium" | "high";
export type PaymentTerms = "immediate" | "15days" | "30days" | "45days" | "60days";

export interface CustomerContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  zip: string;
  country: string;
}

export interface CustomerNote {
  id: string;
  text: string;
  date: string;
  by: string;
}

export interface CustomerActivity {
  id: string;
  type: "invoice_sent" | "invoice_paid" | "quote_sent" | "quote_accepted" | "quote_rejected" | "reminder_sent" | "note_added" | "payment_late";
  title: string;
  description: string;
  date: string;
  amount?: number;
  ref?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: "company" | "individual";
  siret?: string;
  vatNumber?: string;
  status: CustomerStatus;
  riskScore: RiskScore;
  paymentTerms: PaymentTerms;
  billingAddress: CustomerAddress;
  contacts: CustomerContact[];
  notes: CustomerNote[];
  activity: CustomerActivity[];
  // Stats
  totalRevenue: number;
  totalInvoices: number;
  totalPaid: number;
  totalUnpaid: number;
  averagePaymentDelay: number; // jours
  lastInvoiceDate: string;
  lastPaymentDate: string;
  portalAccess: boolean;
  portalEmail?: string;
  tags: string[];
  createdAt: string;
}

export const paymentTermsConfig: Record<PaymentTerms, string> = {
  immediate: "Comptant",
  "15days": "15 jours",
  "30days": "30 jours",
  "45days": "45 jours",
  "60days": "60 jours",
};

export const riskConfig: Record<RiskScore, { label: string; color: string; bg: string }> = {
  low: { label: "Faible", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Moyen", color: "text-warning", bg: "bg-warning/10" },
  high: { label: "Élevé", color: "text-destructive", bg: "bg-destructive/10" },
};

export const statusConfig: Record<CustomerStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-success/10 text-success" },
  inactive: { label: "Inactif", color: "bg-muted text-muted-foreground" },
  at_risk: { label: "À risque", color: "bg-destructive/10 text-destructive" },
};

export const customers: Customer[] = [
  {
    id: "C001",
    name: "Acme Corp",
    type: "company",
    siret: "42312345678901",
    vatNumber: "FR42312345678",
    status: "active",
    riskScore: "low",
    paymentTerms: "30days",
    billingAddress: { line1: "12 rue de la Paix", city: "Paris", zip: "75001", country: "France" },
    contacts: [
      { id: "CT1", name: "Marie Dupont", role: "Directrice financière", email: "m.dupont@acmecorp.fr", phone: "+33 1 42 00 00 01", isPrimary: true },
      { id: "CT2", name: "Jean Martin", role: "Responsable achats", email: "j.martin@acmecorp.fr", isPrimary: false },
    ],
    notes: [
      { id: "N1", text: "Client historique depuis 2021. Paiement toujours ponctuel. Potentiel upsell sur consulting.", date: "2024-02-15", by: "Admin" },
    ],
    activity: [
      { id: "A1", type: "invoice_paid", title: "Facture réglée", description: "F-2024-047 réglée en avance", date: "2024-03-08", amount: 4200, ref: "F-2024-047" },
      { id: "A2", type: "quote_accepted", title: "Devis accepté", description: "D-2024-031 accepté", date: "2024-03-06", amount: 8500, ref: "D-2024-031" },
      { id: "A3", type: "invoice_sent", title: "Facture envoyée", description: "F-2024-042 envoyée par email", date: "2024-02-20", amount: 3200, ref: "F-2024-042" },
      { id: "A4", type: "invoice_paid", title: "Facture réglée", description: "F-2024-042 réglée", date: "2024-03-01", amount: 3200, ref: "F-2024-042" },
    ],
    totalRevenue: 18500,
    totalInvoices: 8,
    totalPaid: 18500,
    totalUnpaid: 0,
    averagePaymentDelay: 28,
    lastInvoiceDate: "2024-03-08",
    lastPaymentDate: "2024-03-08",
    portalAccess: true,
    portalEmail: "m.dupont@acmecorp.fr",
    tags: ["VIP", "Développement web"],
    createdAt: "2021-04-12",
  },
  {
    id: "C002",
    name: "TechFlow SAS",
    type: "company",
    siret: "50912345678901",
    vatNumber: "FR50912345678",
    status: "active",
    riskScore: "low",
    paymentTerms: "30days",
    billingAddress: { line1: "45 avenue des Champs", city: "Lyon", zip: "69001", country: "France" },
    contacts: [
      { id: "CT3", name: "Pierre Lefebvre", role: "CTO", email: "p.lefebvre@techflow.fr", phone: "+33 4 72 00 00 01", isPrimary: true },
    ],
    notes: [],
    activity: [
      { id: "A5", type: "invoice_sent", title: "Facture envoyée", description: "F-2024-046 envoyée", date: "2024-03-05", amount: 2800, ref: "F-2024-046" },
      { id: "A6", type: "quote_sent", title: "Devis envoyé", description: "D-2024-029 envoyé", date: "2024-03-02", amount: 5600, ref: "D-2024-029" },
    ],
    totalRevenue: 12300,
    totalInvoices: 5,
    totalPaid: 9500,
    totalUnpaid: 2800,
    averagePaymentDelay: 32,
    lastInvoiceDate: "2024-03-05",
    lastPaymentDate: "2024-02-10",
    portalAccess: true,
    portalEmail: "p.lefebvre@techflow.fr",
    tags: ["Développement web", "Maintenance"],
    createdAt: "2022-01-20",
  },
  {
    id: "C003",
    name: "Digital Wave",
    type: "company",
    siret: "63112345678901",
    vatNumber: "FR63112345678",
    status: "at_risk",
    riskScore: "high",
    paymentTerms: "30days",
    billingAddress: { line1: "8 rue Victor Hugo", city: "Bordeaux", zip: "33000", country: "France" },
    contacts: [
      { id: "CT4", name: "Sophie Bernard", role: "Gérante", email: "s.bernard@digitalwave.fr", phone: "+33 5 56 00 00 01", isPrimary: true },
    ],
    notes: [
      { id: "N2", text: "Retard de paiement récurrent depuis Q4 2023. Relances nécessaires. Surveiller.", date: "2024-02-01", by: "Admin" },
    ],
    activity: [
      { id: "A7", type: "payment_late", title: "Retard de paiement", description: "F-2024-045 en retard de 15 jours", date: "2024-03-07", amount: 1950, ref: "F-2024-045" },
      { id: "A8", type: "reminder_sent", title: "Relance envoyée", description: "Relance #1 pour F-2024-045", date: "2024-03-06", ref: "F-2024-045" },
      { id: "A9", type: "invoice_sent", title: "Facture envoyée", description: "F-2024-045 envoyée", date: "2024-02-15", amount: 1950, ref: "F-2024-045" },
    ],
    totalRevenue: 9800,
    totalInvoices: 4,
    totalPaid: 7850,
    totalUnpaid: 1950,
    averagePaymentDelay: 48,
    lastInvoiceDate: "2024-02-15",
    lastPaymentDate: "2024-01-20",
    portalAccess: false,
    tags: ["À surveiller"],
    createdAt: "2022-06-08",
  },
  {
    id: "C004",
    name: "Studio Créatif",
    type: "company",
    siret: "71412345678901",
    status: "active",
    riskScore: "medium",
    paymentTerms: "15days",
    billingAddress: { line1: "22 rue des Arts", city: "Marseille", zip: "13001", country: "France" },
    contacts: [
      { id: "CT5", name: "Lucie Moreau", role: "Directrice artistique", email: "l.moreau@studiocrea.fr", isPrimary: true },
      { id: "CT6", name: "Thomas Roux", role: "Commercial", email: "t.roux@studiocrea.fr", phone: "+33 4 91 00 00 01", isPrimary: false },
    ],
    notes: [],
    activity: [
      { id: "A10", type: "invoice_sent", title: "Facture envoyée", description: "F-2024-044 en brouillon", date: "2024-03-07", amount: 3100, ref: "F-2024-044" },
    ],
    totalRevenue: 7200,
    totalInvoices: 6,
    totalPaid: 4100,
    totalUnpaid: 3100,
    averagePaymentDelay: 22,
    lastInvoiceDate: "2024-03-07",
    lastPaymentDate: "2024-02-28",
    portalAccess: true,
    portalEmail: "l.moreau@studiocrea.fr",
    tags: ["Design", "Nouveau client"],
    createdAt: "2023-03-15",
  },
  {
    id: "C005",
    name: "Green Solutions",
    type: "company",
    siret: "82512345678901",
    vatNumber: "FR82512345678",
    status: "active",
    riskScore: "low",
    paymentTerms: "30days",
    billingAddress: { line1: "3 allée des Jardins", city: "Nantes", zip: "44000", country: "France" },
    contacts: [
      { id: "CT7", name: "Marc Leclerc", role: "Directeur général", email: "m.leclerc@greensolutions.fr", phone: "+33 2 40 00 00 01", isPrimary: true },
    ],
    notes: [],
    activity: [
      { id: "A11", type: "invoice_paid", title: "Facture réglée", description: "F-2024-043 réglée", date: "2024-03-01", amount: 1600, ref: "F-2024-043" },
    ],
    totalRevenue: 6400,
    totalInvoices: 3,
    totalPaid: 6400,
    totalUnpaid: 0,
    averagePaymentDelay: 27,
    lastInvoiceDate: "2024-03-01",
    lastPaymentDate: "2024-03-01",
    portalAccess: false,
    tags: ["Consulting"],
    createdAt: "2023-07-22",
  },
  {
    id: "C006",
    name: "Innovatech",
    type: "company",
    siret: "93612345678901",
    status: "at_risk",
    riskScore: "high",
    paymentTerms: "45days",
    billingAddress: { line1: "15 boulevard Innovation", city: "Toulouse", zip: "31000", country: "France" },
    contacts: [
      { id: "CT8", name: "Alice Petit", role: "DG", email: "a.petit@innovatech.fr", isPrimary: true },
    ],
    notes: [
      { id: "N3", text: "Impayé de 1200€ depuis 45 jours. Relances sans réponse. Envisager contentieux.", date: "2024-03-01", by: "Admin" },
    ],
    activity: [
      { id: "A12", type: "payment_late", title: "Retard critique", description: "F-2024-038 impayée depuis 45 jours", date: "2024-03-05", amount: 1200, ref: "F-2024-038" },
      { id: "A13", type: "reminder_sent", title: "Relance #3 envoyée", description: "Relance finale pour F-2024-038", date: "2024-03-01", ref: "F-2024-038" },
    ],
    totalRevenue: 4800,
    totalInvoices: 3,
    totalPaid: 3600,
    totalUnpaid: 1200,
    averagePaymentDelay: 52,
    lastInvoiceDate: "2024-01-18",
    lastPaymentDate: "2023-11-10",
    portalAccess: false,
    tags: ["Contentieux potentiel"],
    createdAt: "2023-01-05",
  },
  {
    id: "C007",
    name: "StartupXYZ",
    type: "company",
    siret: "10712345678901",
    status: "active",
    riskScore: "medium",
    paymentTerms: "immediate",
    billingAddress: { line1: "88 rue de la République", city: "Strasbourg", zip: "67000", country: "France" },
    contacts: [
      { id: "CT9", name: "Hugo Garnier", role: "CEO", email: "hugo@startupxyz.io", phone: "+33 3 88 00 00 01", isPrimary: true },
    ],
    notes: [],
    activity: [
      { id: "A14", type: "quote_accepted", title: "Devis accepté", description: "D-2024-027 accepté", date: "2024-02-28", amount: 4200 },
    ],
    totalRevenue: 4200,
    totalInvoices: 2,
    totalPaid: 4200,
    totalUnpaid: 0,
    averagePaymentDelay: 5,
    lastInvoiceDate: "2024-02-28",
    lastPaymentDate: "2024-03-02",
    portalAccess: true,
    portalEmail: "hugo@startupxyz.io",
    tags: ["Startup", "Nouveau client"],
    createdAt: "2024-01-10",
  },
  {
    id: "C008",
    name: "Cabinet Lebrun",
    type: "company",
    siret: "21812345678901",
    vatNumber: "FR21812345678",
    status: "inactive",
    riskScore: "low",
    paymentTerms: "30days",
    billingAddress: { line1: "5 place du Marché", city: "Lille", zip: "59000", country: "France" },
    contacts: [
      { id: "CT10", name: "Éric Lebrun", role: "Avocat associé", email: "e.lebrun@cabinetlebrun.fr", isPrimary: true },
    ],
    notes: [
      { id: "N4", text: "Client inactif depuis Q2 2023. Relancer pour nouveaux projets.", date: "2023-12-01", by: "Admin" },
    ],
    activity: [],
    totalRevenue: 3200,
    totalInvoices: 2,
    totalPaid: 3200,
    totalUnpaid: 0,
    averagePaymentDelay: 18,
    lastInvoiceDate: "2023-05-10",
    lastPaymentDate: "2023-05-28",
    portalAccess: false,
    tags: ["Inactif"],
    createdAt: "2022-11-03",
  },
];

export const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const activityTypeConfig: Record<CustomerActivity["type"], { label: string; color: string; icon: string }> = {
  invoice_sent: { label: "Facture envoyée", color: "text-info", icon: "📄" },
  invoice_paid: { label: "Facture payée", color: "text-success", icon: "✅" },
  quote_sent: { label: "Devis envoyé", color: "text-info", icon: "📋" },
  quote_accepted: { label: "Devis accepté", color: "text-success", icon: "🎉" },
  quote_rejected: { label: "Devis refusé", color: "text-destructive", icon: "❌" },
  reminder_sent: { label: "Relance envoyée", color: "text-warning", icon: "🔔" },
  note_added: { label: "Note ajoutée", color: "text-muted-foreground", icon: "📝" },
  payment_late: { label: "Retard de paiement", color: "text-destructive", icon: "⚠️" },
};
