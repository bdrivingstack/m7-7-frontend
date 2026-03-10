import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "@/components/layouts/PublicLayout";
import AppLayout from "@/components/layouts/AppLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import PortalLayout from "@/components/layouts/PortalLayout";

// Public pages
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import FeaturesPage from "@/pages/public/FeaturesPage";
import PricingPage from "@/pages/public/PricingPage";
import SecurityPage from "@/pages/public/SecurityPage";
import CompliancePage from "@/pages/public/CompliancePage";
import AIPage from "@/pages/public/AIPage";
import EInvoicingPage from "@/pages/public/EInvoicingPage";
import HelpPage from "@/pages/public/HelpPage";
import DocsPage from "@/pages/public/DocsPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";

// App pages
import DashboardPage from "@/pages/app/DashboardPage";
import PlaceholderPage from "@/pages/PlaceholderPage";

// Accounting pages
import AccountingOverviewPage from "@/pages/app/accounting/AccountingOverviewPage";
import RevenueBookPage from "@/pages/app/accounting/RevenueBookPage";
import PurchasesBookPage from "@/pages/app/accounting/PurchasesBookPage";
import BanksPage from "@/pages/app/accounting/BanksPage";
import TransactionsPage from "@/pages/app/accounting/TransactionsPage";
import CategoriesPage from "@/pages/app/accounting/CategoriesPage";
import ReconciliationPage from "@/pages/app/accounting/ReconciliationPage";

// Sales pages
import InvoicesListPage from "@/pages/app/sales/InvoicesListPage";
import InvoiceDetailPage from "@/pages/app/sales/InvoiceDetailPage";
import InvoiceCreatePage from "@/pages/app/sales/InvoiceCreatePage";
import QuotesListPage from "@/pages/app/sales/QuotesListPage";
import QuoteDetailPage from "@/pages/app/sales/QuoteDetailPage";
import CreditNotesPage from "@/pages/app/sales/CreditNotesPage";
import RemindersPage from "@/pages/app/sales/RemindersPage";

// Admin pages
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
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/e-invoicing" element={<EInvoicingPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>
          
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* App routes (enterprise tenant) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Sales */}
            <Route path="sales/quotes" element={<QuotesListPage />} />
            <Route path="sales/quotes/new" element={<PlaceholderPage />} />
            <Route path="sales/quotes/:id" element={<QuoteDetailPage />} />
            <Route path="sales/invoices" element={<InvoicesListPage />} />
            <Route path="sales/invoices/new" element={<InvoiceCreatePage />} />
            <Route path="sales/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="sales/credit-notes" element={<CreditNotesPage />} />
            <Route path="sales/recurring" element={<PlaceholderPage />} />
            <Route path="sales/reminders" element={<RemindersPage />} />
            <Route path="sales/payment-links" element={<PlaceholderPage />} />
            <Route path="sales/templates" element={<PlaceholderPage />} />
            <Route path="sales/e-invoicing" element={<PlaceholderPage />} />
            
            {/* Accounting */}
            <Route path="accounting/overview" element={<AccountingOverviewPage />} />
            <Route path="accounting/revenue-book" element={<RevenueBookPage />} />
            <Route path="accounting/purchases-book" element={<PurchasesBookPage />} />
            <Route path="accounting/banks" element={<BanksPage />} />
            <Route path="accounting/transactions" element={<TransactionsPage />} />
            <Route path="accounting/categories" element={<CategoriesPage />} />
            <Route path="accounting/vat" element={<PlaceholderPage />} />
            <Route path="accounting/social" element={<PlaceholderPage />} />
            <Route path="accounting/reconciliation" element={<ReconciliationPage />} />
            <Route path="accounting/exports" element={<PlaceholderPage />} />
            
            {/* Other modules */}
            <Route path="payments" element={<PlaceholderPage />} />
            <Route path="customers" element={<PlaceholderPage />} />
            <Route path="customers/:id" element={<PlaceholderPage />} />
            <Route path="productivity/board" element={<PlaceholderPage />} />
            <Route path="productivity/tasks" element={<PlaceholderPage />} />
            <Route path="productivity/time" element={<PlaceholderPage />} />
            <Route path="productivity/projects" element={<PlaceholderPage />} />
            <Route path="productivity/opportunities" element={<PlaceholderPage />} />
            <Route path="ai" element={<PlaceholderPage />} />
            <Route path="reports" element={<PlaceholderPage />} />
            <Route path="integrations" element={<PlaceholderPage />} />
            
            {/* Settings */}
            <Route path="settings/profile" element={<PlaceholderPage />} />
            <Route path="settings/company" element={<PlaceholderPage />} />
            <Route path="settings/users" element={<PlaceholderPage />} />
            <Route path="settings/security" element={<PlaceholderPage />} />
            <Route path="settings/billing" element={<PlaceholderPage />} />
            <Route path="settings/branding" element={<PlaceholderPage />} />
            <Route path="settings/email" element={<PlaceholderPage />} />
            <Route path="settings/payment" element={<PlaceholderPage />} />
            <Route path="settings/numbering" element={<PlaceholderPage />} />
            <Route path="settings/languages" element={<PlaceholderPage />} />
            <Route path="settings/vat" element={<PlaceholderPage />} />
            <Route path="settings/e-invoicing" element={<PlaceholderPage />} />
            <Route path="settings/audit-logs" element={<PlaceholderPage />} />
            <Route path="settings/api" element={<PlaceholderPage />} />
          </Route>

          {/* Admin backoffice routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="organizations" element={<PlaceholderPage />} />
            <Route path="organizations/:id" element={<PlaceholderPage />} />
            <Route path="users" element={<PlaceholderPage />} />
            <Route path="plans" element={<PlaceholderPage />} />
            <Route path="billing" element={<PlaceholderPage />} />
            <Route path="support" element={<PlaceholderPage />} />
            <Route path="incidents" element={<PlaceholderPage />} />
            <Route path="audit-logs" element={<PlaceholderPage />} />
            <Route path="integrations" element={<PlaceholderPage />} />
            <Route path="feature-flags" element={<PlaceholderPage />} />
            <Route path="ai" element={<PlaceholderPage />} />
            <Route path="security" element={<PlaceholderPage />} />
            <Route path="compliance" element={<PlaceholderPage />} />
            <Route path="e-invoicing" element={<PlaceholderPage />} />
            <Route path="monitoring" element={<PlaceholderPage />} />
            <Route path="settings" element={<PlaceholderPage />} />
          </Route>

          {/* Portal (client external access) */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboardPage />} />
            <Route path="quotes/:id" element={<PlaceholderPage />} />
            <Route path="invoices/:id" element={<PlaceholderPage />} />
            <Route path="payments/:id" element={<PlaceholderPage />} />
            <Route path="documents" element={<PlaceholderPage />} />
            <Route path="profile" element={<PlaceholderPage />} />
          </Route>
          <Route path="/portal/login" element={<PlaceholderPage />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
