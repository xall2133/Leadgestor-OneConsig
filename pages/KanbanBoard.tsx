
import React, { useEffect, useState } from 'react';
import { Lead, LeadStatus } from '../types';
import { getLeads, updateLeadStatus, searchLeads } from '../services/leadService';
import { Phone, Wallet, AlertCircle, Eye, Search, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const KanbanBoard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = async () => {
    if (!searchTerm.trim()) {
      loadLeads();
      return;
    }
    
    try {
      setLoading(true);
      setIsSearchingGlobal(true);
      const data = await searchLeads(searchTerm);
      setLeads(data);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearchingGlobal(false);
    loadLeads();
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const onDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    const lead = leads.find(l => l.id === draggedLeadId);
    if (!lead || lead.status === targetStatus) return;

    // Optimistic Update
    const oldStatus = lead.status;
    const updatedLeads = leads.map(l => 
      l.id === draggedLeadId ? { ...l, status: targetStatus } : l
    );
    setLeads(updatedLeads);

    try {
      await updateLeadStatus(draggedLeadId, targetStatus, oldStatus);
    } catch (error) {
      console.error("Failed to update status", error);
      loadLeads(); 
    } finally {
      setDraggedLeadId(null);
    }
  };

  const renderColumn = (status: LeadStatus, title: string, colorClass: string) => {
    const columnLeads = leads.filter(l => l.status === status);
    
    const displayLeads = isSearchingGlobal ? columnLeads : columnLeads.filter(l => 
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.cpf.includes(searchTerm)
    );

    return (
      <div 
        className="flex flex-col h-full bg-slate-200 rounded-xl overflow-hidden min-w-[300px] md:min-w-[320px] shadow-inner"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, status)}
      >
        <div className={`p-3 font-bold text-white flex justify-between items-center ${colorClass}`}>
          <span>{title}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{displayLeads.length}</span>
        </div>
        <div className="flex-1 p-3 overflow-y-auto kanban-scroll space-y-3">
          {displayLeads.length === 0 && status === 'novo' && !isSearchingGlobal ? (
             <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center text-sm text-blue-800">
               Novos leads aparecem aqui. <br/> Use a tela de <strong>Gestão</strong> para trazer mais leads da base.
             </div>
          ) : null}

          {displayLeads.map(lead => (
            <div
              key={lead.id}
              draggable
              onDragStart={(e) => onDragStart(e, lead.id!)}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border-l-4 border-transparent hover:border-brand-500 group"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 truncate pr-2 w-48" title={lead.nome}>{lead.nome}</h4>
                <div className="bg-slate-100 p-1 rounded shrink-0">
                  <span className="text-xs font-mono text-slate-500">INSS</span>
                </div>
              </div>
              
              <div className="space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-slate-400" />
                  <span>{lead.cpf}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>{lead.telefone1 || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-green-600 bg-green-50 p-1 rounded w-fit">
                  <Wallet size={14} />
                  <span>Mg: R$ {lead.margem_disponivel?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                <Link to={`/lead/${lead.id}`} className="text-xs flex items-center gap-1 text-brand-600 font-medium hover:underline">
                  <Eye size={12} /> Ver Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pipeline de Vendas</h2>
          <p className="text-xs text-slate-500 hidden md:block">Exibindo leads ativos (máx 500 recentes). Use a Gestão para trazer mais.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-80">
            <input 
              type="text" 
              placeholder="Buscar Nome ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            {searchTerm && (
              <button onClick={handleClearSearch} className="absolute right-3 top-2.5 text-slate-400 hover:text-red-500">
                <X size={18} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => handleGlobalSearch()} 
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
          >
            Buscar
          </button>

          <button 
            onClick={loadLeads} 
            title="Recarregar Quadro"
            className="bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {loading && !leads.length ? (
        <div className="flex-1 flex justify-center items-center text-slate-500">
          Carregando leads...
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max px-1">
            {renderColumn('novo', 'Novos / Fila', 'bg-blue-500')}
            {renderColumn('analise', 'Em Análise', 'bg-yellow-500')}
            {renderColumn('aprovado', 'Aprovados', 'bg-green-600')}
            {renderColumn('reprovado', 'Reprovados', 'bg-red-500')}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
