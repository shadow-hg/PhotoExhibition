import { useForm } from 'react-hook-form';
import { useState, useMemo, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import {
  usePhotos,
  useAdminCreatePhoto,
  useAdminDeletePhoto,
  useAdminImportLocalPhotos,
} from '../api/hooks';
import { BulkImportResult, PhotoPayload } from '../types/api';

interface PhotoFormValues {
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  camera?: string;
  lens?: string;
  tags: string;
  takenAt?: string;
  isFeatured: boolean;
}

export default function AdminGallery() {
  const { data: photos } = usePhotos();
  const createPhoto = useAdminCreatePhoto();
  const deletePhoto = useAdminDeletePhoto();
  const importLocal = useAdminImportLocalPhotos();
  const [importSummary, setImportSummary] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<PhotoFormValues>({
    defaultValues: {
      isFeatured: true,
    },
  });

  const onSubmit = async (values: PhotoFormValues) => {
    const payload: PhotoPayload = {
      title: values.title,
      description: values.description,
      imageUrl: values.imageUrl,
      location: values.location,
      camera: values.camera,
      lens: values.lens,
      takenAt: values.takenAt,
      isFeatured: values.isFeatured,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    await createPhoto.mutateAsync(payload);
    reset({ isFeatured: true });
  };

  const featuredCount = useMemo(() => photos?.filter((p) => p.isFeatured).length ?? 0, [photos]);

  const handleImportLocalPhotos = async () => {
    setImportError(null);
    try {
      const result = await importLocal.mutateAsync();
      setImportSummary(result);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? '导入 storage/photos 目录中的照片失败';
      setImportError(message);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-white">作品管理</h2>
            <p className="mt-1 text-sm text-slate-400">
              当前共有 {photos?.length ?? 0} 幅作品，精选 {featuredCount} 幅。
            </p>
          </div>
          <button
            type="button"
            onClick={handleImportLocalPhotos}
            disabled={importLocal.isPending}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importLocal.isPending ? '正在导入本地照片…' : '从 storage/photos 批量导入'}
          </button>
        </div>

        {importError && <p className="mt-3 text-sm text-rose-300">{importError}</p>}
        {importSummary && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
            <p>
              已导入 <span className="font-semibold text-white">{importSummary.imported.length}</span> /
              {importSummary.totalFiles} 张照片。
              {importSummary.skipped.length > 0 && ` 跳过 ${importSummary.skipped.length} 张。`}
            </p>
            {importSummary.skipped.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-slate-400">查看跳过原因</summary>
                <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-400">
                  {importSummary.skipped.slice(0, 10).map((item) => (
                    <li key={`${item.file}-${item.reason}`}>
                      <span className="text-slate-300">{item.file}</span> — {item.reason}
                    </li>
                  ))}
                  {importSummary.skipped.length > 10 && <li>… 共 {importSummary.skipped.length} 条记录</li>}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {photos?.map((photo) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-aurora"
            >
              <div className="relative aspect-[4/3]">
                <img src={photo.imageUrl} alt={photo.title} className="h-full w-full object-cover" loading="lazy" />
                {photo.isFeatured && (
                  <span className="absolute left-4 top-4 rounded-full bg-sky-500/80 px-3 py-1 text-xs font-semibold text-white">
                    精选
                  </span>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{photo.title}</h3>
                    {photo.location && <p className="text-xs text-slate-400">{photo.location}</p>}
                  </div>
                  <button
                    onClick={() => deletePhoto.mutate(photo.id)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/20"
                  >
                    删除
                  </button>
                </div>
                <p className="line-clamp-3 text-sm text-slate-300">{photo.description}</p>
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {photo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="font-display text-xl text-white">新增作品</h3>
        <p className="mt-1 text-sm text-slate-400">填写作品信息，可直接同步到前台展示。</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="作品标题" required {...register('title', { required: '请输入标题' })} />
          <Textarea label="作品描述" rows={3} {...register('description')} />
          <Input label="图片链接" required placeholder="https://" {...register('imageUrl', { required: '请提供图片链接' })} />
          <Input label="拍摄地点" {...register('location')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="使用相机" {...register('camera')} />
            <Input label="使用镜头" {...register('lens')} />
          </div>
          <Input label="拍摄日期" type="date" {...register('takenAt')} />
          <Input label="标签（逗号分隔）" placeholder="城市, 夜色, 旅行" {...register('tags')} />
          <label className="flex items-center space-x-2 text-sm text-slate-300">
            <input type="checkbox" className="rounded border-white/20 bg-transparent" {...register('isFeatured')} />
            <span>加入精选展示区</span>
          </label>
          {formState.isSubmitting && <p className="text-xs text-slate-400">正在保存...</p>}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
          >
            发布作品
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
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

function Textarea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
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
