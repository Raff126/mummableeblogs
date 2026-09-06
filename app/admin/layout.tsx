'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '../../data/store';
import {
  getCurrentUser,
  getCurrentUserRole,
  isAdmin,
  CurrentSessionUser,
  setCurrentUser,
} from '../../data/users';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly: boolean;
}

const ALL_ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: '📊', adminOnly: false },
  { label: 'All Articles', path: '/admin/articles', icon: '📝', adminOnly: false },
  { label: 'Write New Post', path: '/admin/articles/new', icon: '✍️', adminOnly: false },
  { label: 'Categories Hubs', path: '/admin/categories', icon: '📁', adminOnly: false },
  { label: 'Media Library', path: '/admin/media', icon: '🖼️', adminOnly: false },
  { label: 'Instagram Feed', path: '/admin/instagram', icon: '📷', adminOnly: false },
  { label: 'Homepage Editor', path: '/admin/homepage', icon: '🏡', adminOnly: false },
  { label: 'About Page Editor', path: '/admin/about', icon: '👩‍👧‍👧', adminOnly: false },
  { label: 'Work With Us Editor', path: '/admin/work-with-us', icon: '🤝', adminOnly: false },
  { label: 'Discount Codes', path: '/admin/deals', icon: '🏷️', adminOnly: false },
  { label: 'Site Pages', path: '/admin/pages', icon: '📄', adminOnly: false },
  { label: 'Subscribers', path: '/admin/subscribers', icon: '💌', adminOnly: false },
  { label: 'Inquiries', path: '/admin/inquiries', icon: '📬', adminOnly: false },
  { label: 'User Management', path: '/admin/users', icon: '👥', adminOnly: true },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️', adminOnly: true },
  { label: 'System Analytics', path: '/admin/analytics', icon: '📈', adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setSessionUser] = useState<CurrentSessionUser | null>(null);

  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';

  const loadUserData = () => {
    const user = getCurrentUser();
    setSessionUser(user);
  };

  useEffect(() => {
    if (!isLoginPage) {
      if (!isAuthenticated()) {
        router.push('/admin/login');
      } else {
        loadUserData();
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }

    const handleUserChange = () => loadUserData();
    window.addEventListener('mummabee_current_user_changed', handleUserChange);
    return () => {
      window.removeEventListener('mummabee_current_user_changed', handleUserChange);
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8EDEF] flex items-center justify-center font-sans text-xs text-[#683846]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#B75B70] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold">Verifying Staff Authorization...</span>
        </div>
      </div>
    );
  }

  const userRole = currentUser?.role || 'Admin';
  const userIsAdmin = userRole === 'Admin';

  // Dynamic Navigation Filtering: Assistants do NOT see adminOnly links
  const visibleNavItems = ALL_ADMIN_NAV.filter((item) => {
    if (item.adminOnly && !userIsAdmin) {
      return false;
    }
    return true;
  });

  const isCurrentActive = (itemPath: string) => {
    if (!pathname) return false;
    const cleanCurrent = pathname.replace(/\/$/, '');
    const cleanItem = itemPath.replace(/\/$/, '');
    return cleanCurrent === cleanItem;
  };

  // Route Guard: If an Assistant attempts to navigate directly to Admin-only URLs
  const cleanPath = (pathname || '').replace(/\/$/, '');
  const isAdminOnlyRoute =
    cleanPath === '/admin/users' ||
    cleanPath === '/admin/settings' ||
    cleanPath === '/admin/analytics';

  const isAccessForbidden = isAdminOnlyRoute && !userIsAdmin;

  return (
    <div className="min-h-screen bg-[#F8EDEF] flex flex-col md:flex-row font-sans text-[#332D2F]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#683846] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/images/mama-logo.png" alt="Logo" className="w-8 h-8 rounded-full bg-white p-0.5" />
          <div>
            <span className="font-serif text-lg font-bold block leading-none">MummaBee CMS</span>
            <span className="text-[10px] font-sans text-[#D7BB91]">
              {userIsAdmin ? '👑 Admin' : userRole === 'Artist' ? '🎨 Artist' : '🛡️ Assistant'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg text-lg cursor-pointer"
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
          {/* Admin Header & Current Role Badge */}
          <div className="p-5 border-b border-gray-100 hidden md:flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 bg-[#F8EDEF] border border-[#B75B70]/30 shadow-xs flex items-center justify-center shrink-0">
              <img src="/images/mama-logo.png" alt="MummaBee logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-serif text-lg font-bold text-[#683846] leading-none truncate">
                {currentUser?.name || 'MummaBee'}
              </h1>
              <div className="mt-1 flex items-center gap-1.5">
                {userIsAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#683846] text-white tracking-wider uppercase">
                    <span>👑</span>
                    <span>Admin</span>
                  </span>
                ) : userRole === 'Artist' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-900 border border-purple-300 tracking-wider uppercase">
                    <span>🎨</span>
                    <span>Artist</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 tracking-wider uppercase">
                    <span>🛡️</span>
                    <span>Assistant</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Items (Role-Filtered) */}
          <nav className="p-4 space-y-1">
            {visibleNavItems.map((item) => {
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

        {/* Footer Actions & Account Status */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <div className="px-2 py-1.5 bg-gray-50 rounded-xl border border-gray-200/60 text-[10px] text-[#332D2F]/70 truncate">
            <span className="font-semibold block text-[#332D2F] truncate">
              {currentUser?.email || 'Authenticated User'}
            </span>
            <span className="text-[9px] text-[#B75B70] uppercase font-bold tracking-wider">
              {userIsAdmin ? 'Full Access' : 'Content Access Only'}
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[#F8EDEF] text-[#B75B70] hover:bg-[#B75B70] hover:text-white font-sans text-xs font-bold transition-all shadow-2xs"
          >
            <span>🌐</span>
            <span>View Live Website</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-red-600 hover:bg-red-50 font-sans text-xs font-bold transition-all cursor-pointer"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport with Route Guard Protection */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        {isAccessForbidden ? (
          <div className="min-h-[450px] flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-8 border border-red-200 shadow-card text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto text-2xl">
                🚫
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  HTTP 403 Forbidden
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#683846] mt-2">
                  Access Restricted
                </h2>
                <p className="text-xs text-[#332D2F]/75 leading-relaxed">
                  This section is restricted to full-access Administrators. Assistant accounts do not have permission to view or modify this area.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-block px-6 py-2.5 bg-[#683846] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#522b37] transition-all"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
