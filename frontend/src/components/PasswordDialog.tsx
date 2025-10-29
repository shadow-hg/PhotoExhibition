import { useState } from 'react';
import axios from 'axios';
import { verifyDownloadPassword } from '../lib/api';

interface PasswordDialogProps {
  onSuccess: (url: string) => void;
}

export const PasswordDialog = ({ onSuccess }: PasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { valid, url } = await verifyDownloadPassword(password);
      if (valid && url) {
        onSuccess(url);
      } else {
        setError('密码验证失败');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message ?? err.message;
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('验证失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-200">
        下载密码
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="请输入下载密码"
        />
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? '验证中...' : '验证并下载'}
      </button>
    </form>
  );
};
