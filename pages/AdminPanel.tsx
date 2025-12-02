
import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/adminService';
import { AuthorizedUser } from '../types';
import { Plus, Trash2, Edit, Save, X, Lock, Unlock, Calendar } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<AuthorizedUser>>({
    nome: '',
    telefone: '',
    status: 'ativo',
    observacoes: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.telefone) return alert('Nome e Telefone obrigatórios');

    try {
      // Define expiração padrão para 30 dias se não informado
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + 30);

      const userToSave = {
        ...formData,
        data_fim: formData.data_fim || dataFim.toISOString(),
      };

      if (formData.id) {
        await updateUser(formData.id, userToSave);
      } else {
        await createUser(userToSave as any);
      }
      
      setIsEditing(false);
      setFormData({});
      loadUsers();
    } catch (e) {
      alert('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? O histórico desse usuário será mantido, mas o acesso será revogado.')) {
      await deleteUser(id);
      loadUsers();
    }
  };

  const startEdit = (user: AuthorizedUser) => {
    setFormData(user);
    setIsEditing(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administração de Usuários</h2>
          <p className="text-slate-500">Cadastre e libere acesso para os atendentes.</p>
        </div>
        <button 
          onClick={() => { setFormData({ status: 'ativo' }); setIsEditing(true); }}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700"
        >
          <Plus size={20} /> Novo Atendente
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-200 mb-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold text-lg">{formData.id ? 'Editar Usuário' : 'Novo Cadastro'}</h3>
            <button onClick={() => setIsEditing(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nome</label>
              <input 
                type="text" 
                value={formData.nome || ''} 
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full p-2 border rounded" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Telefone (Acesso)</label>
              <input 
                type="text" 
                value={formData.telefone || ''} 
                onChange={e => setFormData({...formData, telefone: e.target.value})}
                className="w-full p-2 border rounded" required placeholder="Apenas números"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Validade do Acesso</label>
              <input 
                type="datetime-local" 
                value={formData.data_fim ? new Date(formData.data_fim).toISOString().slice(0, 16) : ''}
                onChange={e => setFormData({...formData, data_fim: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full p-2 border rounded"
              >
                <option value="ativo">Ativo</option>
                <option value="bloqueado">Bloqueado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Observações</label>
              <input 
                type="text" 
                value={formData.observacoes || ''} 
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 font-medium">Salvar Usuário</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4">Atendente</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Validade</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{user.nome}</td>
                <td className="p-4 text-slate-500 font-mono">{user.telefone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                    ${user.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                  `}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600 flex items-center gap-2">
                   <Calendar size={14} />
                   {user.data_fim ? new Date(user.data_fim).toLocaleDateString() : 'Eterno'}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => startEdit(user)} className="text-brand-600 hover:bg-brand-50 p-1 rounded"><Edit size={18}/></button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum usuário cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
