export default function AboutPage() {
  return (
    <div className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Behind the Lens</p>
            <h1 className="mt-4 font-display text-4xl text-white">你好，我是 YU。</h1>
            <p className="mt-6 text-sm leading-7 text-slate-300">
              旅居上海的自由摄影师，毕业于伦敦艺术大学摄影专业，曾担任纪录片摄影指导。镜头对我来说是一种呼吸的方式，
              我擅长在光影与空间中捕捉情绪，也热衷于与跨界艺术家合作，将声音、气味、装置融入影像体验。
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              过去十年，我为 30+ 国际品牌、40 对新人、12 场艺术展览提供过定制影像方案。作品曾获 IPA International
              Photography Awards 专业组银奖，并被《National Geographic Traveler》杂志专题报道。
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card title="创作关键词" content="情绪叙事 / 城市光影 / 自然呼吸 / 沉浸式体验" />
              <Card title="代表客户" content="Chanel Beauty · MUJI · 网易时尚 · 城市剧院" />
              <Card title="设备偏好" content="Fujifilm GFX 系列 / Leica M / Sony Cinema Line" />
              <Card title="正在探索" content="AI 影像策展、光场摄影、实时互动影像" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-aurora">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">创作时间线</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-300">
              <li>
                <span className="font-semibold text-white">2024</span> · 与沉浸式剧场合作《浮光》，打造 360° 影像包裹式舞台。
              </li>
              <li>
                <span className="font-semibold text-white">2022</span> · 纪录片《风的方向》入围 FIRST 青年影展，并担任摄影指导。
              </li>
              <li>
                <span className="font-semibold text-white">2020</span> · 成立个人影像品牌“光影私语”，聚焦叙事型婚礼与品牌视觉。
              </li>
              <li>
                <span className="font-semibold text-white">2016</span> · 伦敦艺术大学摄影专业硕士毕业，旅居欧洲开始城市漫游计划。
              </li>
            </ul>
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
              <p className="font-semibold text-white">创作理念</p>
              <p className="mt-2">
                “光是时间的诗，影是情绪的形状。所有影像都应当能被触摸、被呼吸。”
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-aurora">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
      <p className="mt-3 text-sm text-slate-200">{content}</p>
    </div>
  );
}
