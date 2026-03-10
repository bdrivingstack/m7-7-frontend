// Sales / Invoicing mock data

export type InvoiceStatus = "draft" | "validated" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
export type CreditNoteStatus = "draft" | "validated" | "sent";

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  clientId: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  vatTotal: number;
  total: number;
  paidAmount: number;
  notes: string;
  isRecurring: boolean;
  statusHistory: { status: InvoiceStatus; date: string; by: string }[];
}

export interface Quote {
  id: string;
  number: string;
  client: string;
  clientId: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  lines: InvoiceLine[];
  subtotal: number;
  vatTotal: number;
  total: number;
  notes: string;
  convertedInvoice?: string;
  statusHistory: { status: QuoteStatus; date: string; by: string }[];
}

const defaultLines: InvoiceLine[] = [
  { id: "L1", description: "Développement application web", quantity: 5, unitPrice: 650, vatRate: 20, discount: 0, total: 3250 },
  { id: "L2", description: "Design UI/UX", quantity: 3, unitPrice: 550, vatRate: 20, discount: 0, total: 1650 },
  { id: "L3", description: "Tests & recette", quantity: 2, unitPrice: 450, vatRate: 20, discount: 10, total: 810 },
];

const smallLines: InvoiceLine[] = [
  { id: "L1", description: "Consulting stratégie digitale", quantity: 1, unitPrice: 1200, vatRate: 20, discount: 0, total: 1200 },
  { id: "L2", description: "Audit SEO", quantity: 1, unitPrice: 800, vatRate: 20, discount: 0, total: 800 },
];

const maintenanceLines: InvoiceLine[] = [
  { id: "L1", description: "Maintenance mensuelle", quantity: 1, unitPrice: 450, vatRate: 20, discount: 0, total: 450 },
  { id: "L2", description: "Support prioritaire", quantity: 1, unitPrice: 200, vatRate: 20, discount: 0, total: 200 },
];

export const invoices: Invoice[] = [
  {
    id: "inv-1", number: "F-2024-047", client: "Acme Corp", clientId: "c1",
    date: "2024-03-08", dueDate: "2024-04-08", status: "paid",
    lines: defaultLines, subtotal: 5710, vatTotal: 1142, total: 6852, paidAmount: 6852,
    notes: "Projet refonte site corporate.", isRecurring: false,
    statusHistory: [
      { status: "draft", date: "2024-03-06", by: "Jean D." },
      { status: "validated", date: "2024-03-07", by: "Jean D." },
      { status: "sent", date: "2024-03-08", by: "Système" },
      { status: "paid", date: "2024-03-08", by: "Stripe" },
    ],
  },
  {
    id: "inv-2", number: "F-2024-046", client: "TechFlow SAS", clientId: "c2",
    date: "2024-03-05", dueDate: "2024-04-05", status: "sent",
    lines: smallLines, subtotal: 2000, vatTotal: 400, total: 2400, paidAmount: 0,
    notes: "Mission consulting Q1.", isRecurring: false,
    statusHistory: [
      { status: "draft", date: "2024-03-03", by: "Jean D." },
      { status: "validated", date: "2024-03-04", by: "Jean D." },
      { status: "sent", date: "2024-03-05", by: "Système" },
    ],
  },
  {
    id: "inv-3", number: "F-2024-045", client: "Digital Wave", clientId: "c3",
    date: "2024-02-15", dueDate: "2024-03-15", status: "overdue",
    lines: [{ id: "L1", description: "Développement module e-commerce", quantity: 4, unitPrice: 650, vatRate: 20, discount: 0, total: 2600 }],
    subtotal: 2600, vatTotal: 520, total: 3120, paidAmount: 0,
    notes: "", isRecurring: false,
    statusHistory: [
      { status: "draft", date: "2024-02-13", by: "Jean D." },
      { status: "validated", date: "2024-02-14", by: "Jean D." },
      { status: "sent", date: "2024-02-15", by: "Système" },
      { status: "overdue", date: "2024-03-16", by: "Système" },
    ],
  },
  {
    id: "inv-4", number: "F-2024-044", client: "Studio Créatif", clientId: "c4",
    date: "2024-03-07", dueDate: "2024-04-07", status: "draft",
    lines: defaultLines, subtotal: 5710, vatTotal: 1142, total: 6852, paidAmount: 0,
    notes: "Brouillon en attente de validation.", isRecurring: false,
    statusHistory: [{ status: "draft", date: "2024-03-07", by: "Jean D." }],
  },
  {
    id: "inv-5", number: "F-2024-043", client: "Green Solutions", clientId: "c5",
    date: "2024-03-01", dueDate: "2024-04-01", status: "paid",
    lines: maintenanceLines, subtotal: 650, vatTotal: 130, total: 780, paidAmount: 780,
    notes: "", isRecurring: true,
    statusHistory: [
      { status: "draft", date: "2024-02-28", by: "Récurrence" },
      { status: "validated", date: "2024-02-28", by: "Système" },
      { status: "sent", date: "2024-03-01", by: "Système" },
      { status: "paid", date: "2024-03-05", by: "Stripe" },
    ],
  },
  {
    id: "inv-6", number: "F-2024-042", client: "Acme Corp", clientId: "c1",
    date: "2024-02-20", dueDate: "2024-03-20", status: "partially_paid",
    lines: [
      { id: "L1", description: "Phase 1 - Maquettes", quantity: 1, unitPrice: 2500, vatRate: 20, discount: 0, total: 2500 },
      { id: "L2", description: "Phase 2 - Intégration", quantity: 1, unitPrice: 3500, vatRate: 20, discount: 0, total: 3500 },
    ],
    subtotal: 6000, vatTotal: 1200, total: 7200, paidAmount: 3600,
    notes: "Acompte de 50% reçu.", isRecurring: false,
    statusHistory: [
      { status: "draft", date: "2024-02-18", by: "Jean D." },
      { status: "validated", date: "2024-02-19", by: "Jean D." },
      { status: "sent", date: "2024-02-20", by: "Système" },
      { status: "partially_paid", date: "2024-02-25", by: "Stripe" },
    ],
  },
];

