// Accounting mock data

export const revenueBookEntries = [
  { id: "R-001", date: "2024-03-08", description: "Facture F-2024-047 - Acme Corp", category: "Développement web", amount: 4200, vat: 840, net: 3360, invoiceId: "F-2024-047", paymentMethod: "Virement" },
  { id: "R-002", date: "2024-03-05", description: "Facture F-2024-045 - Digital Wave", category: "Design UI/UX", amount: 1950, vat: 390, net: 1560, invoiceId: "F-2024-045", paymentMethod: "Carte" },
  { id: "R-003", date: "2024-03-01", description: "Facture F-2024-043 - Green Solutions", category: "Consulting", amount: 1600, vat: 320, net: 1280, invoiceId: "F-2024-043", paymentMethod: "Virement" },
  { id: "R-004", date: "2024-02-28", description: "Facture F-2024-042 - Acme Corp", category: "Développement web", amount: 3200, vat: 640, net: 2560, invoiceId: "F-2024-042", paymentMethod: "Virement" },
  { id: "R-005", date: "2024-02-22", description: "Facture F-2024-041 - TechFlow SAS", category: "Maintenance", amount: 800, vat: 160, net: 640, invoiceId: "F-2024-041", paymentMethod: "Prélèvement" },
  { id: "R-006", date: "2024-02-15", description: "Facture F-2024-040 - Studio Créatif", category: "Formation", amount: 2400, vat: 480, net: 1920, invoiceId: "F-2024-040", paymentMethod: "Virement" },
  { id: "R-007", date: "2024-02-10", description: "Facture F-2024-039 - Green Solutions", category: "Consulting", amount: 3500, vat: 700, net: 2800, invoiceId: "F-2024-039", paymentMethod: "Carte" },
  { id: "R-008", date: "2024-02-01", description: "Facture F-2024-038 - Digital Wave", category: "Design UI/UX", amount: 2750, vat: 550, net: 2200, invoiceId: "F-2024-038", paymentMethod: "Virement" },
];

export const purchaseBookEntries = [
  { id: "A-001", date: "2024-03-07", description: "Hébergement Vercel", category: "Hébergement", amount: 240, vat: 48, net: 192, supplier: "Vercel Inc." },
  { id: "A-002", date: "2024-03-05", description: "Licence Figma", category: "Logiciels", amount: 144, vat: 28.8, net: 115.2, supplier: "Figma" },
  { id: "A-003", date: "2024-03-01", description: "Abonnement Notion", category: "Logiciels", amount: 96, vat: 19.2, net: 76.8, supplier: "Notion Labs" },
  { id: "A-004", date: "2024-02-28", description: "Fournitures bureau", category: "Fournitures", amount: 185, vat: 37, net: 148, supplier: "Amazon" },
  { id: "A-005", date: "2024-02-20", description: "Assurance RC Pro", category: "Assurance", amount: 480, vat: 0, net: 480, supplier: "AXA" },
  { id: "A-006", date: "2024-02-15", description: "Domaine + DNS", category: "Hébergement", amount: 65, vat: 13, net: 52, supplier: "Cloudflare" },
];

