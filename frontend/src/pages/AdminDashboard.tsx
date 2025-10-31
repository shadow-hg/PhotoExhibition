import { useGalleryStats, useAdminMessages } from '../api/hooks';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { data: overview } = useGalleryStats();
  const { data: messages } = useAdminMessages();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl text-white">影展数据速览</h2>
        <p className="mt-1 text-sm text-slate-400">实时掌握作品曝光、访客互动与创作主题的热度走向。</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <StatCard title="作品总数" value={overview?.stats.totalPhotos ?? 0} description="已发布作品数量" />
          <StatCard title="精选作品" value={overview?.stats.featuredPhotos ?? 0} description="首页推荐作品" />
          <StatCard title="累计观看" value={overview?.stats.totalViews ?? 0} description="近一年浏览量" />
          <StatCard title="系列数量" value={overview?.stats.totalCollections ?? 0} description="主题系列总数" />
          <StatCard title="展览计划" value={overview?.stats.totalExhibitions ?? 0} description="筹备中的线下活动" />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h3 className="text-sm font-semibold text-white">热门标签</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {overview?.stats.topTags.map((tag) => (
                <span key={tag.tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                  #{tag.tag} · {tag.count}
                </span>
              )) || <p className="text-sm text-slate-500">暂无标签统计</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white">最新观众留言</h2>
            <p className="mt-1 text-sm text-slate-400">及时回应每一位对光影故事好奇的朋友。</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">姓名</th>
                <th className="px-6 py-3">邮箱</th>
                <th className="px-6 py-3">留言摘要</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {messages?.slice(0, 6).map((message) => (
                <tr key={message.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{message.name}</td>
                  <td className="px-6 py-4 text-sky-300">{message.email}</td>
                  <td className="px-6 py-4 text-slate-300">{message.message.slice(0, 60)}...</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-200">{message.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{format(new Date(message.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    暂无留言。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-aurora">
      <p className="text-xs uppercase tracking-widest text-slate-400">{title}</p>
      <p className="mt-4 font-display text-3xl text-white">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs text-slate-400">{description}</p>
    </div>
  );
}
