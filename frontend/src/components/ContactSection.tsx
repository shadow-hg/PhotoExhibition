import { useForm } from 'react-hook-form';
import { useContactMutation } from '../api/hooks';
import { useState } from 'react';

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export default function ContactSection() {
  const { register, handleSubmit, reset, formState } = useForm<ContactFormValues>();
  const contactMutation = useContactMutation();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setStatus('idle');
      await contactMutation.mutateAsync(values);
      setStatus('success');
      reset();
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-white/5 bg-slate-950/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(59,130,246,0.2),transparent_55%),radial-gradient(circle_at_100%_50%,rgba(236,72,153,0.2),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Collaborations</span>
            <h2 className="font-display text-3xl text-white">定制你的专属影像体验</h2>
            <p className="text-sm text-slate-300">
              无论是品牌叙事、私家婚礼、艺文展览，还是视觉内容策划，我都乐于与你共同完成一段独特的光影旅程。
            </p>
            <div className="grid gap-4 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Studio</p>
                <p className="mt-1">上海市黄浦区 J·ART 空间 302 室</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mail</p>
                <p className="mt-1">hello@lightpoem.studio</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">WeChat</p>
                <p className="mt-1">lightpoem</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-aurora">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block font-medium text-slate-200">称呼</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                  {...register('name', { required: '请输入称呼' })}
                />
                {formState.errors.name && <p className="mt-2 text-xs text-rose-400">{formState.errors.name.message}</p>}
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block font-medium text-slate-200">邮箱</span>
                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                  {...register('email', { required: '请输入邮箱', pattern: { value: /.+@.+\..+/, message: '请输入有效邮箱' } })}
                />
                {formState.errors.email && <p className="mt-2 text-xs text-rose-400">{formState.errors.email.message}</p>}
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block font-medium text-slate-200">合作需求</span>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                  {...register('message', { required: '请告诉我你的想法', minLength: { value: 10, message: '请至少描述 10 个字' } })}
                />
                {formState.errors.message && <p className="mt-2 text-xs text-rose-400">{formState.errors.message.message}</p>}
              </label>
              <button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {contactMutation.isPending ? '发送中...' : '发送邀请'}
              </button>
              {status === 'success' && <p className="text-xs text-emerald-300">感谢来信，我会在 24 小时内回复。</p>}
              {status === 'error' && <p className="text-xs text-rose-400">发送失败，请稍后重试。</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
