
export type LeadStatus = 'novo' | 'analise' | 'aprovado' | 'reprovado';

export interface Lead {
  id?: string;
  user_id?: string | null; // ID do atendente dono do lead
  nome: string;
  cpf: string;
  beneficio?: string;
  ddb?: string; 
  valor_beneficio?: number;
  data_nascimento?: string;
  idade?: number;
  codigo_especie?: number;
  margem_disponivel?: number;
  municipio?: string;
  uf?: string;
  telefone1?: string;
  telefone2?: string;
  telefone3?: string;
  status: LeadStatus;
  data_criacao?: string;
  data_status?: string;
  observacoes?: string;
}

export interface HistoryLog {
  id: string;
  lead_id: string;
  status_anterior: string;
  status_novo: string;
  data_mudanca: string;
}

export interface DashboardStats {
  totalLeads: number;
  approvedPercentage: number;
  avgMargin: number;
  avgTimeDays: number;
  statusDistribution: { name: string; value: number }[];
  dailyEvolution: { date: string; total: number }[];
}

export interface LeadFilter {
  status?: string;
  ddbStart?: string;
  ddbEnd?: string;
  municipio?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// === NOVOS TIPOS PARA AUTENTICAÇÃO ===

export interface AppUser {
  id: string; // 'admin' ou UUID do supabase
  nome: string;
  role: 'ADMIN' | 'USER';
  telefone?: string;
}

export interface AuthorizedUser {
  id: string;
  nome: string;
  telefone: string;
  status: 'ativo' | 'bloqueado' | 'expirado';
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthContextType {
  user: AppUser | null;
  login: (nome: string, credencial: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}