export const bankTransactions = [
  { id: "TX-001", date: "2024-03-08", label: "VIR ACME CORP F-2024-047", amount: 4200, type: "credit" as const, category: "Développement web", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-002", date: "2024-03-07", label: "CB VERCEL.COM", amount: -240, type: "debit" as const, category: "Hébergement", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-003", date: "2024-03-06", label: "VIR URSSAF COTIS T1", amount: -1842, type: "debit" as const, category: "Cotisations sociales", categorized: true, matched: false, bankAccount: "Qonto Principal" },
  { id: "TX-004", date: "2024-03-05", label: "CB FIGMA.COM", amount: -144, type: "debit" as const, category: "Logiciels", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-005", date: "2024-03-05", label: "STRIPE PAIEMENT DIGITAL WAVE", amount: 1950, type: "credit" as const, category: null, categorized: false, matched: false, bankAccount: "Qonto Principal" },
  { id: "TX-006", date: "2024-03-04", label: "CB AMAZON.FR", amount: -67, type: "debit" as const, category: null, categorized: false, matched: false, bankAccount: "Qonto Principal" },
  { id: "TX-007", date: "2024-03-03", label: "VIR LOYER BUREAU MARS", amount: -950, type: "debit" as const, category: "Loyer", categorized: true, matched: false, bankAccount: "Qonto Principal" },
  { id: "TX-008", date: "2024-03-01", label: "VIR GREEN SOLUTIONS", amount: 1600, type: "credit" as const, category: "Consulting", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-009", date: "2024-02-28", label: "CB NOTION.SO", amount: -96, type: "debit" as const, category: "Logiciels", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-010", date: "2024-02-28", label: "PRLV ASSURANCE AXA", amount: -480, type: "debit" as const, category: "Assurance", categorized: true, matched: true, bankAccount: "Qonto Principal" },
  { id: "TX-011", date: "2024-02-27", label: "CB RESTAURANT CLIENT", amount: -85, type: "debit" as const, category: null, categorized: false, matched: false, bankAccount: "Qonto Principal" },
  { id: "TX-012", date: "2024-02-25", label: "VIR ACME CORP F-2024-042", amount: 3200, type: "credit" as const, category: "Développement web", categorized: true, matched: true, bankAccount: "Qonto Principal" },
];

export const accountingCategories = [
  { id: "CAT-01", name: "Développement web", type: "revenue" as const, count: 15, total: 24500, color: "hsl(250 75% 57%)" },
  { id: "CAT-02", name: "Design UI/UX", type: "revenue" as const, count: 8, total: 12800, color: "hsl(265 85% 65%)" },
  { id: "CAT-03", name: "Consulting", type: "revenue" as const, count: 4, total: 8500, color: "hsl(165 70% 42%)" },
  { id: "CAT-04", name: "Maintenance", type: "revenue" as const, count: 12, total: 6200, color: "hsl(210 90% 56%)" },
  { id: "CAT-05", name: "Formation", type: "revenue" as const, count: 3, total: 4800, color: "hsl(38 92% 50%)" },
  { id: "CAT-06", name: "Hébergement", type: "expense" as const, count: 6, total: 1820, color: "hsl(0 72% 55%)" },
  { id: "CAT-07", name: "Logiciels", type: "expense" as const, count: 14, total: 3200, color: "hsl(20 85% 55%)" },
  { id: "CAT-08", name: "Fournitures", type: "expense" as const, count: 4, total: 740, color: "hsl(280 60% 50%)" },
  { id: "CAT-09", name: "Assurance", type: "expense" as const, count: 2, total: 960, color: "hsl(340 65% 50%)" },
  { id: "CAT-10", name: "Loyer", type: "expense" as const, count: 3, total: 2850, color: "hsl(190 70% 45%)" },
  { id: "CAT-11", name: "Cotisations sociales", type: "expense" as const, count: 4, total: 7368, color: "hsl(30 80% 50%)" },
  { id: "CAT-12", name: "Frais de repas", type: "expense" as const, count: 8, total: 520, color: "hsl(150 50% 45%)" },
];

export const bankAccounts = [
  { id: "BA-01", name: "Qonto Principal", bank: "Qonto", iban: "FR76 •••• •••• 4821", balance: 28450, lastSync: "2024-03-08T14:30:00", status: "connected" as const },
  { id: "BA-02", name: "Épargne Pro", bank: "Boursorama", iban: "FR76 •••• •••• 9032", balance: 15000, lastSync: "2024-03-08T08:00:00", status: "connected" as const },
];

export const reconciliationItems = [
  { transactionId: "TX-001", invoiceId: "F-2024-047", amount: 4200, date: "2024-03-08", status: "matched" as const },
  { transactionId: "TX-002", invoiceId: "A-001", amount: 240, date: "2024-03-07", status: "matched" as const },
  { transactionId: "TX-005", invoiceId: null, amount: 1950, date: "2024-03-05", status: "unmatched" as const },
  { transactionId: "TX-006", invoiceId: null, amount: 67, date: "2024-03-04", status: "unmatched" as const },
  { transactionId: "TX-008", invoiceId: "F-2024-043", amount: 1600, date: "2024-03-01", status: "matched" as const },
  { transactionId: "TX-011", invoiceId: null, amount: 85, date: "2024-02-27", status: "unmatched" as const },
  { transactionId: "TX-012", invoiceId: "F-2024-042", amount: 3200, date: "2024-02-25", status: "matched" as const },
];

export const vatSummary = {
  collected: 3150,
  deductible: 825,
  due: 2325,
  period: "T1 2024",
  deadline: "2024-04-20",
};

export const socialContributions = {
  estimated: 5420,
  paid: 3678,
  remaining: 1742,
  rate: 22,
  nextDeadline: "2024-04-15",
  period: "T1 2024",
};

export const accountingOverviewStats = {
  totalRevenue: 47850,
  totalExpenses: 28750,
  netResult: 19100,
  vatCollected: 3150,
  vatDeductible: 825,
  vatDue: 2325,
  uncategorized: 3,
  unreconciled: 3,
  bankBalance: 43450,
};
