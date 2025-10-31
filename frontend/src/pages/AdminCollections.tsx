import { useForm } from 'react-hook-form';
import {
  useCollections,
  usePhotos,
  useAdminCreateCollection,
  useAdminDeleteCollection,
} from '../api/hooks';
import { CollectionPayload } from '../types/api';

interface CollectionFormValues {
  name: string;
  description: string;
  heroImageUrl?: string;
  coverPhotoId?: number;
  photoIds: number[];
}

export default function AdminCollections() {
  const { data: collections } = useCollections();
  const { data: photos } = usePhotos();
  const createCollection = useAdminCreateCollection();
  const deleteCollection = useAdminDeleteCollection();

  const { register, handleSubmit, reset } = useForm<CollectionFormValues>({
    defaultValues: { photoIds: [] },
  });

  const onSubmit = async (values: CollectionFormValues) => {
    const payload: CollectionPayload = {
      name: values.name,
      description: values.description,
      heroImageUrl: values.heroImageUrl,
      coverPhotoId: values.coverPhotoId,
      photoIds: values.photoIds,
    };
    await createCollection.mutateAsync(payload);
    reset({ photoIds: [] });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[3fr,2fr]">
      <div>
        <h2 className="font-display text-2xl text-white">系列总览</h2>
        <p className="mt-1 text-sm text-slate-400">将作品按叙事主题归纳，提升观众探索效率。</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {collections?.map((collection) => (
            <article key={collection.id} className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-aurora">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                <button
                  onClick={() => deleteCollection.mutate(collection.id)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/20"
                >
                  删除
                </button>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-slate-300">{collection.description}</p>
              {collection.photos && collection.photos.length > 0 && (
                <div className="mt-4 flex -space-x-3">
                  {collection.photos.slice(0, 4).map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="h-12 w-12 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="font-display text-xl text-white">创建新系列</h3>
        <p className="mt-1 text-sm text-slate-400">挑选具有共同气质的作品，打造沉浸式主题叙事。</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="系列名称" required {...register('name', { required: true })} />
          <Textarea label="系列描述" rows={3} {...register('description')} />
          <Input label="系列横幅" placeholder="https://" {...register('heroImageUrl')} />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">封面作品</label>
            <select
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
              {...register('coverPhotoId', { valueAsNumber: true })}
            >
              <option value="">选择封面作品</option>
              {photos?.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-200">纳入作品</h4>
            <p className="mb-3 text-xs text-slate-500">按主题选择 3-6 幅作品，创造流畅的观展节奏。</p>
            <div className="grid max-h-64 gap-2 overflow-y-auto rounded-2xl border border-white/10 p-4">
              {photos?.map((photo) => (
                <label key={photo.id} className="flex items-center space-x-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    value={photo.id}
                    {...register('photoIds', { valueAsNumber: true })}
                  />
                  <span>{photo.title}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
          >
            创建系列
          </button>
        </form>
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
