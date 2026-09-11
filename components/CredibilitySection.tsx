'use client';

import { useState, useEffect } from 'react';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function CredibilitySection() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const loadLatest = async () => {
    const local = getInitialHomepage();
    setContent(local);

    // 1. Query live Firestore first (cross-device cloud sync)
    try {
      const { fetchHomepageFromFirestore } = await import('../utils/firestoreSettings');
      const fsData = await fetchHomepageFromFirestore();
      if (fsData && typeof fsData === 'object' && Object.keys(fsData).length > 0) {
        setContent((prev) => {
          if (prev.updatedAt && fsData.updatedAt && prev.updatedAt > fsData.updatedAt) {
            return prev;
          }
          const merged = { ...DEFAULT_HOMEPAGE, ...prev, ...fsData };
          try {
            localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
        return;
      }
    } catch (_) {}

    // 2. Fallback to API / static JSON
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setContent((prev) => ({ ...data, ...prev }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.HOMEPAGE && e.detail?.data) {
        setContent(e.detail.data);
      } else {
        loadLatest();
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const badge = content.credibilityBadge !== undefined ? content.credibilityBadge : (DEFAULT_HOMEPAGE.credibilityBadge || 'AUTHENTIC UAE RECOMMENDATIONS');
  const headline = content.credibilityHeadline !== undefined ? content.credibilityHeadline : (DEFAULT_HOMEPAGE.credibilityHeadline || 'Real experiences from a UAE family living between Dubai and Abu Dhabi.');
  const description = content.credibilityDescription !== undefined ? content.credibilityDescription : (DEFAULT_HOMEPAGE.credibilityDescription || 'Every guide is built on authentic parent perspective, practical timing advice, and genuine recommendations designed to help busy families make the most of life in the Emirates.');

  // If all fields are erased, hide section
  if (!badge.trim() && !headline.trim() && !description.trim()) {
    return null;
  }

  return (
    <section className="py-14 bg-white border-y border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {badge.trim() ? (
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
            {badge}
          </span>
        ) : null}
        {headline.trim() ? (
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846] max-w-2xl mx-auto">
            {headline}
          </h2>
        ) : null}
        {description.trim() ? (
          <p className="font-sans text-xs sm:text-sm text-[#332D2F] max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
