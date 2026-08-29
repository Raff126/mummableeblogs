'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'All Articles', path: '/admin/articles', icon: '📝' },
  { label: 'Write New Post', path: '/admin/articles/new', icon: '✍️' },
  { label: 'Categories Hubs', path: '/admin/categories', icon: '📁' },
  { label: 'Media Library', path: '/admin/media', icon: '🖼️' },
  { label: 'Instagram Feed', path: '/admin/instagram', icon: '📷' },
  { label: 'Homepage Editor', path: '/admin/homepage', icon: '🏡' },
  { label: 'About Page Editor', path: '/admin/about', icon: '👩‍👧‍👧' },
  { label: 'Work With Us Editor', path: '/admin/work-with-us', icon: '🤝' },
  { label: 'Discount Codes', path: '/admin/deals', icon: '🏷️' },
  { label: 'Site Pages', path: '/admin/pages', icon: '📄' },
  { label: 'Subscribers', path: '/admin/subscribers', icon: '💌' },
  { label: 'Inquiries', path: '/admin/inquiries', icon: '📬' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrentActive = (itemPath: string) => {
    if (!pathname) return false;
    const cleanCurrent = pathname.replace(/\/$/, '');
    const cleanItem = itemPath.replace(/\/$/, '');
    return cleanCurrent === cleanItem;
  };

  return (
    <div className="min-h-screen bg-[#F8EDEF] flex flex-col md:flex-row font-sans text-[#332D2F]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#683846] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/images/mama-logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-0.5" />
          <span className="font-serif text-lg font-bold">MummaBee Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg text-lg"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-r border-[#B75B70]/15 flex-shrink-0 flex flex-col justify-between shadow-soft min-h-[calc(100vh-60px)] md:min-h-screen`}
      >
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-gray-100 hidden md:flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 bg-[#F8EDEF] border border-[#B75B70]/30 shadow-xs flex items-center justify-center">
              <img src="/images/mama-logo.png" alt="MummaBee logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#683846] leading-none">MummaBee</h1>
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mt-1">
                CMS Manager
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive = isCurrentActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl font-sans text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#683846] text-white shadow-xs'
                      : 'text-[#332D2F] hover:bg-[#F8EDEF] hover:text-[#683846]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[#F8EDEF] text-[#B75B70] hover:bg-[#B75B70] hover:text-white font-sans text-xs font-bold transition-all shadow-2xs"
          >
            <span>🌐</span>
            <span>View Live Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
