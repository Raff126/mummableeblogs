import Link from 'next/link';
import { PRIMARY_NAV, SOCIAL_LINKS } from '../data/nav';

export default function Footer() {
  return (
    <footer className="bg-[#683846] text-white pt-16 pb-12 border-t border-[#B75B70]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand */}
          <div className="space-y-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-[#B75B70]/40 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/mama-logo.png"
                  alt="MummaBeeBlog logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-serif text-2xl font-bold text-white">
                MummaBeeBlog
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#F8EDEF]/80 leading-relaxed max-w-sm mx-auto lg:mx-0">
              Your trusted guide to family life, food, travel, and activities in the UAE. Made with love by Donne.
            </p>
          </div>

          {/* Column 2: Explore Hubs (Hidden on mobile & tablet portrait) */}
          <div className="hidden lg:block">
            <h4 className="font-serif font-bold text-lg text-white mb-4">Explore Hubs</h4>
            <ul className="space-y-2.5">
              {PRIMARY_NAV.slice(1, 8).map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className="text-xs text-[#F8EDEF]/80 hover:text-[#D7BB91] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About & Work (Hidden on mobile & tablet portrait) */}
          <div className="hidden lg:block">
            <h4 className="font-serif font-bold text-lg text-white mb-4">MummaBeeBlog</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-xs text-[#F8EDEF]/80 hover:text-[#D7BB91] transition-colors">
                  About Donne & Her Family
                </Link>
              </li>
              <li>
                <Link href="/work-with-us" className="text-xs text-[#F8EDEF]/80 hover:text-[#D7BB91] transition-colors">
                  Work With Us (Partnerships)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-3 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h4 className="font-serif font-bold text-lg text-white">Connect</h4>
            <p className="text-xs text-[#F8EDEF]/80">
              Follow our daily UAE family moments and tips:
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram (@mummabeeblog)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#B75B70] text-white hover:text-white border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm group"
                title="Instagram (@mummabeeblog)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook (Mummabeeblog)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1877F2] text-white hover:text-white border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm group"
                title="Facebook (Mummabeeblog)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok (@mummabee.blog)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-black text-white hover:text-white border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm group"
                title="TikTok (@mummabee.blog)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.94-4.52V8.47a8.28 8.28 0 0 0 4.83 1.54V6.69h-1z"/>
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href={SOCIAL_LINKS.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest (@mummabeeblog)"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E60023] text-white hover:text-white border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm group"
                title="Pinterest (@mummabeeblog)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.225-.177.268-.407.161-1.523-.708-2.472-2.934-2.472-4.721 0-3.844 2.793-7.375 8.058-7.375 4.232 0 7.521 3.016 7.521 7.047 0 4.204-2.651 7.589-6.331 7.589-1.236 0-2.399-.643-2.796-1.402l-.761 2.898c-.276 1.063-1.022 2.396-1.524 3.208C9.539 23.827 10.743 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-between text-center gap-4 text-xs text-[#F8EDEF]/60">
          <p>© {new Date().getFullYear()} MummaBeeBlog. All rights reserved.</p>
          <p className="font-medium tracking-wider uppercase text-[10px] text-[#D7BB91]">
            UAE FAMILY LIFE • FOOD • TRAVEL • ACTIVITIES
          </p>
        </div>
      </div>
    </footer>
  );
}
