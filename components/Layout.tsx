import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, Upload, Menu, X, Database, LogOut, Shield, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Se não estiver logado, mostra apenas o conteúdo (LoginScreen controla o layout)
  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Kanban (Fluxo)', icon: Users },
    { path: '/gestao', label: 'Gestão de Base', icon: Database },
    { path: '/novo', label: 'Novo Lead', icon: PlusCircle },
    { path: '/importar', label: 'Importar CSV', icon: Upload },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-900 dark:bg-slate-950 text-white shadow-xl relative z-10">
        <div className="p-6 border-b border-brand-800 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-wider">OneConsig</h1>
            <p className="text-xs text-brand-200 mt-1">Olá, {user.nome}</p>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-lg bg-brand-800 dark:bg-slate-800 hover:bg-brand-700 dark:hover:bg-slate-700 text-brand-100 dark:text-slate-300 transition-colors"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-brand-600 dark:bg-brand-700 text-white shadow-md'
                  : 'text-brand-100 dark:text-slate-400 hover:bg-brand-800 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* BOTÃO ADMIN EXCLUSIVO */}
          {user.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-brand-700 dark:border-slate-800">
              <p className="px-4 text-xs font-bold text-brand-400 dark:text-slate-500 uppercase mb-2">Administrador</p>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin') ? 'bg-purple-600 text-white' : 'text-purple-200 hover:bg-purple-900 dark:hover:bg-purple-900/50'
                }`}
              >
                <Shield size={20} />
                <span className="font-medium">Painel Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-brand-800 dark:border-slate-800 bg-brand-950/30 dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-brand-600 dark:bg-brand-800 flex items-center justify-center text-sm font-bold border-2 border-brand-400 dark:border-brand-700">
                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover"/> : user.nome.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold truncate text-white">{user.nome}</p>
               <p className="text-xs text-brand-300 dark:text-slate-400">{user.role === 'ADMIN' ? 'Dono / Admin' : 'Atendente'}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-800 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-2 rounded text-xs text-red-100 transition-colors"
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between bg-brand-900 dark:bg-slate-950 text-white p-4 shadow-md">
          <div className="font-bold">OneConsig</div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full bg-brand-800 dark:bg-slate-900 z-50 shadow-lg border-t border-brand-700 p-4">
             <div className="mb-4 pb-4 border-b border-brand-700 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{user.nome}</p>
                  <p className="text-xs text-brand-300">{user.role}</p>
                </div>
                <button onClick={logout} className="text-red-300 text-xs border border-red-900 px-2 py-1 rounded">Sair</button>
             </div>
             
             {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white rounded hover:bg-brand-700 dark:hover:bg-slate-800"
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-purple-200 mt-2 bg-purple-900/30 rounded">
                   <Shield size={20} /> Painel Admin
                </Link>
              )}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-slate-900 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;