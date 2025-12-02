
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  login: (nome: string, credencial: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restaurar sessão
    const saved = localStorage.getItem('oneconsig_session');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const login = async (nome: string, credencial: string) => {
    // 1. Verificar se é ADMIN (Senha Mestra)
    if (credencial === 'ADMIN_MASTER_2025') {
      const adminUser: AppUser = {
        id: 'admin-master-id',
        nome: nome || 'Administrador',
        role: 'ADMIN'
      };
      setUser(adminUser);
      localStorage.setItem('oneconsig_session', JSON.stringify(adminUser));
      return { success: true };
    }

    // 2. Verificar se é ATENDENTE (Telefone na base)
    // Remove caracteres não numéricos do telefone para comparar
    const cleanPhone = credencial.replace(/\D/g, ''); 
    
    // Busca flexível: tenta bater o telefone exato ou o telefone limpo
    const { data, error } = await supabase
      .from('usuarios_autorizados')
      .select('*')
      .or(`telefone.eq.${credencial},telefone.eq.${cleanPhone}`)
      .single();

    if (error || !data) {
      return { success: false, message: 'Usuário não encontrado. Fale com o administrador.' };
    }

    // Verificar Status
    if (data.status === 'bloqueado') {
      return { success: false, message: 'Seu acesso está BLOQUEADO. Contate o administrador.' };
    }

    // Verificar Validade
    if (data.data_fim) {
      const hoje = new Date();
      const validade = new Date(data.data_fim);
      if (hoje > validade) {
         // Atualiza status para expirado
         await supabase.from('usuarios_autorizados').update({ status: 'expirado' }).eq('id', data.id);
         return { success: false, message: 'Seu acesso EXPIROU. Contate o administrador para renovar.' };
      }
    }
    
    if (data.status === 'expirado') {
      return { success: false, message: 'Acesso expirado.' };
    }

    // Login Sucesso
    const appUser: AppUser = {
      id: data.id,
      nome: data.nome,
      role: 'USER',
      telefone: data.telefone
    };

    // Logar acesso
    await supabase.from('acessos_usuarios').insert({
      usuario_id: data.id,
      nome_usuario: data.nome,
      tipo_acesso: 'LOGIN'
    });

    setUser(appUser);
    localStorage.setItem('oneconsig_session', JSON.stringify(appUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oneconsig_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
