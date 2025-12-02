import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import LeadForm from './pages/LeadForm';
import ImportLeads from './pages/ImportLeads';
import LeadDetails from './pages/LeadDetails';
import LeadManagement from './pages/LeadManagement';
import LoginScreen from './pages/LoginScreen';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Wrapper para proteger rotas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><KanbanBoard /></ProtectedRoute>} />
      <Route path="/gestao" element={<ProtectedRoute><LeadManagement /></ProtectedRoute>} />
      <Route path="/novo" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
      <Route path="/importar" element={<ProtectedRoute><ImportLeads /></ProtectedRoute>} />
      <Route path="/lead/:id" element={<ProtectedRoute><LeadDetails /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;