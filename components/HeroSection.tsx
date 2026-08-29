'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function HeroSection() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const loadLatest = () => {
    const local = getInitialHomepage();
    setContent(local);
    fetch(`/api/homepage?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && data.heroHeadline) {
          // Write fresh server data back to localStorage so it's always up-to-date
          try { localStorage.setItem('mummabee_homepage', JSON.stringify(data)); } catch (_) {}
          setContent((prev) => ({ ...prev, ...data }));
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

  return (
    <section className="relative bg-[#F8EDEF] overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-[#B75B70]/15">
      {/* Soft circular decorative background shapes */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#EAD4D0]/70 rounded-full pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/40 rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline & Value Promise */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            <span className="inline-block text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase">
              {content.heroEyebrow || 'UAE FAMILY LIFE • FOOD • TRAVEL • ACTIVITIES'}
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#683846] leading-[1.15] sm:leading-[1.12] tracking-tight">
              {content.heroHeadline ? (
                <span>{content.heroHeadline}</span>
              ) : (
                <>
                  Your guide to<br />
                  family life in<br />
                  the <span className="text-[#B75B70]">UAE.</span>
                </>
              )}
            </h1>

            <p className="font-sans text-xs sm:text-sm md:text-base text-[#332D2F] leading-relaxed max-w-lg">
              {content.heroDescription || 'Discover family-friendly places, practical guides, honest recommendations and real experiences between Dubai and Abu Dhabi.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              <Link
                href={content.heroPrimaryCtaUrl || "/uae-with-kids"}
                className="bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold tracking-wider uppercase px-7 py-3.5 sm:py-3 rounded-full shadow-soft transition-all text-center"
              >
                {content.heroPrimaryCtaText || 'EXPLORE UAE GUIDES'}
              </Link>
              <Link
                href={content.heroSecondaryCtaUrl || "/about"}
                className="bg-transparent hover:bg-white/60 text-[#683846] text-xs font-bold tracking-wider uppercase px-7 py-3.5 sm:py-3 rounded-full border border-[#B75B70]/50 transition-all text-center"
              >
                {content.heroSecondaryCtaText || 'MEET MUMMA BEE'}
              </Link>
            </div>

            {/* Popular Now Quick Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-3">
              <span className="text-[10px] font-bold tracking-wider text-[#332D2F]/70 uppercase mr-1">
                POPULAR NOW
              </span>
              <Link
                href="/uae-with-kids"
                className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all"
              >
                Dubai with kids
              </Link>
              <Link
                href="/uae-with-kids"
                className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all"
              >
                Weekend ideas
              </Link>
              <Link
                href="/food"
                className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all"
              >
                Family dining
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Photograph */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-[4/5] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-card border-4 border-white">
              <img
                src={content.heroImage || "/images/358792494_661391199240576_3424351230899219709_n.jpg"}
                alt="Donne and her daughters in the UAE"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/358792494_661391199240576_3424351230899219709_n.jpg";
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/40 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/20">
                FAMILY-TESTED • UAE-BASED
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
