import { useForm } from 'react-hook-form';
import {
  useExhibitions,
  useAdminCreateExhibition,
  useAdminDeleteExhibition,
  useAdminMessages,
  useAdminUpdateMessage,
} from '../api/hooks';
import { ExhibitionPayload } from '../types/api';
import { format } from 'date-fns';

interface ExhibitionFormValues {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  heroImageUrl?: string;
}

export default function AdminExhibitions() {
  const { data: exhibitions } = useExhibitions();
  const createExhibition = useAdminCreateExhibition();
  const deleteExhibition = useAdminDeleteExhibition();
  const { data: messages } = useAdminMessages();
  const updateMessage = useAdminUpdateMessage();
  const { register, handleSubmit, reset } = useForm<ExhibitionFormValues>();

  const onSubmit = async (values: ExhibitionFormValues) => {
    const payload: ExhibitionPayload = { ...values };
    await createExhibition.mutateAsync(payload);
    reset();
  };

  return (
    <div className="grid gap-10 xl:grid-cols-[3fr,2fr]">
      <div>
        <h2 className="font-display text-2xl text-white">展览计划</h2>
        <p className="mt-1 text-sm text-slate-400">规划线下展览与跨界合作，让影像走进更多观众的生活。</p>
        <div className="mt-6 space-y-6">
          {exhibitions?.map((exhibition) => (
            <article key={exhibition.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-aurora">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{exhibition.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{exhibition.location}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {format(new Date(exhibition.startDate), 'yyyy.MM.dd')} — {format(new Date(exhibition.endDate), 'yyyy.MM.dd')}
                  </p>
                </div>
                <button
                  onClick={() => deleteExhibition.mutate(exhibition.id)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/20"
                >
                  取消
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-300">{exhibition.description}</p>
              {exhibition.heroImageUrl && (
                <img src={exhibition.heroImageUrl} alt={exhibition.title} className="mt-4 h-40 w-full rounded-2xl object-cover" />
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-display text-xl text-white">发布新展览</h3>
          <p className="mt-1 text-sm text-slate-400">同步展览时间与亮点，让粉丝提前锁定行程。</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input label="展览标题" required {...register('title', { required: true })} />
            <Textarea label="展览简介" rows={3} {...register('description')} />
            <Input label="展览地点" required {...register('location', { required: true })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="开始日期" type="date" required {...register('startDate', { required: true })} />
              <Input label="结束日期" type="date" required {...register('endDate', { required: true })} />
            </div>
            <Input label="横幅图片" placeholder="https://" {...register('heroImageUrl')} />
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              发布计划
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="font-display text-xl text-white">观众留言</h3>
          <p className="mt-1 text-sm text-slate-400">及时标记处理状态，保持专业而温度的沟通。</p>
          <div className="mt-6 space-y-4">
            {messages?.map((message) => (
              <div key={message.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{message.name}</p>
                    <p className="text-xs text-sky-300">{message.email}</p>
                  </div>
                  <select
                    className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200"
                    value={message.status}
                    onChange={(event) =>
                      updateMessage.mutate({ id: message.id, status: event.target.value as typeof message.status })
                    }
                  >
                    <option value="new">未处理</option>
                    <option value="replied">已回复</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
                <p className="mt-3 text-sm text-slate-300">{message.message}</p>
                <p className="mt-2 text-xs text-slate-500">{format(new Date(message.createdAt), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            )) || <p className="text-sm text-slate-500">暂无留言</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block font-medium text-slate-200">{label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        {...props}
      />
    </label>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-2 block font-medium text-slate-200">{label}</span>
      <textarea
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        {...props}
      />
    </label>
  );
}
