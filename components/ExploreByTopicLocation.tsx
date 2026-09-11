'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

const LOCATIONS = [
  { label: 'Dubai Guides', path: '/uae-with-kids' },
  { label: 'Abu Dhabi Spots', path: '/uae-with-kids' },
  { label: 'Ras Al Khaimah', path: '/travel' },
  { label: 'UAE-Wide Finds', path: '/uae-with-kids' },
];

const TOPICS = [
  { label: 'UAE With Kids', path: '/uae-with-kids' },
  { label: 'Family Life', path: '/family-life' },
  { label: 'Food & Dining', path: '/food' },
  { label: 'Family Travel', path: '/travel' },
  { label: 'School & Activities', path: '/school-and-activities' },
  { label: 'Brands We Love', path: '/brands-we-love' },
  { label: 'The Expat Edit', path: '/the-expat-edit' },
  { label: 'UAE Deals', path: '/uae-deals' },
];

export default function ExploreByTopicLocation() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const loadLatest = async () => {
    const local = getInitialHomepage();
    setContent(local);

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

  const eyebrow = content.exploreEyebrow !== undefined ? content.exploreEyebrow.trim() : (DEFAULT_HOMEPAGE.exploreEyebrow || 'DISCOVER GUIDES');
  const headline = content.exploreHeadline !== undefined ? content.exploreHeadline.trim() : (DEFAULT_HOMEPAGE.exploreHeadline || 'Explore by Topic or Location');

  return (
    <section className="py-16 bg-[#F8EDEF]/40 border-y border-[#B75B70]/15">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || headline) && (
          <div className="text-center max-w-xl mx-auto mb-8">
            {eyebrow ? (
              <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
                {eyebrow}
              </span>
            ) : null}
            {headline ? (
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                {headline}
              </h2>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Location Group */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 text-center space-y-4 shadow-soft">
            <span className="text-[10px] font-bold tracking-widest text-[#683846] uppercase block">
              📍 BY LOCATION
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc.label}
                  href={loc.path}
                  className="bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-semibold px-4 py-2 rounded-full border border-[#B75B70]/20 shadow-2xs transition-all"
                >
                  {loc.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Topic Group */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 text-center space-y-4 shadow-soft">
            <span className="text-[10px] font-bold tracking-widest text-[#683846] uppercase block">
              📚 BY TOPIC
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {TOPICS.map((topic) => (
                <Link
                  key={topic.label}
                  href={topic.path}
                  className="bg-[#F8EDEF] hover:bg-[#B75B70] hover:text-white text-[#683846] text-xs font-semibold px-4 py-2 rounded-full border border-[#B75B70]/20 shadow-2xs transition-all"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