export const quotes: Quote[] = [
  {
    id: "qt-1", number: "D-2024-031", client: "Acme Corp", clientId: "c1",
    date: "2024-03-06", validUntil: "2024-04-06", status: "accepted",
    lines: defaultLines, subtotal: 5710, vatTotal: 1142, total: 6852,
    notes: "Devis accepté, facture F-2024-047 générée.", convertedInvoice: "F-2024-047",
    statusHistory: [
      { status: "draft", date: "2024-03-04", by: "Jean D." },
      { status: "sent", date: "2024-03-05", by: "Système" },
      { status: "accepted", date: "2024-03-06", by: "Client" },
      { status: "converted", date: "2024-03-06", by: "Système" },
    ],
  },
  {
    id: "qt-2", number: "D-2024-030", client: "NewCo", clientId: "c6",
    date: "2024-03-04", validUntil: "2024-04-04", status: "sent",
    lines: smallLines, subtotal: 2000, vatTotal: 400, total: 2400,
    notes: "En attente de réponse client.",
    statusHistory: [
      { status: "draft", date: "2024-03-02", by: "Jean D." },
      { status: "sent", date: "2024-03-04", by: "Système" },
    ],
  },
  {
    id: "qt-3", number: "D-2024-029", client: "TechFlow SAS", clientId: "c2",
    date: "2024-03-02", validUntil: "2024-04-02", status: "sent",
    lines: [
      { id: "L1", description: "Migration cloud", quantity: 8, unitPrice: 700, vatRate: 20, discount: 5, total: 5320 },
    ],
    subtotal: 5320, vatTotal: 1064, total: 6384,
    notes: "Relance prévue le 15 mars.",
    statusHistory: [
      { status: "draft", date: "2024-02-28", by: "Jean D." },
      { status: "sent", date: "2024-03-02", by: "Système" },
    ],
  },
  {
    id: "qt-4", number: "D-2024-028", client: "OldClient", clientId: "c7",
    date: "2024-02-28", validUntil: "2024-03-28", status: "rejected",
    lines: maintenanceLines, subtotal: 650, vatTotal: 130, total: 780,
    notes: "Client a choisi un autre prestataire.",
    statusHistory: [
      { status: "draft", date: "2024-02-25", by: "Jean D." },
      { status: "sent", date: "2024-02-26", by: "Système" },
      { status: "rejected", date: "2024-02-28", by: "Client" },
    ],
  },
  {
    id: "qt-5", number: "D-2024-027", client: "Digital Wave", clientId: "c3",
    date: "2024-02-20", validUntil: "2024-03-20", status: "expired",
    lines: defaultLines, subtotal: 5710, vatTotal: 1142, total: 6852,
    notes: "Devis expiré sans réponse.",
    statusHistory: [
      { status: "draft", date: "2024-02-18", by: "Jean D." },
      { status: "sent", date: "2024-02-20", by: "Système" },
      { status: "expired", date: "2024-03-21", by: "Système" },
    ],
  },
];

