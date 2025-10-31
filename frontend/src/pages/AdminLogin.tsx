import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

interface LoginForm {
  username: string;
  password: string;
}

export default function AdminLogin() {
  const { register, handleSubmit, formState } = useForm<LoginForm>({
    defaultValues: { username: 'curator', password: 'visionary123' },
  });
  const { errors, isSubmitting } = formState;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token, login } = useAuth();

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    try {
      setErrorMessage(null);
      const response = await apiClient.post<{ token: string; username: string }>('/auth/login', values);
      login(response.data.token, response.data.username);
      navigate('/admin', { replace: true });
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? '登录失败，请稍后重试');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-aurora">
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">
            管理员入口
          </div>
          <h1 className="mt-4 font-display text-3xl text-white">欢迎回到光影私语</h1>
          <p className="mt-2 text-sm text-slate-400">请输入后台专属账号进行登录</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-slate-200">用户名</label>
            <input
              type="text"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
              {...register('username', { required: '请输入用户名' })}
            />
            {errors.username && <p className="mt-2 text-xs text-rose-400">{errors.username.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">密码</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
              {...register('password', { required: '请输入密码' })}
            />
            {errors.password && <p className="mt-2 text-xs text-rose-400">{errors.password.message}</p>}
          </div>
          {errorMessage && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">{errorMessage}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? '登录中...' : '进入后台'}
          </button>
        </form>
      </div>
    </div>
  );
}
