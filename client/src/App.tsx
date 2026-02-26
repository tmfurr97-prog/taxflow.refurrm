import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import AppShell from "./components/AppShell";

// Public pages
import Landing from "./components/pages/Landing";
import Pricing from "./components/pages/Pricing";
import Features from "./components/pages/Features";
import BlogList from "./components/pages/BlogList";
import BlogPost from "./components/pages/BlogPost";
import Terms from "./components/pages/Terms";
import Privacy from "./components/pages/Privacy";

// Auth pages
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import VerifyEmail from "./components/auth/VerifyEmail";
import PasswordReset from "./components/auth/PasswordReset";

// App pages (authenticated)
import Dashboard from "./components/pages/Dashboard";
import Profile from "./components/pages/Profile";
import TaxGPTPage from "./components/pages/TaxGPTPage";
import NotaryServices from "./components/pages/NotaryServices";

// Tax feature components
import Receipts from "./components/pages/Receipts";
import BusinessEntities from "./components/pages/BusinessEntities";
import AuditDefense from "./components/pages/AuditDefense";
import Backups from "./components/pages/Backups";
import EFile from "./components/pages/EFile";
import RemoteReturns from "./components/pages/RemoteReturns";
import CryptoTaxes from "./components/pages/CryptoTaxes";
import Academy from "./components/pages/Academy";
import { QuarterlyPayments } from "./components/QuarterlyPayments";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/reset-password" component={PasswordReset} />

      {/* App routes (wrapped in AppShell) */}
      <Route path="/dashboard">
        {() => <AppShell><Dashboard /></AppShell>}
      </Route>
      <Route path="/taxgpt">
        {() => <AppShell><TaxGPTPage /></AppShell>}
      </Route>
      <Route path="/receipts">
        {() => <AppShell><Receipts /></AppShell>}
      </Route>
      <Route path="/quarterly">
        {() => <AppShell><QuarterlyPayments estimatedAmount={0} /></AppShell>}
      </Route>
      <Route path="/business-entities">
        {() => <AppShell><BusinessEntities /></AppShell>}
      </Route>
      <Route path="/crypto">
        {() => <AppShell><CryptoTaxes /></AppShell>}
      </Route>
      <Route path="/audit-defense">
        {() => <AppShell><AuditDefense /></AppShell>}
      </Route>
      <Route path="/efile">
        {() => <AppShell><EFile /></AppShell>}
      </Route>
      <Route path="/remote-returns">
        {() => <AppShell><RemoteReturns /></AppShell>}
      </Route>
      <Route path="/notary">
        {() => <AppShell><NotaryServices /></AppShell>}
      </Route>
      <Route path="/backups">
        {() => <AppShell><Backups /></AppShell>}
      </Route>
      <Route path="/academy">
        {() => <AppShell><Academy /></AppShell>}
      </Route>
      <Route path="/profile">
        {() => <AppShell><Profile /></AppShell>}
      </Route>

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
