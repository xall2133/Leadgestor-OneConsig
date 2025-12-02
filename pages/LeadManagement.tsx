import React, { useState, useEffect } from 'react';
import { getLeadsPaginated, bulkUpdateLeadsStatus, resetDatabase } from '../services/leadService';
import { Lead, LeadFilter } from '../types';
import { Search, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, ArrowRightCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LeadManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filtros
  const [filters, setFilters] = useState<LeadFilter>({
    status: '',
    municipio: '',
    ddbStart: '',
    ddbEnd: '',
    search: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getLeadsPaginated(page, pageSize, filters);
      setLeads(res.data);
      setCount(res.count);
      // Limpa seleção ao mudar de página para evitar confusão
      setSelectedIds(new Set()); 
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]); // Recarrega ao mudar página

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setPage(1); // Volta para pagina 1 ao filtrar
    loadData();
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length && leads.length > 0) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(leads.map(l => l.id as string));
      setSelectedIds(newSet);
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Deseja enviar ${selectedIds.size} leads para a fila de ANÁLISE?`)) return;

    try {
      await bulkUpdateLeadsStatus(Array.from(selectedIds), 'analise');
      alert('Leads enviados para o Kanban com sucesso!');
      loadData();
    } catch (error) {
      alert('Erro ao atualizar leads');
    }
  };

  const handleReset = async () => {
    const confirmText = prompt("PERIGO: Isso apagará TODOS os leads e o histórico do sistema.\nEssa ação é irreversível.\nDigite 'DELETAR' para confirmar:");
    if (confirmText === 'DELETAR') {
      try {
        setLoading(true);
        await resetDatabase();
        alert('Banco de dados limpo com sucesso.');
        loadData();
      } catch (error) {
        alert('Erro ao limpar banco.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gestão de Base (Backlog)</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus {count} leads e envie lotes para trabalho.</p>
        </div>
        
        <div className="flex gap-3 items-center">
          {/* Botão de Limpar (Apenas Admin) */}
          {user?.role === 'ADMIN' && (
            <button 
              onClick={handleReset} 
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm transition-all text-red-600 dark:text-red-400 font-medium text-sm"
              title="Apagar TODOS os leads"
            >
              <Trash2 size={16} />
              Limpar Base
            </button>
          )}

          {selectedIds.size > 0 && (
            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 px-4 py-2 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
               <span className="font-bold text-brand-700 dark:text-brand-300">{selectedIds.size} selecionados</span>
               <button 
                  onClick={handleBulkAction}
                  className="bg-brand-600 text-white px-3 py-1.5 rounded shadow hover:bg-brand-700 flex items-center gap-2 text-sm font-medium"
               >
                 <ArrowRightCircle size={16} /> Enviar p/ Análise
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Busca</label>
              <div className="relative">
                <input 
                   name="search"
                   placeholder="Nome ou CPF" 
                   value={filters.search} 
                   onChange={handleFilterChange}
                   className="w-full pl-8 p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded text-sm outline-none focus:border-brand-500"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-slate-400"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Município</label>
              <input 
                 name="municipio"
                 placeholder="Cidade..." 
                 value={filters.municipio} 
                 onChange={handleFilterChange}
                 className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">DDB Início</label>
              <input 
                 type="date"
                 name="ddbStart"
                 value={filters.ddbStart} 
                 onChange={handleFilterChange}
                 className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">DDB Fim</label>
              <input 
                 type="date"
                 name="ddbEnd"
                 value={filters.ddbEnd} 
                 onChange={handleFilterChange}
                 className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded text-sm outline-none focus:border-brand-500"
              />
            </div>
            <button 
               onClick={applyFilters}
               className="bg-slate-800 dark:bg-slate-700 text-white p-2 rounded text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-600 flex justify-center items-center gap-2"
            >
              <Filter size={16} /> Filtrar
            </button>
         </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold border-b dark:border-slate-700">
                 <tr>
                    <th className="p-4 w-10">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-brand-600">
                        {leads.length > 0 && selectedIds.size === leads.length ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="p-4">Nome / CPF</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">DDB</th>
                    <th className="p-4">Margem</th>
                    <th className="p-4">Local</th>
                    <th className="p-4 text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 dark:text-slate-200">
                 {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">Carregando dados...</td></tr>
                 ) : leads.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">Nenhum lead encontrado com estes filtros.</td></tr>
                 ) : (
                    leads.map(lead => (
                       <tr key={lead.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedIds.has(lead.id!) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <td className="p-4">
                             <button onClick={() => toggleSelect(lead.id!)} className={`text-slate-400 hover:text-brand-600 ${selectedIds.has(lead.id!) ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                                {selectedIds.has(lead.id!) ? <CheckSquare size={18} /> : <Square size={18} />}
                             </button>
                          </td>
                          <td className="p-4">
                             <div className="font-bold text-slate-800 dark:text-white">{lead.nome}</div>
                             <div className="text-xs text-slate-400 font-mono">{lead.cpf}</div>
                          </td>
                          <td className="p-4">
                             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                ${lead.status === 'novo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 
                                  lead.status === 'analise' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}
                             `}>
                               {lead.status}
                             </span>
                          </td>
                          <td className="p-4">{lead.ddb ? new Date(lead.ddb).toLocaleDateString() : '-'}</td>
                          <td className="p-4 text-green-600 dark:text-green-400 font-bold">R$ {lead.margem_disponivel?.toFixed(2)}</td>
                          <td className="p-4">{lead.municipio}-{lead.uf}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => navigate(`/lead/${lead.id}`)} className="text-brand-600 dark:text-brand-400 hover:underline">Ver</button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
         </div>
         
         {/* Paginação */}
         <div className="bg-slate-50 dark:bg-slate-800 p-4 border-t dark:border-slate-700 flex justify-between items-center transition-colors">
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              Página {page} de {totalPages} (Total: {count})
            </span>
            <div className="flex gap-2">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-1 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border shadow-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-600"
               >
                 <ChevronLeft size={20} />
               </button>
               <button 
                 disabled={page >= totalPages}
                 onClick={() => setPage(p => p + 1)}
                 className="p-1 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border shadow-sm disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-600"
               >
                 <ChevronRight size={20} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LeadManagement;