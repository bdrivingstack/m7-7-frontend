import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PortalProtectedRoute from "@/components/auth/PortalProtectedRoute";

// Layouts
import PublicLayout from "@/components/layouts/PublicLayout";
import AppLayout from "@/components/layouts/AppLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import PortalLayout from "@/components/layouts/PortalLayout";
import DemoLayout from "@/components/layouts/DemoLayout";

// Public pages
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import FeaturesPage from "@/pages/public/FeaturesPage";
import PricingPage from "@/pages/public/PricingPage";
import PublicSecurityPage from "@/pages/public/SecurityPage";
import PublicCompliancePage from "@/pages/public/CompliancePage";
import AIPage from "@/pages/public/AIPage";
import EInvoicingPage from "@/pages/public/EInvoicingPage";
import HelpPage from "@/pages/public/HelpPage";
import DocsPage from "@/pages/public/DocsPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import TermsPage from "@/pages/public/TermsPage";
import LegalPage from "@/pages/public/LegalPage";
import ContactPage from "@/pages/public/ContactPage";

// App pages
import DashboardPage from "@/pages/app/DashboardPage";
import EInvoicingSalesPage from "@/pages/app/sales/EInvoicingSalesPage";

// Accounting pages
import AccountingOverviewPage from "@/pages/app/accounting/AccountingOverviewPage";
import RevenueBookPage from "@/pages/app/accounting/RevenueBookPage";
import PurchasesBookPage from "@/pages/app/accounting/PurchasesBookPage";
import BanksPage from "@/pages/app/accounting/BanksPage";
import TransactionsPage from "@/pages/app/accounting/TransactionsPage";
import CategoriesPage from "@/pages/app/accounting/CategoriesPage";
import ReconciliationPage from "@/pages/app/accounting/ReconciliationPage";

// Payments
import PaymentsPage from "@/pages/app/PaymentsPage";

// Portal pages
import PortalLoginPage from "@/pages/portal/PortalLoginPage";
import PortalInvoicesPage from "@/pages/portal/PortalInvoicesPage";
import PortalInvoiceDetailPage from "@/pages/portal/PortalInvoiceDetailPage";
import PortalQuotesPage from "@/pages/portal/PortalQuotesPage";
import PortalQuoteDetailPage from "@/pages/portal/PortalQuoteDetailPage";
import PortalPaymentsPage from "@/pages/portal/PortalPaymentsPage";
import PortalDocumentsPage from "@/pages/portal/PortalDocumentsPage";
import PortalProfilePage from "@/pages/portal/PortalProfilePage";

// Admin pages
import AdminOrganizationsPage from "@/pages/admin/AdminOrganizationsPage";
import AdminOrgDetailPage from "@/pages/admin/AdminOrgDetailPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminPlansPage from "@/pages/admin/AdminPlansPage";
import AdminBillingPage from "@/pages/admin/AdminBillingPage";
import AdminSupportPage from "@/pages/admin/AdminSupportPage";
import AdminIncidentsPage from "@/pages/admin/AdminIncidentsPage";
import AdminAuditLogsPage from "@/pages/admin/AdminAuditLogsPage";
import AdminIntegrationsPage from "@/pages/admin/AdminIntegrationsPage";
import AdminFeatureFlagsPage from "@/pages/admin/AdminFeatureFlagsPage";
import AdminAIPage from "@/pages/admin/AdminAIPage";
import AdminSecurityPage from "@/pages/admin/AdminSecurityPage";
import AdminCompliancePage from "@/pages/admin/AdminCompliancePage";
import AdminEInvoicingPage from "@/pages/admin/AdminEInvoicingPage";
import AdminMonitoringPage from "@/pages/admin/AdminMonitoringPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// Settings
import SettingsLayout from "@/pages/app/settings/SettingsLayout";
import ProfilePage from "@/pages/app/settings/ProfilePage";
import CompanyPage from "@/pages/app/settings/CompanyPage";
import UsersPage from "@/pages/app/settings/UsersPage";
import SecurityPage from "@/pages/app/settings/SecurityPage";
import BillingPage from "@/pages/app/settings/BillingPage";
import BrandingPage from "@/pages/app/settings/BrandingPage";
import EmailPage from "@/pages/app/settings/EmailPage";
import PaymentSettingsPage from "@/pages/app/settings/PaymentSettingsPage";
import NumberingPage from "@/pages/app/settings/NumberingPage";
import LanguagesPage from "@/pages/app/settings/LanguagesPage";
import VATSettingsPage from "@/pages/app/settings/VATSettingsPage";
import EInvoicingSettingsPage from "@/pages/app/settings/EInvoicingSettingsPage";
import AuditLogsPage from "@/pages/app/settings/AuditLogsPage";
import APISettingsPage from "@/pages/app/settings/APISettingsPage";

