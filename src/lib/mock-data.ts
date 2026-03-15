// Mock data for LE BELVEDERE SaaS platform

export const dashboardKPIs = {
  revenueMonthly: 47_850,
  revenueQuarterly: 128_400,
  revenueAnnual: 485_200,
  revenueGrowth: 12.4,
  cashIn: 42_300,
  cashOut: 28_750,
  netResult: 13_550,
  margin: 32.1,
  unpaid: 8_420,
  unpaidCount: 7,
  dso: 34,
  invoicesPaid: 42,
  invoicesPending: 12,
  invoicesOverdue: 5,
  quotesWon: 18,
  quotesLost: 4,
  quotesPending: 9,
  conversionRate: 72,
};

export const revenueChartData = [
  { month: "Jan", revenue: 32000, expenses: 21000, profit: 11000 },
  { month: "Fév", revenue: 35000, expenses: 22500, profit: 12500 },
  { month: "Mar", revenue: 38500, expenses: 23000, profit: 15500 },
  { month: "Avr", revenue: 41200, expenses: 25000, profit: 16200 },
  { month: "Mai", revenue: 39800, expenses: 24500, profit: 15300 },
  { month: "Jun", revenue: 44500, expenses: 26000, profit: 18500 },
  { month: "Jul", revenue: 43200, expenses: 25800, profit: 17400 },
  { month: "Aoû", revenue: 40100, expenses: 24200, profit: 15900 },
  { month: "Sep", revenue: 46800, expenses: 27500, profit: 19300 },
  { month: "Oct", revenue: 45300, expenses: 26800, profit: 18500 },
  { month: "Nov", revenue: 48200, expenses: 28100, profit: 20100 },
  { month: "Déc", revenue: 47850, expenses: 28750, profit: 19100 },
];

export const cashflowForecast = [
  { period: "30j", optimistic: 52000, realistic: 46000, pessimistic: 38000 },
  { period: "60j", optimistic: 105000, realistic: 88000, pessimistic: 72000 },
  { period: "90j", optimistic: 162000, realistic: 132000, pessimistic: 104000 },
];

export const topClients = [
  { name: "Acme Corp", revenue: 18500, invoices: 8, status: "active" as const },
  { name: "TechFlow SAS", revenue: 12300, invoices: 5, status: "active" as const },
  { name: "Digital Wave", revenue: 9800, invoices: 4, status: "active" as const },
  { name: "Studio Créatif", revenue: 7200, invoices: 6, status: "warning" as const },
  { name: "Green Solutions", revenue: 6400, invoices: 3, status: "active" as const },
];

export const topProducts = [
  { name: "Développement web", revenue: 24500, count: 15 },
  { name: "Design UI/UX", revenue: 12800, count: 8 },
  { name: "Consulting stratégie", revenue: 8500, count: 4 },
  { name: "Maintenance", revenue: 6200, count: 12 },
  { name: "Formation", revenue: 4800, count: 3 },
];

export const alerts = [
  { type: "warning" as const, title: "Seuil TVA approchant", description: "CA annuel à 85% du seuil de franchise TVA", date: "Aujourd'hui" },
  { type: "danger" as const, title: "3 factures en retard > 30 jours", description: "Montant total : 4 250 €", date: "Aujourd'hui" },
  { type: "info" as const, title: "Déclaration URSSAF", description: "Échéance dans 12 jours", date: "21 mars" },
  { type: "success" as const, title: "Paiement reçu", description: "Acme Corp - Facture F-2024-042 : 3 200 €", date: "Hier" },
];

export const aiRecommendations = [
  { icon: "💡", title: "Relancer Digital Wave", description: "Facture F-2024-038 en retard de 15 jours. Historique de paiement : habituellement ponctuel.", action: "Envoyer relance" },
  { icon: "📊", title: "Augmenter tarif Maintenance", description: "Votre marge sur ce service est 18% sous la moyenne. Suggestion : +15%.", action: "Voir analyse" },
  { icon: "🎯", title: "Opportunité upsell", description: "TechFlow SAS pourrait être intéressé par du consulting basé sur leur historique.", action: "Créer devis" },
];

export const recentInvoices = [
  { id: "F-2024-047", client: "Acme Corp", amount: 4200, status: "paid" as const, date: "2024-03-08", dueDate: "2024-04-08" },
  { id: "F-2024-046", client: "TechFlow SAS", amount: 2800, status: "sent" as const, date: "2024-03-05", dueDate: "2024-04-05" },
  { id: "F-2024-045", client: "Digital Wave", amount: 1950, status: "overdue" as const, date: "2024-02-15", dueDate: "2024-03-15" },
  { id: "F-2024-044", client: "Studio Créatif", amount: 3100, status: "draft" as const, date: "2024-03-07", dueDate: "2024-04-07" },
  { id: "F-2024-043", client: "Green Solutions", amount: 1600, status: "paid" as const, date: "2024-03-01", dueDate: "2024-04-01" },
];

export const recentQuotes = [
  { id: "D-2024-031", client: "Acme Corp", amount: 8500, status: "accepted" as const, date: "2024-03-06" },
  { id: "D-2024-030", client: "NewCo", amount: 3200, status: "pending" as const, date: "2024-03-04" },
  { id: "D-2024-029", client: "TechFlow SAS", amount: 5600, status: "pending" as const, date: "2024-03-02" },
  { id: "D-2024-028", client: "OldClient", amount: 2100, status: "rejected" as const, date: "2024-02-28" },
];

// Admin mock data
export const adminStats = {
  totalOrgs: 1247,
  activeOrgs: 1089,
  totalUsers: 3842,
  mrr: 48500,
  arr: 582000,
  churn: 2.1,
  trialConversion: 34,
  activeTickets: 23,
  criticalIncidents: 0,
  aiUsageToday: 12450,
  aiQuotaUsed: 62,
};
