const testimonials = [
  {
    quote:
      '她的镜头像一阵轻柔的风，把品牌的质感与温度一起包裹起来。影像上线后，我们的转化率提升了 27%。',
    author: 'VIVID 珠宝品牌创始人',
    role: '陈曦',
  },
  {
    quote:
      '婚礼当天她就像隐形人，却在每个重要瞬间都在。交付的影像让我们再一次回到那天的光与泪。',
    author: '婚礼定制新人',
    role: 'Lynn & Tomas',
  },
  {
    quote:
      '作为展览策展人，与她合作是一种享受。她能迅速理解空间叙事，并给出极具诗意的视觉方案。',
    author: '浮光艺术空间策展人',
    role: '王征',
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-white/5 bg-slate-900/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Voices</p>
            <h2 className="mt-2 font-display text-3xl text-white">合作伙伴的声音</h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.author} className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-aurora">
              <p className="text-sm leading-relaxed text-slate-300">“{item.quote}”</p>
              <figcaption className="mt-6 text-sm text-slate-400">
                <p className="font-semibold text-white">{item.author}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
