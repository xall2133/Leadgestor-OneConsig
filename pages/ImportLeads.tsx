
import React, { useState } from 'react';
import { Upload, FileText, Check, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { bulkUpsertLeads } from '../services/leadService';
import { Lead } from '../types';

const ImportLeads: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ added: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setProgress(0);
    }
  };

  const parseCSV = (text: string): Lead[] => {
    const lines = text.split('\n');
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const headers = firstLine.split(separator).map(h => h.trim().toUpperCase());
    
    // Função auxiliar para encontrar coluna
    const findCol = (possibles: string[]) => {
      const idx = headers.findIndex(h => possibles.includes(h));
      return idx;
    };

    const idx = {
      cpf: findCol(['CPF']),
      nome: findCol(['NOME']),
      beneficio: findCol(['BENEFICIO', 'NB', 'NUMERO_BENEFICIO']),
      ddb: findCol(['DDB', 'DATA_INICIO']),
      valor: findCol(['VALOR_BENEFICIO', 'VALOR']),
      nasc: findCol(['DATA_NASCIMENTO', 'NASCIMENTO']),
      idade: findCol(['IDADE']),
      especie: findCol(['CODIGO_ESPECIE', 'ESP', 'ESPECIE']),
      margem: findCol(['MARGEM_DISPONIVEL', 'MARGEM']),
      muni: findCol(['MUNICIPIO', 'CIDADE']),
      uf: findCol(['UF', 'ESTADO']),
      tel1: findCol(['LEMITTI1', 'LEMITT1', 'TELEFONE1']),
      tel2: findCol(['LEMITTI2', 'LEMITT2', 'TELEFONE2']),
      tel3: findCol(['LEMITTI3', 'LEMITT3', 'TELEFONE3']),
    };

    if (idx.cpf === -1 || idx.nome === -1) {
      throw new Error(`Colunas obrigatórias não encontradas (CPF, NOME). Headers lidos: ${headers.join(', ')}.`);
    }

    const leads: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(separator);
      const rawCpf = cols[idx.cpf];
      if (!rawCpf) continue;
      
      const cpf = rawCpf.replace(/\D/g, ''); 
      if (!cpf) continue; 

      const parseMoney = (val: string | undefined) => {
        if (!val) return 0;
        let clean = val.replace('R$', '').trim();
        if (clean.includes(',')) {
          clean = clean.replace(/\./g, '').replace(',', '.');
        }
        return parseFloat(clean) || 0;
      };

      leads.push({
        cpf: rawCpf,
        nome: cols[idx.nome]?.trim() || 'Sem Nome',
        beneficio: cols[idx.beneficio]?.trim(),
        ddb: cols[idx.ddb] ? normalizeDate(cols[idx.ddb]) : undefined,
        valor_beneficio: parseMoney(cols[idx.valor]),
        data_nascimento: cols[idx.nasc] ? normalizeDate(cols[idx.nasc]) : undefined,
        idade: parseInt(cols[idx.idade] || '0'),
        codigo_especie: parseInt(cols[idx.especie] || '0'),
        margem_disponivel: parseMoney(cols[idx.margem]),
        municipio: cols[idx.muni]?.trim(),
        uf: cols[idx.uf]?.trim(),
        telefone1: cols[idx.tel1]?.trim(),
        telefone2: cols[idx.tel2]?.trim(),
        telefone3: cols[idx.tel3]?.trim(),
        status: 'novo'
      });
    }
    return leads;
  };

  const normalizeDate = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined;
    const cleanStr = dateStr.trim();
    if (cleanStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = cleanStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return cleanStr;
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setProcessing(true);
      setError(null);
      setProgress(0);
      
      const text = await file.text();
      const leads = parseCSV(text);
      
      if (leads.length === 0) {
        throw new Error("Nenhum lead válido encontrado.");
      }

      // Envia com callback de progresso
      const stats = await bulkUpsertLeads(leads, (p) => setProgress(p));
      
      setResult(stats);
      setFile(null);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao processar arquivo");
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={32} className="text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Importação de Mailing</h2>
          <p className="text-slate-500 mt-2">
            Sistema preparado para grandes volumes (10k+).
          </p>
        </div>

        {/* ... (regras mantidas) ... */}

        <div className="mb-6">
          <label className="block w-full border-2 border-dashed border-brand-200 rounded-xl p-8 text-center hover:bg-brand-50 transition-colors cursor-pointer group">
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            {file ? (
              <div className="flex flex-col items-center text-brand-700">
                <FileText size={40} className="mb-2" />
                <span className="font-bold">{file.name}</span>
                <span className="text-sm">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-600">
                <Download size={40} className="mb-2" />
                <span className="font-medium">Selecionar CSV</span>
              </div>
            )}
          </label>
        </div>

        {processing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-brand-700 mb-1">
              <span>Enviando dados...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className="bg-brand-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">Isso pode levar alguns instantes para listas grandes.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
            <div><p className="font-bold">Erro</p><p className="text-sm">{error}</p></div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-lg mb-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full"><Check size={24} /></div>
            <div>
              <p className="font-bold text-lg">Sucesso!</p>
              <p>{result.added} leads foram processados.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || processing}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
            !file || processing 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          {processing && <Loader2 className="animate-spin" />}
          {processing ? 'Processando Lotes...' : 'Iniciar Importação'}
        </button>
      </div>
    </div>
  );
};

export default ImportLeads;
