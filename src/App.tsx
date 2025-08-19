import "@fontsource/lato/index.css";
import { Suspense } from 'react';
import { useAppSelector } from './lib/redux/hooks/typedHooks';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/layout/layout";
import LoadingSpinner from './components/LoadingSpinner';
import CustomersPage from "./pages/customers";
import NotFound from "./pages/not-found";
import { theme } from "./theme";
import LoginData from "./pages/login-v2";
// import RequireAuth from "./components/RequireAuth"; // Fixed import path
import RequireAuth from "./lib/RequiredAuth";
import { Toaster } from 'react-hot-toast'; 

// pages
import StakeHolders from "./pages/stakeholders/page";
import SingleStakeholder from "./pages/stakeholders/stakeholder";
import CustomerDashboard from "./pages/customer-dashboard";
import ClientDashboard from "./pages/client-dashboard";
// persons page
import Persons from "./pages/persons/page";
import SinglePerson from "./pages/persons/persondetails";
import SustainabilityAnalyzerForm from "./components/SustainabilityAnalyzerForm";
import Restricted from "./pages/restricted";
import ClientsPage from "./pages/clients";
import CreateClient from "./pages/admin/create-client";
// import AcceptInvitationPage from "./pages/client-admin/accept-invite/accept-invitation";
import AcceptClientInvitePage from "./pages/client-admin/accept-invite/accept-invitation";
import ClientAdminRequestLoginPage from "./pages/client-admin/auth/request-login";
import LoginClientAdminInWithTokenPage from "./pages/client-admin/auth/login-with-token";
import StakeholderAcceptInvitePage from "./pages/stakeholder/invitation/accept-invite";
import StakeholderRegisterPage from "./pages/stakeholder/invitation/register";
import StakeholderPendingApprovalPage from "./pages/stakeholder/invitation/pending-approval";
import StakeholderRequestLoginPage from "./pages/stakeholder/auth/request-login";
import StakeholderLoginWithTokenPage from "./pages/stakeholder/auth/login-with-token";
import ClientAdminDashboardPage from "./pages/dashboard-client-admin/dashboard";
import StakeholderDashboardPage from "./pages/dashboard-stakeholder/dashboard";
import EsgCheck from "./pages/admin/main-dashboard";
import ClientAdminOwnerDashboardPage from "./pages/clientadmin-dashboard";
import UpdatedClientAdminDashboardPage from "./pages/dashboard-updated-clientadmin";
import StakeholderAnalysisUI from "./pages/dashboard-client-admin/stakeholder";
import ClientAdminDashboardLayout from "./pages/_client-admin-dashboard";
import ClientESGPage from "./pages/_client-admin-dashboard/esg";
import ClientStakeholderPage from "./pages/_client-admin-dashboard/stakeholder";
import ClientEsgCheckDashboard from "./pages/_client-admin-dashboard/esg";
import ClientStakeholderAnalysisDashboardPage from "./pages/_client-admin-dashboard/stakeholder";
import ClientDoppelteDashboardPage from "./pages/_client-admin-dashboard/doppelte-wesentlichkeit";
import StakeholderAnalysisGroupDashboard from "./pages/_client-admin-dashboard/stakeholder-analysis";

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <BrowserRouter>
        <AppContent isAuthenticated={isAuthenticated} />
      </BrowserRouter>
    </Suspense>
  );
}

function AppContent({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: '#4CAF50',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#F44336',
              color: 'white',
            },
          },
        }}
      />
      
      <Layout currentPath={currentPath} isAuthenticated={isAuthenticated}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/clients" replace /> : <LoginData />}
          />
          
          {/* Root redirect */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/clients" replace /> : <Navigate to="/login" replace />}
          />
          
          {/* -----------------Public Routes: Client Admin Start ------------------------ */}
            {/* Accept Invitation Link from Email  */}
            <Route path="/client-admin/accept-invitation/:token/" element={<AcceptClientInvitePage />} />

            <Route path="/client-admin/updated-data" element={<UpdatedClientAdminDashboardPage />} />
            {/* Request Login Page */}
            <Route path="/client-admin/request-login/" element={<ClientAdminRequestLoginPage />} />

            {/* Login with Token Page */}
            <Route path="/client-admin/login/:token/" element={<LoginClientAdminInWithTokenPage />} />
            
            <Route path="/esg-check" element={<EsgCheck />} />

            <Route path="/client-admin/stakeholders/" element={<StakeholderAnalysisUI/>} />

            {/* --------------------------------------------------------
                Public Routes: Client Admin End 
            --------------------------------------------------------------- */}

            {/* --------------------------------------------------------
                Public Routes: Stakeholder Start
              --------------------------------------------------------------- */}
            {/* Stakeholder : Accept Invitation  */}
            <Route path="/stakeholder/accept-invitation/:token/" element={<StakeholderAcceptInvitePage />} />
              
            {/* Stakeholder : Registration  */}
            <Route path="/stakeholder/register/" element={<StakeholderRegisterPage />} />
            
            {/* Stakeholder : Pending Approval  */}
            <Route path="/stakeholder/pending/" element={<StakeholderPendingApprovalPage />} />
                
            {/* Stakeholder : Request login  */}
            <Route path="/stakeholder/request-login/" element={<StakeholderRequestLoginPage />} />

            <Route path="/stakeholder/login/:token/" element={<StakeholderLoginWithTokenPage />} />
              
            
          {/* -------------- Protected Routes -------------------------------- */}
          <Route element={<RequireAuth />}>
            {/* Stakeholders */}
            <Route path="/stakeholders" element={<StakeHolders />} />
            <Route path="/stakeholder/:id" element={<SingleStakeholder />} />

            {/* Persons */}
            <Route path="/persons" element={<Persons />} />
            <Route path="/persons/:id" element={<SinglePerson />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id/dashboard/*" element={<CustomerDashboard />} />

 
            {/* ----------------- Admin Start ------------------------ */}
              {/* Client */}
              <Route path="/clients" element={<ClientsPage />} />
              
              <Route path="/clients/:id/dashboard/*" element={<ClientDashboard />} />
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/client-admin/dashboard/" element={<ClientAdminDashboardPage />} />
              <Route path="/client-admin/dashboard/esg/" element={<ClientAdminOwnerDashboardPage />} />

              {/* ------ UPDATED ROUTES START ----  */}
              <Route path="/client/dashboard/" element={<ClientAdminDashboardLayout />} >
                <Route path="/client/dashboard/esg-check" element={<ClientEsgCheckDashboard />} />
                {/* static */}
                {/* <Route path="/client/dashboard/stakeholder" element={<ClientStakeholderAnalysisDashboardPage />} /> */}
                 {/* dynamic */}
                 <Route path="/client/dashboard/stakeholder" element={<StakeholderAnalysisGroupDashboard />} />
                <Route path="/client/dashboard/doppelte-wesentlichkeit" element={<ClientDoppelteDashboardPage />} />
               
                
              </Route>
              {/* ------ UPDATED ROUTES END ----  */}
               
            {/* ----------------- Admin end ------------------------ */}

           {/* ----------------- Stakeholder Start ------------------------ */}
              <Route path="/stakeholder/dashboard/" element={<StakeholderDashboardPage />} />

            {/* Restricted  */}
            <Route path="/restricted" element={<Restricted />} />
          </Route>

          {/* Sample form - decide if this should be protected or public */}
          <Route
            path="/sample-form"
            element={isAuthenticated ? <SustainabilityAnalyzerForm /> : <Navigate to="/login" replace />}
          />

          {/* Catch-all route */}
          <Route 
            path="*" 
            element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;