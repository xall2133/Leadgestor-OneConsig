
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Camera, X, Save, User as UserIcon } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onSave, currentProfile }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Atendente');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (currentProfile) {
        setName(currentProfile.name);
        setRole(currentProfile.role);
        setAvatar(currentProfile.avatar);
      } else {
        setName('');
        setRole('Atendente');
        setAvatar(undefined);
      }
    }
  }, [isOpen, currentProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, role, avatar });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-brand-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Identificação do Atendente</h3>
          <button onClick={onClose} className="hover:bg-brand-800 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-brand-700 transition-colors">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-500">Toque na câmera para alterar a foto</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Profissional</label>
              <input 
                required
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ana Silva"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Função / Cargo</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Atendente"
                  list="roles"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
                <datalist id="roles">
                  <option value="Atendente" />
                  <option value="Supervisor" />
                  <option value="Gerente" />
                  <option value="Analista de Crédito" />
                </datalist>
              </div>
              <p className="text-xs text-slate-400 mt-1">Você pode digitar uma nova função se desejar.</p>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Save size={18} />
              Salvar Identificação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
