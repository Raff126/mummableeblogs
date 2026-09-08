'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ComingSoon from './ComingSoon';
import { getInitialSettings, isAuthenticated, STORAGE_KEYS } from '../data/store';

interface WebsiteGateProps {
  children: ReactNode;
}

export default function WebsiteGate({ children }: WebsiteGateProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAdminUser(isAuthenticated());

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('preview') === 'live' || urlParams.get('preview') === 'admin') {
        setIsLivePreview(true);
      }
    }

    // 1. Initial synchronous check from localStorage
    const settings = getInitialSettings();
    if (typeof settings.comingSoonMode === 'boolean') {
      setIsComingSoon(settings.comingSoonMode);
    }

    // 2. Fetch live settings from Firestore (authoritative)
    (async () => {
      try {
        const { fetchSettingsFromFirestore } = await import('../utils/firestoreSettings');
        const fsSettings = await fetchSettingsFromFirestore();
        if (fsSettings && typeof fsSettings.comingSoonMode === 'boolean') {
          setIsComingSoon(fsSettings.comingSoonMode);
          try {
            const current = getInitialSettings();
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, comingSoonMode: fsSettings.comingSoonMode }));
          } catch (_) {}
        }
      } catch (_) {}
    })();

    // 3. Listen to live settings changes dispatched by admin (same tab)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.SETTINGS) {
        const comingSoon = Boolean(customEvent.detail?.data?.comingSoonMode);
        setIsComingSoon(comingSoon);
      }
    };

    // 4. Listen to storage changes (cross tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.SETTINGS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed.comingSoonMode === 'boolean') {
            setIsComingSoon(parsed.comingSoonMode);
          }
        } catch (_) {}
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Admin routes and explicit /coming-soon page should always render children
  if (pathname?.startsWith('/admin') || pathname === '/coming-soon') {
    return <>{children}</>;
  }

  // During SSR and before client hydration finishes, ALWAYS return children.
  // This guarantees exact HTML match between server and client, eliminating React Error #418 / #423.
  if (!mounted) {
    return <>{children}</>;
  }

  // Once mounted on client:
  if (isComingSoon) {
    // If authenticated admin explicitly requested live preview (e.g. ?preview=live)
    if (isAdminUser && isLivePreview) {
      return (
        <>
          <div className="bg-gradient-to-r from-amber-600 via-[#B75B70] to-amber-700 text-white text-xs font-sans py-2.5 px-4 sticky top-0 z-[100] shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">👁️</span>
              <span>
                <strong>Admin Live Preview:</strong> You are viewing the unpublished live website. Public visitors see the Coming Soon landing page.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <Link
                href="/"
                className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
              >
                <span>View Coming Soon Page</span>
              </Link>
              <Link
                href="/admin/settings"
                className="bg-white text-[#683846] px-3 py-1 rounded-lg font-bold shadow-xs hover:bg-[#FBF4F5] transition-all"
              >
                Turn Off in Settings
              </Link>
            </div>
          </div>
          {children}
        </>
      );
    }

    // Default Coming Soon state for everyone (clean landing page with no admin banner)
    return <ComingSoon />;
  }

  // Normal live website
  return <>{children}</>;
}
