'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function DiscoverySection() {
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

  const eyebrow = content.discoveryEyebrow !== undefined ? content.discoveryEyebrow : (DEFAULT_HOMEPAGE.discoveryEyebrow || 'START EXPLORING');
  const headline = content.discoveryHeadline !== undefined ? content.discoveryHeadline : (DEFAULT_HOMEPAGE.discoveryHeadline || 'What are you looking for?');

  const cards = [
    {
      title: 'UAE With Kids',
      description: content.discoveryCard1Desc !== undefined ? content.discoveryCard1Desc : (DEFAULT_HOMEPAGE.discoveryCard1Desc || 'Activities, attractions and family days out'),
      link: '/uae-with-kids',
      iconBg: 'bg-[#FBE8EC] text-[#B75B70] border border-[#B75B70]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 21l9-18 9 18M3 21h18M7.5 12h9" />
        </svg>
      ),
    },
    {
      title: 'Food & Dining',
      description: content.discoveryCard2Desc !== undefined ? content.discoveryCard2Desc : (DEFAULT_HOMEPAGE.discoveryCard2Desc || 'Family-friendly places worth trying'),
      link: '/food',
      iconBg: 'bg-[#FCF4E3] text-[#D89B2B] border border-[#D89B2B]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Family Travel',
      description: content.discoveryCard3Desc !== undefined ? content.discoveryCard3Desc : (DEFAULT_HOMEPAGE.discoveryCard3Desc || 'Tips, stays and practical itineraries'),
      link: '/travel',
      iconBg: 'bg-[#E3F2F3] text-[#4A8894] border border-[#4A8894]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      ),
    },
    {
      title: 'Family Life',
      description: content.discoveryCard4Desc !== undefined ? content.discoveryCard4Desc : (DEFAULT_HOMEPAGE.discoveryCard4Desc || 'School, motherhood and growing together'),
      link: '/family-life',
      iconBg: 'bg-[#F8EBF0] text-[#A6536C] border border-[#A6536C]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow.trim() || headline.trim()) ? (
          <div className="text-center mb-9">
            {eyebrow.trim() ? (
              <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
                {eyebrow}
              </span>
            ) : null}
            {headline.trim() ? (
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
                {headline}
              </h2>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.link}
              className="group bg-white p-7 rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#683846] group-hover:text-[#B75B70] transition-colors mb-2">
                {card.title}
              </h3>
              <p className="text-xs text-[#332D2F] leading-relaxed max-w-[200px]">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
