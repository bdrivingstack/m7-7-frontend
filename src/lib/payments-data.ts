// Payments mock data

export type PaymentMethod = "virement" | "stripe" | "carte" | "prelevement" | "cheque" | "especes";
export type PaymentStatus = "completed" | "pending" | "failed" | "refunded" | "disputed";

export interface Payment {
  id: string;
  reference: string;
  client: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  invoiceId?: string;
  invoiceNumber?: string;
  bankAccount: string;
  description: string;
  stripeId?: string;
  fees?: number; // frais Stripe/CB
}

export interface PaymentAccount {
  id: string;
  name: string;
  type: "bank" | "stripe" | "paypal";
  balance: number;
  pending: number;
  currency: string;
  connected: boolean;
  lastSync: string;
  icon: string;
}

export const paymentMethodConfig: Record<PaymentMethod, { label: string; color: string; bg: string; icon: string }> = {
  virement: { label: "Virement", color: "text-blue-600", bg: "bg-blue-500/10", icon: "🏦" },
  stripe: { label: "Stripe", color: "text-violet-600", bg: "bg-violet-500/10", icon: "💳" },
  carte: { label: "Carte", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: "💳" },
  prelevement: { label: "Prélèvement", color: "text-orange-600", bg: "bg-orange-500/10", icon: "🔄" },
  cheque: { label: "Chèque", color: "text-slate-600", bg: "bg-slate-500/10", icon: "📄" },
  especes: { label: "Espèces", color: "text-green-700", bg: "bg-green-500/10", icon: "💵" },
};

export const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  completed: { label: "Encaissé", color: "bg-success/10 text-success" },
  pending: { label: "En attente", color: "bg-warning/10 text-warning" },
  failed: { label: "Échoué", color: "bg-destructive/10 text-destructive" },
  refunded: { label: "Remboursé", color: "bg-muted text-muted-foreground" },
  disputed: { label: "Contesté", color: "bg-orange-500/10 text-orange-500" },
};

export const payments: Payment[] = [
  { id: "PAY-001", reference: "PAY-2024-047", client: "Acme Corp", clientId: "C001", amount: 6852, method: "virement", status: "completed", date: "2024-03-08", invoiceId: "inv-1", invoiceNumber: "F-2024-047", bankAccount: "Qonto Principal", description: "Règlement F-2024-047" },
  { id: "PAY-002", reference: "PAY-2024-046", client: "Digital Wave", clientId: "C003", amount: 1950, method: "stripe", status: "completed", date: "2024-03-05", invoiceId: "inv-3", invoiceNumber: "F-2024-045", bankAccount: "Stripe", description: "Paiement en ligne F-2024-045", stripeId: "pi_3OxKaB2eZvKYlo2C0PmGZCLx", fees: 68 },
  { id: "PAY-003", reference: "PAY-2024-045", client: "Green Solutions", clientId: "C005", amount: 780, method: "virement", status: "completed", date: "2024-03-01", invoiceId: "inv-5", invoiceNumber: "F-2024-043", bankAccount: "Qonto Principal", description: "Maintenance mensuelle mars" },
  { id: "PAY-004", reference: "PAY-2024-044", client: "Acme Corp", clientId: "C001", amount: 3600, method: "virement", status: "completed", date: "2024-02-25", invoiceId: "inv-6", invoiceNumber: "F-2024-042", bankAccount: "Qonto Principal", description: "Acompte 50% F-2024-042" },
  { id: "PAY-005", reference: "PAY-2024-043", client: "TechFlow SAS", clientId: "C002", amount: 800, method: "prelevement", status: "completed", date: "2024-02-22", invoiceNumber: "F-2024-041", bankAccount: "Qonto Principal", description: "Maintenance mensuelle" },
  { id: "PAY-006", reference: "PAY-2024-042", client: "Studio Créatif", clientId: "C004", amount: 2400, method: "virement", status: "completed", date: "2024-02-15", invoiceNumber: "F-2024-040", bankAccount: "Qonto Principal", description: "Formation React" },
  { id: "PAY-007", reference: "PAY-2024-041", client: "Green Solutions", clientId: "C005", amount: 3500, method: "carte", status: "completed", date: "2024-02-10", invoiceNumber: "F-2024-039", bankAccount: "Stripe", description: "Consulting stratégie", stripeId: "pi_3OtKaB2eZvKYlo2C0PmGZCLy", fees: 122 },
  { id: "PAY-008", reference: "PAY-2024-040", client: "TechFlow SAS", clientId: "C002", amount: 2800, method: "stripe", status: "pending", date: "2024-03-09", invoiceNumber: "F-2024-046", bankAccount: "Stripe", description: "En attente de paiement", fees: 98 },
  { id: "PAY-009", reference: "PAY-2024-039", client: "Innovatech", clientId: "C006", amount: 1200, method: "virement", status: "failed", date: "2024-02-28", invoiceNumber: "F-2024-038", bankAccount: "Qonto Principal", description: "Virement retourné — IBAN invalide" },
  { id: "PAY-010", reference: "PAY-2024-038", client: "Studio Créatif", clientId: "C004", amount: 540, method: "stripe", status: "refunded", date: "2024-02-05", invoiceNumber: "AV-2024-003", bankAccount: "Stripe", description: "Remboursement avoir AV-2024-003", stripeId: "re_3OsKaB2eZvKYlo2C0RefABC", fees: -19 },
  { id: "PAY-011", reference: "PAY-2024-037", client: "StartupXYZ", clientId: "C007", amount: 4200, method: "carte", status: "completed", date: "2024-02-28", invoiceNumber: "D-2024-027", bankAccount: "Stripe", description: "Paiement devis D-2024-027", stripeId: "pi_3OqKaB2eZvKYlo2C0PmGZCLz", fees: 147 },
  { id: "PAY-012", reference: "PAY-2024-036", client: "Digital Wave", clientId: "C003", amount: 2750, method: "virement", status: "completed", date: "2024-02-01", invoiceNumber: "F-2024-038", bankAccount: "Qonto Principal", description: "Règlement F-2024-038" },
];

export const paymentAccounts: PaymentAccount[] = [
  { id: "ACC-01", name: "Qonto Principal", type: "bank", balance: 28450, pending: 0, currency: "EUR", connected: true, lastSync: "2024-03-09T08:00:00", icon: "🏦" },
  { id: "ACC-02", name: "Stripe", type: "stripe", balance: 4820, pending: 2800, currency: "EUR", connected: true, lastSync: "2024-03-09T09:15:00", icon: "💳" },
  { id: "ACC-03", name: "Boursorama Épargne", type: "bank", balance: 15000, pending: 0, currency: "EUR", connected: true, lastSync: "2024-03-09T08:00:00", icon: "💰" },
];

// Monthly cashflow for charts
export const monthlyCashflow = [
  { month: "Oct", in: 14200, out: 8500, net: 5700 },
  { month: "Nov", in: 18400, out: 9200, net: 9200 },
  { month: "Déc", in: 12100, out: 7800, net: 4300 },
  { month: "Jan", in: 9800, out: 6500, net: 3300 },
  { month: "Fév", in: 16250, out: 8900, net: 7350 },
  { month: "Mar", in: 11582, out: 4200, net: 7382 },
];

export const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