// Integrations & Reports & AI
import IntegrationsPage from "@/pages/app/IntegrationsPage";
import ReportsPage from "@/pages/app/ReportsPage";
import AIAssistantPage from "@/pages/app/AIAssistantPage";

// Productivity
import KanbanBoardPage from "@/pages/app/productivity/KanbanBoardPage";
import TasksPage from "@/pages/app/productivity/TasksPage";
import TimeTrackingPage from "@/pages/app/productivity/TimeTrackingPage";
import ProjectsPage from "@/pages/app/productivity/ProjectsPage";
import OpportunitiesPage from "@/pages/app/productivity/OpportunitiesPage";

// Accounting extra pages
import VATPage from "@/pages/app/accounting/VATPage";
import SocialPage from "@/pages/app/accounting/SocialPage";
import ExportsPage from "@/pages/app/accounting/ExportsPage";

// Sales pages
import InvoicesListPage from "@/pages/app/sales/InvoicesListPage";
import InvoiceDetailPage from "@/pages/app/sales/InvoiceDetailPage";
import InvoiceEditorPage from "@/pages/app/sales/InvoiceEditorPage";
import QuotesListPage from "@/pages/app/sales/QuotesListPage";
import QuoteDetailPage from "@/pages/app/sales/QuoteDetailPage";
import CreditNotesPage from "@/pages/app/sales/CreditNotesPage";
import RemindersPage from "@/pages/app/sales/RemindersPage";
import QuoteCreatePage from "@/pages/app/sales/QuoteCreatePage";
import RecurringPage from "@/pages/app/sales/RecurringPage";
import PaymentLinksPage from "@/pages/app/sales/PaymentLinksPage";
import TemplatesPage from "@/pages/app/sales/TemplatesPage";

// Customer pages
import CustomersListPage from "@/pages/app/CustomersListPage";
import CustomerDetailPage from "@/pages/app/CustomerDetailPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";

