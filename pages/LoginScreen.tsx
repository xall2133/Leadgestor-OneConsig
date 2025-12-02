
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Loader2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [credencial, setCredencial] = useState(''); // Telefone ou Senha Mestra
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(nome, credencial);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Erro ao entrar.');
      }
    } catch (e) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-brand-600 p-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-wide">OneConsig</h1>
          <p className="text-brand-100 mt-2 text-sm">Sistema de Gestão de Leads</p>
        </div>

        <div className="p-8 flex-1">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Como você quer ser chamado?"
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Acesso (Telefone ou Senha Admin)</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={credencial}
                  onChange={e => setCredencial(e.target.value)}
                  placeholder="Digite seu celular (ou senha mestra)"
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Entrar no Sistema <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Acesso restrito a usuários autorizados.</p>
            <p>Admin: Use a senha mestra no campo Acesso.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
