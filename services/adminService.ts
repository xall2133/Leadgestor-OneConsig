
import { supabase } from '../supabaseClient';
import { AuthorizedUser } from '../types';

export const getUsers = async (): Promise<AuthorizedUser[]> => {
  const { data, error } = await supabase
    .from('usuarios_autorizados')
    .select('*')
    .order('nome');
  
  if (error) throw error;
  return data || [];
};

export const createUser = async (user: Omit<AuthorizedUser, 'id'>) => {
  const { data, error } = await supabase
    .from('usuarios_autorizados')
    .insert([user])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUser = async (id: string, updates: Partial<AuthorizedUser>) => {
  const { error } = await supabase
    .from('usuarios_autorizados')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteUser = async (id: string) => {
  // Soft delete ou delete real? Vamos usar delete real por enquanto, mas os leads ficam (user_id set null)
  const { error } = await supabase
    .from('usuarios_autorizados')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
