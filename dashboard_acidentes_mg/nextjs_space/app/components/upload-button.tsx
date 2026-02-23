'use client';

import { useRef, useState } from 'react';

const API_BASE = 'http://localhost:8000';

export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha no upload');

      setStatus({ type: 'success', msg: 'Dados atualizados! Recarregue a página.' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Erro ao enviar arquivo.' });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold text-white transition-all ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
        }`}
      >
        {loading ? 'Processando...' : '📤 Atualizar CSV'}
      </button>

      {status && (
        <span className={`text-xs font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.msg}
        </span>
      )}
    </div>
  );
}
