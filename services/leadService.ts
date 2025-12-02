
import { supabase } from '../supabaseClient';
import { Lead, LeadStatus, DashboardStats, HistoryLog, LeadFilter, PaginatedResponse, AppUser } from '../types';

// Função auxiliar para pegar o usuário atual do localStorage (para não quebrar as assinaturas das funções)
const getCurrentUser = (): AppUser | null => {
  const saved = localStorage.getItem('oneconsig_session');
  return saved ? JSON.parse(saved) : null;
};

// --- LEITURA ---

export const getLeads = async (): Promise<Lead[]> => {
  const user = getCurrentUser();
  if (!user) return [];

  let query = supabase
    .from('leads')
    .select('*')
    .order('data_status', { ascending: false })
    .limit(500);

  // SE NÃO FOR ADMIN, FILTRA APENAS OS LEADS DO USUÁRIO
  if (user.role !== 'ADMIN') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar leads:', error.message);
    throw error;
  }
  return data || [];
};

export const getLeadsPaginated = async (
  page: number, 
  pageSize: number, 
  filters: LeadFilter
): Promise<PaginatedResponse<Lead>> => {
  const user = getCurrentUser();
  if (!user) throw new Error("Usuário não autenticado");

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' });

  // FILTRO DE SEGURANÇA
  if (user.role !== 'ADMIN') {
    query = query.eq('user_id', user.id);
  }

  // Aplica filtros de UI
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.municipio) query = query.ilike('municipio', `%${filters.municipio}%`);
  if (filters.search) {
    query = query.or(`nome.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%`);
  }
  if (filters.ddbStart) query = query.gte('ddb', filters.ddbStart);
  if (filters.ddbEnd) query = query.lte('ddb', filters.ddbEnd);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('ddb', { ascending: true })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize
  };
};

export const searchLeads = async (queryTerm: string): Promise<Lead[]> => {
  const user = getCurrentUser();
  if (!user || !queryTerm) return [];

  let query = supabase
    .from('leads')
    .select('*')
    .or(`nome.ilike.%${queryTerm}%,cpf.ilike.%${queryTerm}%`)
    .limit(50);

  if (user.role !== 'ADMIN') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getLeadDetails = async (id: string): Promise<{ lead: Lead; history: HistoryLog[] }> => {
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadError) throw leadError;

  // Verificação de Segurança (Frontend side, mas idealmente seria RLS)
  const user = getCurrentUser();
  if (user?.role !== 'ADMIN' && lead.user_id && lead.user_id !== user?.id) {
    throw new Error("Acesso negado a este lead.");
  }

  const { data: history, error: historyError } = await supabase
    .from('historico_status')
    .select('*')
    .eq('lead_id', id)
    .order('data_mudanca', { ascending: false });

  if (historyError) throw historyError;

  return { lead, history: history || [] };
};

// --- ESCRITA ---

export const createLead = async (lead: Lead): Promise<Lead | null> => {
  const user = getCurrentUser();
  if (!user) throw new Error("Usuário não logado");

  // Atribui o lead ao usuário logado (se não for admin atribuindo manualmente)
  const leadWithOwner = {
    ...lead,
    user_id: user.role === 'ADMIN' ? (lead.user_id || user.id) : user.id // Admin pode ver leads dele tb
  };

  const { data, error } = await supabase.from('leads').insert([leadWithOwner]).select().single();
  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
  return data;
};

export const updateLeadStatus = async (id: string, newStatus: LeadStatus, oldStatus: LeadStatus): Promise<void> => {
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: newStatus, data_status: new Date().toISOString() })
    .eq('id', id);

  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from('historico_status').insert([
    { lead_id: id, status_anterior: oldStatus, status_novo: newStatus },
  ]);

  if (historyError) console.error('Error logging history:', historyError);
};

export const bulkUpdateLeadsStatus = async (ids: string[], newStatus: LeadStatus): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus, data_status: new Date().toISOString() })
    .in('id', ids);

  if (error) throw error;
};

export const updateLeadInfo = async (id: string, updates: Partial<Lead>): Promise<void> => {
  const { error } = await supabase.from('leads').update(updates).eq('id', id);
  if (error) throw error;
};

export const bulkUpsertLeads = async (leads: Lead[], onProgress?: (progress: number) => void): Promise<{ added: number }> => {
  const user = getCurrentUser();
  if (!user) throw new Error("Usuário não logado");

  // Injetar o ID do usuário em todos os leads importados
  const leadsWithOwner = leads.map(l => ({
    ...l,
    user_id: user.id // Associa ao usuário que está importando
  }));

  const BATCH_SIZE = 100;
  let totalProcessed = 0;

  for (let i = 0; i < leadsWithOwner.length; i += BATCH_SIZE) {
    const chunk = leadsWithOwner.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('leads')
      .upsert(chunk, { 
        onConflict: 'cpf', 
        ignoreDuplicates: false 
      });

    if (error) {
      console.error(`Erro no lote ${i}:`, error);
      throw error; 
    }

    totalProcessed += chunk.length;
    if (onProgress) {
      onProgress(Math.round((totalProcessed / leadsWithOwner.length) * 100));
    }
  }
  return { added: totalProcessed };
};

export const resetDatabase = async (): Promise<void> => {
  const user = getCurrentUser();
  if (user?.role !== 'ADMIN') throw new Error("Apenas ADMIN pode limpar a base");

  const { error: hError } = await supabase.from('historico_status').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (hError) throw hError;

  const { error: lError } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (lError) throw lError;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const user = getCurrentUser();
  
  // Base Query
  let baseQuery = supabase.from('leads').select('*', { count: 'exact', head: true });
  if (user?.role !== 'ADMIN') baseQuery = baseQuery.eq('user_id', user!.id);
  
  const { count: totalLeads } = await baseQuery;
  
  // Status Counts
  const getCount = async (status: string) => {
    let q = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', status);
    if (user?.role !== 'ADMIN') q = q.eq('user_id', user!.id);
    const { count } = await q;
    return count || 0;
  };

  const [novos, analise, aprovados, reprovados] = await Promise.all([
    getCount('novo'),
    getCount('analise'),
    getCount('aprovado'),
    getCount('reprovado')
  ]);

  const total = totalLeads || 0;
  const approvedPercentage = total > 0 ? (aprovados / total) * 100 : 0;
  
  // Cálculo de Margem (Pegando amostra para não pesar)
  let marginQuery = supabase.from('leads').select('margem_disponivel').limit(1000);
  if (user?.role !== 'ADMIN') marginQuery = marginQuery.eq('user_id', user!.id);
  
  const { data: marginData } = await marginQuery;
  const totalMargin = marginData?.reduce((acc, curr) => acc + (curr.margem_disponivel || 0), 0) || 0;
  const avgMargin = marginData?.length ? totalMargin / marginData.length : 0;

  return {
    totalLeads: total,
    approvedPercentage,
    avgMargin,
    avgTimeDays: 2.5,
    statusDistribution: [
      { name: 'Novos', value: novos },
      { name: 'Análise', value: analise },
      { name: 'Aprovados', value: aprovados },
      { name: 'Reprovados', value: reprovados }
    ],
    dailyEvolution: [] // Simplificado para performance
  };
};