// Portal pages
import PortalDashboardPage from "@/pages/portal/PortalDashboardPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* ── Routes publiques ──────────────────────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/security" element={<PublicSecurityPage />} />
              <Route path="/compliance" element={<PublicCompliancePage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/e-invoicing" element={<EInvoicingPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* ── Auth (sans layout) ────────────────────────────────────────── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Mode Démo — sans connexion, données fictives ──────────────── */}
            <Route path="/demo" element={<DemoLayout />}>
              <Route index element={<Navigate to="/demo/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Ventes */}
              <Route path="sales/quotes" element={<QuotesListPage />} />
              <Route path="sales/quotes/new" element={<QuoteCreatePage />} />
              <Route path="sales/quotes/:id" element={<QuoteDetailPage />} />
              <Route path="sales/invoices" element={<InvoicesListPage />} />
              <Route path="sales/invoices/new" element={<InvoiceEditorPage />} />
              <Route path="sales/invoices/:id/edit" element={<InvoiceEditorPage />} />
              <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="sales/credit-notes" element={<CreditNotesPage />} />
              <Route path="sales/recurring" element={<RecurringPage />} />
              <Route path="sales/reminders" element={<RemindersPage />} />
              <Route path="sales/payment-links" element={<PaymentLinksPage />} />
              <Route path="sales/templates" element={<TemplatesPage />} />
              <Route path="sales/e-invoicing" element={<EInvoicingSalesPage />} />

              {/* Comptabilité */}
              <Route path="accounting/overview" element={<AccountingOverviewPage />} />
              <Route path="accounting/revenue-book" element={<RevenueBookPage />} />
              <Route path="accounting/purchases-book" element={<PurchasesBookPage />} />
              <Route path="accounting/banks" element={<BanksPage />} />
              <Route path="accounting/transactions" element={<TransactionsPage />} />
              <Route path="accounting/categories" element={<CategoriesPage />} />
              <Route path="accounting/vat" element={<VATPage />} />
              <Route path="accounting/social" element={<SocialPage />} />
              <Route path="accounting/reconciliation" element={<ReconciliationPage />} />
              <Route path="accounting/exports" element={<ExportsPage />} />

              {/* Autres modules */}
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="customers" element={<CustomersListPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="productivity/board" element={<KanbanBoardPage />} />
              <Route path="productivity/tasks" element={<TasksPage />} />
              <Route path="productivity/time" element={<TimeTrackingPage />} />
              <Route path="productivity/projects" element={<ProjectsPage />} />
              <Route path="productivity/opportunities" element={<OpportunitiesPage />} />
              <Route path="ai" element={<AIAssistantPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
            </Route>

            {/* ── App client — connexion requise ────────────────────────────── */}
            <Route
              path="/app"
              element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Ventes */}
              <Route path="sales/quotes" element={<QuotesListPage />} />
              <Route path="sales/quotes/new" element={<QuoteCreatePage />} />
              <Route path="sales/quotes/:id" element={<QuoteDetailPage />} />
              <Route path="sales/invoices" element={<InvoicesListPage />} />
              <Route path="sales/invoices/new" element={<InvoiceEditorPage />} />
              <Route path="sales/invoices/:id/edit" element={<InvoiceEditorPage />} />
              <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="sales/credit-notes" element={<CreditNotesPage />} />
              <Route path="sales/recurring" element={<RecurringPage />} />
              <Route path="sales/reminders" element={<RemindersPage />} />
              <Route path="sales/payment-links" element={<PaymentLinksPage />} />
              <Route path="sales/templates" element={<TemplatesPage />} />
              <Route path="sales/e-invoicing" element={<EInvoicingSalesPage />} />

              {/* Comptabilité */}
              <Route path="accounting/overview" element={<AccountingOverviewPage />} />
              <Route path="accounting/revenue-book" element={<RevenueBookPage />} />
              <Route path="accounting/purchases-book" element={<PurchasesBookPage />} />
              <Route path="accounting/banks" element={<BanksPage />} />
              <Route path="accounting/transactions" element={<TransactionsPage />} />
              <Route path="accounting/categories" element={<CategoriesPage />} />
              <Route path="accounting/vat" element={<VATPage />} />
              <Route path="accounting/social" element={<SocialPage />} />
              <Route path="accounting/reconciliation" element={<ReconciliationPage />} />
              <Route path="accounting/exports" element={<ExportsPage />} />

              {/* Autres modules */}
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="customers" element={<CustomersListPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="productivity/board" element={<KanbanBoardPage />} />
              <Route path="productivity/tasks" element={<TasksPage />} />
              <Route path="productivity/time" element={<TimeTrackingPage />} />
              <Route path="productivity/projects" element={<ProjectsPage />} />
              <Route path="productivity/opportunities" element={<OpportunitiesPage />} />
              <Route path="ai" element={<AIAssistantPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />

              {/* Paramètres */}
              <Route path="settings" element={<SettingsLayout />}>
                <Route path="profile"     element={<ProfilePage />} />
                <Route path="company"     element={<CompanyPage />} />
                <Route path="users"       element={<UsersPage />} />
                <Route path="security"    element={<SecurityPage />} />
                <Route path="billing"     element={<BillingPage />} />
                <Route path="branding"    element={<BrandingPage />} />
                <Route path="email"       element={<EmailPage />} />
                <Route path="payment"     element={<PaymentSettingsPage />} />
                <Route path="numbering"   element={<NumberingPage />} />
                <Route path="languages"   element={<LanguagesPage />} />
                <Route path="vat"         element={<VATSettingsPage />} />
                <Route path="e-invoicing" element={<EInvoicingSettingsPage />} />
                <Route path="audit-logs"  element={<AuditLogsPage />} />
                <Route path="api"         element={<APISettingsPage />} />
              </Route>
            </Route>

            {/* ── Admin backoffice — OWNER/ADMIN uniquement ─────────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["OWNER", "ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="organizations"     element={<AdminOrganizationsPage />} />
              <Route path="organizations/:id" element={<AdminOrgDetailPage />} />
              <Route path="users"             element={<AdminUsersPage />} />
              <Route path="plans"             element={<AdminPlansPage />} />
              <Route path="billing"           element={<AdminBillingPage />} />
              <Route path="support"           element={<AdminSupportPage />} />
              <Route path="incidents"         element={<AdminIncidentsPage />} />
              <Route path="audit-logs"        element={<AdminAuditLogsPage />} />
              <Route path="integrations"      element={<AdminIntegrationsPage />} />
              <Route path="feature-flags"     element={<AdminFeatureFlagsPage />} />
              <Route path="ai"                element={<AdminAIPage />} />
              <Route path="security"          element={<AdminSecurityPage />} />
              <Route path="compliance"        element={<AdminCompliancePage />} />
              <Route path="e-invoicing"       element={<AdminEInvoicingPage />} />
              <Route path="monitoring"        element={<AdminMonitoringPage />} />
              <Route path="settings"          element={<AdminSettingsPage />} />
            </Route>

            {/* ── Portail client ────────────────────────────────────────────── */}
            {/* Login public */}
            <Route path="/portal/login" element={<PortalLoginPage />} />

            {/* Espace client — session portal requise */}
            <Route
              path="/portal"
              element={
                <PortalProtectedRoute>
                  <PortalLayout />
                </PortalProtectedRoute>
              }
            >
              <Route index element={<PortalDashboardPage />} />
              <Route path="invoices"       element={<PortalInvoicesPage />} />
              <Route path="invoices/:id"   element={<PortalInvoiceDetailPage />} />
              <Route path="quotes"         element={<PortalQuotesPage />} />
              <Route path="quotes/:id"     element={<PortalQuoteDetailPage />} />
              <Route path="payments"       element={<PortalPaymentsPage />} />
              <Route path="documents"      element={<PortalDocumentsPage />} />
              <Route path="profile"        element={<PortalProfilePage />} />
            </Route>

            {/* ── 404 ──────────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