export const creditNotes = [
  {
    id: "cn-1", number: "AV-2024-003", client: "Studio Créatif", clientId: "c4",
    date: "2024-03-01", relatedInvoice: "F-2024-035", status: "validated" as CreditNoteStatus,
    reason: "Erreur de quantité sur la facture initiale",
    lines: [{ id: "L1", description: "Correction quantité Formation", quantity: -1, unitPrice: 450, vatRate: 20, discount: 0, total: -450 }],
    subtotal: -450, vatTotal: -90, total: -540,
  },
  {
    id: "cn-2", number: "AV-2024-002", client: "TechFlow SAS", clientId: "c2",
    date: "2024-02-15", relatedInvoice: "F-2024-030", status: "sent" as CreditNoteStatus,
    reason: "Annulation prestation consulting",
    lines: [{ id: "L1", description: "Consulting annulé", quantity: -1, unitPrice: 1200, vatRate: 20, discount: 0, total: -1200 }],
    subtotal: -1200, vatTotal: -240, total: -1440,
  },
];

export const reminderRules = [
  { id: "rr-1", name: "Rappel J+7", delay: 7, active: true, template: "Relance amicale", sent: 12 },
  { id: "rr-2", name: "Rappel J+15", delay: 15, active: true, template: "Relance ferme", sent: 8 },
  { id: "rr-3", name: "Mise en demeure J+30", delay: 30, active: true, template: "Mise en demeure", sent: 3 },
  { id: "rr-4", name: "Rappel J+45", delay: 45, active: false, template: "Dernière relance", sent: 0 },
];

export const reminderEvents = [
  { id: "re-1", invoice: "F-2024-045", client: "Digital Wave", rule: "Rappel J+15", date: "2024-03-02", status: "sent" as const },
  { id: "re-2", invoice: "F-2024-045", client: "Digital Wave", rule: "Rappel J+7", date: "2024-02-22", status: "sent" as const },
  { id: "re-3", invoice: "F-2024-042", client: "Acme Corp", rule: "Rappel J+7", date: "2024-02-27", status: "sent" as const },
  { id: "re-4", invoice: "F-2024-038", client: "Digital Wave", rule: "Mise en demeure J+30", date: "2024-03-05", status: "sent" as const },
];

// Status configuration
export const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  validated: { label: "Validée", color: "bg-info/10 text-info" },
  sent: { label: "Envoyée", color: "bg-info/10 text-info" },
  partially_paid: { label: "Partielle", color: "bg-warning/10 text-warning" },
  paid: { label: "Payée", color: "bg-success/10 text-success" },
  overdue: { label: "En retard", color: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Annulée", color: "bg-muted text-muted-foreground" },
};

export const quoteStatusConfig: Record<QuoteStatus, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  sent: { label: "Envoyé", color: "bg-info/10 text-info" },
  accepted: { label: "Accepté", color: "bg-success/10 text-success" },
  rejected: { label: "Refusé", color: "bg-destructive/10 text-destructive" },
  expired: { label: "Expiré", color: "bg-muted text-muted-foreground" },
  converted: { label: "Converti", color: "bg-primary/10 text-primary" },
};

export const fmtEUR = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
