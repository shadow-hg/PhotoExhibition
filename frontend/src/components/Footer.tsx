import { Link } from 'react-router-dom';
import { FaInstagram, FaWeibo, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="gradient-frame inline-flex rounded-full p-[2px]">
              <div className="rounded-full bg-slate-950 px-4 py-2 font-display text-lg text-white">光影私语</div>
            </div>
            <p className="text-sm text-slate-400">
              用镜头收集光线，用影像讲述故事。沉浸式的摄影展览体验，为你的灵感注入全新维度。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">站点导航</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li><Link to="/">首页</Link></li>
              <li><Link to="/gallery">作品集</Link></li>
              <li><Link to="/exhibitions">展览计划</Link></li>
              <li><Link to="/about">关于我</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">联系合作</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>邮箱：hello@lightpoem.studio</li>
              <li>微信：lightpoem</li>
              <li>工作室：上海市黄浦区 J·ART 空间</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">关注我</h3>
            <div className="mt-3 flex space-x-3 text-xl text-slate-400">
              <a href="https://www.instagram.com" className="hover:text-white" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://www.weibo.com" className="hover:text-white" aria-label="Weibo">
                <FaWeibo />
              </a>
              <a href="https://www.youtube.com" className="hover:text-white" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} 光影私语摄影工作室. 保留所有权利。</p>
          <p>Crafted with光 by gpt-5-codex</p>
        </div>
      </div>
    </footer>
  );
}
