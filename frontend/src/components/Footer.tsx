export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80">
      <div className="mx-auto max-w-5xl px-6 py-10 text-center text-sm text-slate-400">
        <div className="space-y-3">
          <div className="gradient-frame inline-flex rounded-full p-[2px]">
            <div className="rounded-full bg-slate-950 px-4 py-2 font-display text-lg text-white">光影私语</div>
          </div>
          <p>
            只留下光影与静默，把注意力交还给作品本身。感谢驻足观看。
          </p>
        </div>
        <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} 光影私语摄影。All photos by the artist.</p>
      </div>
    </footer>
  );
}
