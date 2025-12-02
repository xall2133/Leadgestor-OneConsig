import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeadDetails, updateLeadStatus, updateLeadInfo } from '../services/leadService';
import { Lead, HistoryLog, LeadStatus } from '../types';
import { ArrowLeft, Phone, Printer, MessageCircle, Calendar, DollarSign, MapPin, User, FileText } from 'lucide-react';

const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{ lead: Lead; history: HistoryLog[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (leadId: string) => {
    try {
      const result = await getLeadDetails(leadId);
      setData(result);
    } catch (e) {
      console.error(e);
      alert('Lead não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!data || !id) return;
    try {
      await updateLeadStatus(id, newStatus, data.lead.status);
      loadData(id); // Reload to show new timeline
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const msg = `Olá ${data?.lead.nome}, falo da OneConsig sobre sua margem disponível. Podemos conversar?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8">Carregando detalhes...</div>;
  if (!data) return <div className="p-8">Lead não encontrado.</div>;

  const { lead, history } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-slate-50">
            <Printer size={18} /> Imprimir PDF
          </button>
          {lead.telefone1 && (
            <button 
              onClick={() => handleWhatsApp(lead.telefone1)} 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 shadow-md"
            >
              <MessageCircle size={18} /> WhatsApp
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-2 h-full ${
                lead.status === 'aprovado' ? 'bg-green-500' : 
                lead.status === 'reprovado' ? 'bg-red-500' : 
                lead.status === 'analise' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{lead.nome}</h1>
                <p className="text-slate-500 font-mono text-lg mt-1">{lead.cpf}</p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide
                  ${lead.status === 'aprovado' ? 'bg-green-100 text-green-700' : 
                    lead.status === 'reprovado' ? 'bg-red-100 text-red-700' : 
                    lead.status === 'analise' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {lead.status}
                </span>
                <p className="text-xs text-slate-400 mt-2">ID: {lead.id?.slice(0, 8)}...</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-1"><DollarSign size={16}/> Margem</div>
                <div className="text-xl font-bold text-green-600">R$ {lead.margem_disponivel?.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-1"><Calendar size={16}/> Idade</div>
                <div className="text-xl font-bold text-slate-700">{lead.idade} anos</div>
              </div>
               <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-1"><FileText size={16}/> Benefício</div>
                <div className="text-xl font-bold text-slate-700">{lead.beneficio}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Contato</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-3 text-slate-700"><Phone size={18} className="text-brand-500"/> {lead.telefone1}</li>
                    {lead.telefone2 && <li className="flex items-center gap-3 text-slate-700"><Phone size={18} className="text-brand-500"/> {lead.telefone2}</li>}
                    {lead.telefone3 && <li className="flex items-center gap-3 text-slate-700"><Phone size={18} className="text-brand-500"/> {lead.telefone3}</li>}
                  </ul>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Localização</h3>
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin size={18} className="text-brand-500"/>
                    {lead.municipio} - {lead.uf}
                  </div>
               </div>
            </div>
            
            <div className="mt-8">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Observações</h3>
               <div className="bg-yellow-50 p-4 rounded text-slate-700 text-sm border border-yellow-100">
                 {lead.observacoes || 'Nenhuma observação registrada.'}
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & History */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm print:hidden">
            <h3 className="font-bold text-slate-800 mb-4">Mudar Status</h3>
            <div className="space-y-2">
              <button onClick={() => handleStatusChange('novo')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded text-sm text-blue-600 font-medium">Marcar como Novo</button>
              <button onClick={() => handleStatusChange('analise')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded text-sm text-yellow-600 font-medium">Enviar para Análise</button>
              <button onClick={() => handleStatusChange('aprovado')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded text-sm text-green-600 font-medium">Aprovar Lead</button>
              <button onClick={() => handleStatusChange('reprovado')} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded text-sm text-red-600 font-medium">Reprovar Lead</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Histórico</h3>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-6">
              {history.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-white"></div>
                  <p className="text-xs text-slate-400 mb-1">{new Date(log.data_mudanca).toLocaleString()}</p>
                  <p className="text-sm text-slate-800">
                    Mudou de <span className="font-bold">{log.status_anterior}</span> para <span className="font-bold">{log.status_novo}</span>
                  </p>
                </div>
              ))}
              <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-300 border-2 border-white"></div>
                  <p className="text-xs text-slate-400 mb-1">{lead.data_criacao ? new Date(lead.data_criacao).toLocaleString() : '-'}</p>
                  <p className="text-sm text-slate-800">Lead Criado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
