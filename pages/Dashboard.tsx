import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Users, CheckCircle, Clock, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { getDashboardStats } from '../services/leadService';
import { DashboardStats } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) return <div className="flex h-full justify-center items-center text-brand-600 dark:text-brand-400">Carregando indicadores...</div>;
  if (!stats) return <div className="dark:text-white">Erro ao carregar dados.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Visão Geral</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Métricas de performance e distribuição da carteira.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all text-slate-700 dark:text-slate-200 font-medium"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total de Leads</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalLeads}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full text-blue-500"><Users size={24} /></div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Conversão</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.approvedPercentage.toFixed(1)}%</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full text-green-500"><CheckCircle size={24} /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tempo Médio</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.avgTimeDays} dias</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-full text-orange-500"><Clock size={24} /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Margem Média</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">R$ {stats.avgMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full text-purple-500"><DollarSign size={24} /></div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm transition-colors">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2"><Activity size={18} /> Leads por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm transition-colors">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Evolução Diária</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyEvolution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm transition-colors">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Distribuição Visual</h3>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;