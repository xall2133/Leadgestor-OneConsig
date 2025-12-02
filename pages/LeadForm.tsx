import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLead } from '../services/leadService';
import { Lead } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Lead>>({
    status: 'novo',
    margem_disponivel: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cpf) {
      alert('Nome e CPF são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      await createLead(formData as Lead);
      navigate('/leads'); // Go to Kanban
    } catch (error) {
      alert('Erro ao salvar lead. Verifique se o CPF já existe.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Novo Cadastro de Lead</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-700">Dados Pessoais</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nome Completo *</label>
                <input required type="text" name="nome" onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CPF *</label>
                <input required type="text" name="cpf" placeholder="000.000.000-00" onChange={handleChange} className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Data Nasc.</label>
                  <input type="date" name="data_nascimento" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Idade</label>
                   <input type="number" name="idade" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                </div>
              </div>
            </div>

            {/* Benefit Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-700">Dados do Benefício</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700">Número Benefício (NB)</label>
                <input type="text" name="beneficio" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Espécie (Cód)</label>
                    <input type="number" name="codigo_especie" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">DDB</label>
                    <input type="date" name="ddb" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700">Valor Benefício</label>
                   <input type="number" step="0.01" name="valor_beneficio" onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700">Margem Disp.</label>
                   <input type="number" step="0.01" name="margem_disponivel" onChange={handleChange} className="mt-1 w-full p-2 border rounded border-green-300 bg-green-50" />
                 </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-700">Contato</h3>
              <div className="grid grid-cols-3 gap-2">
                 <input type="text" name="telefone1" placeholder="Tel 1" onChange={handleChange} className="p-2 border rounded w-full" />
                 <input type="text" name="telefone2" placeholder="Tel 2" onChange={handleChange} className="p-2 border rounded w-full" />
                 <input type="text" name="telefone3" placeholder="Tel 3" onChange={handleChange} className="p-2 border rounded w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="municipio" placeholder="Município" onChange={handleChange} className="p-2 border rounded w-full" />
                <input type="text" name="uf" placeholder="UF" onChange={handleChange} className="p-2 border rounded w-full" />
              </div>
            </div>

            {/* Obs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-700">Observações</h3>
              <textarea name="observacoes" rows={4} onChange={handleChange} className="w-full p-2 border rounded resize-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transform active:scale-95 transition-all"
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
