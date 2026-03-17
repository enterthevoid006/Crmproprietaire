import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import { AuthProvider, useAuth } from './lib/auth.context';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RegisterConfirmPage } from './pages/RegisterConfirmPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ActorsListPage } from './modules/actors/pages/ActorsListPage';
import { CreateActorPage } from './modules/actors/pages/CreateActorPage';
import { ActorDetailsPage } from './modules/actors/pages/ActorDetailsPage';
import { OpportunitiesListPage } from './modules/opportunities/pages/OpportunitiesListPage';
import { CreateOpportunityPage } from './modules/opportunities/pages/CreateOpportunityPage';
import { OpportunityDetailsPage } from './modules/opportunities/pages/OpportunityDetailsPage';
import { TasksListPage } from './modules/tasks/pages/TasksListPage';
import { AgendaPage } from './modules/agenda/pages/AgendaPage';
import InvoicesListPage from './modules/finance/pages/InvoicesListPage';

import InvoiceEditorPage from './modules/finance/pages/InvoiceEditorPage';
import QuotesListPage from './modules/finance/pages/QuotesListPage';
import QuoteEditorPage from './modules/finance/pages/QuoteEditorPage';
import SettingsPage from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Simple Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'hsl(var(--surface-1))',
        color: 'hsl(var(--text-2))'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/confirm" element={<RegisterConfirmPage />} />
          <Route path="/verify/:token" element={<VerifyEmailPage />} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="actors" element={<ActorsListPage />} />
            <Route path="actors/new" element={<CreateActorPage />} />
            <Route path="actors/:id" element={<ActorDetailsPage />} />
            <Route path="opportunities" element={<OpportunitiesListPage />} />
            <Route path="opportunities/new" element={<CreateOpportunityPage />} />
            <Route path="opportunities/:id" element={<OpportunityDetailsPage />} />
            <Route path="tasks" element={<TasksListPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="finance/invoices" element={<InvoicesListPage />} />
            <Route path="finance/invoices/new" element={<InvoiceEditorPage />} />
            <Route path="finance/invoices/:id" element={<InvoiceEditorPage />} />
            <Route path="finance/quotes" element={<QuotesListPage />} />
            <Route path="finance/quotes/new" element={<QuoteEditorPage />} />
            <Route path="finance/quotes/:id" element={<QuoteEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
