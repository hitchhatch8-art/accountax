import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

const ProtectedRoute = () => {
  const { isAuthenticated, fetchInitialData } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
              <Toaster 
                position="top-right"
                toastOptions={{
                  className: 'glass-card text-foreground border-white/5 !bg-background/80 !backdrop-blur-xl !shadow-2xl',
                  duration: 4000,
                  style: {
                    background: 'transparent',
                    color: 'inherit',
                  }
                }}
              />
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
              </Routes>
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
