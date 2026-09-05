'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';
import { SOCIAL_LINKS } from '../data/nav';

export default function HeroSection() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const loadLatest = () => {
    const local = getInitialHomepage();
    setContent(local);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object' && data.heroHeadline) {
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

  const headline = content.heroHeadline || DEFAULT_HOMEPAGE.heroHeadline;
  const isDefaultHeadline = !headline || headline.trim() === 'Your guide to family life in the UAE.' || headline.includes('family life');

  return (
    <section className="relative bg-[#F8EDEF] overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-[#B75B70]/15">
      {/* Signature Ambient Blush Circles */}
      <div 
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-88 h-88 sm:w-96 sm:h-96 bg-[#EAD4D0]/80 rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-white/50 rounded-full pointer-events-none" 
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Editorial Typography, CTAs & Proof Stats */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#B75B70]/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B75B70]" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase">
                {content.heroEyebrow || 'UAE FAMILY LIFE • FOOD • TRAVEL • ACTIVITIES'}
              </span>
            </div>

            {/* Signature Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[54px] xl:text-[58px] font-bold text-[#683846] leading-[1.14] tracking-tight">
              {isDefaultHeadline ? (
                <>
                  Your guide to<br />
                  <span className="font-serif italic font-normal text-[#B75B70]">family life</span><br />
                  in the UAE.
                </>
              ) : (
                <span>{headline}</span>
              )}
            </h1>

            {/* Sub-badge: Dubai & Abu Dhabi • Honest Family Recommendations */}
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-[#B75B70]">
              <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0" />
              <span className="font-semibold text-[#683846]">Dubai &amp; Abu Dhabi</span>
              <span className="text-[#B75B70]/50">•</span>
              <span className="text-[#B75B70]">Honest Family Recommendations</span>
            </div>

            {/* Supporting Description */}
            <p className="font-sans text-xs sm:text-sm md:text-[15px] text-[#332D2F]/80 leading-relaxed max-w-lg font-normal">
              {content.heroDescription ||
                'Discover family-friendly places, practical guides, honest recommendations and real experiences between Dubai and Abu Dhabi.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto">
              <Link
                href={content.heroPrimaryCtaUrl || "/uae-with-kids"}
                className="group inline-flex items-center justify-center gap-2 bg-[#683846] hover:bg-[#522b37] text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(104,56,70,0.22)] hover:shadow-[0_12px_28px_rgba(104,56,70,0.32)] transition-all transform hover:-translate-y-0.5 text-center"
              >
                <span>{content.heroPrimaryCtaText || 'EXPLORE UAE GUIDES'}</span>
                <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <Link
                href={content.heroSecondaryCtaUrl || "/about"}
                className="inline-flex items-center justify-center bg-white hover:bg-[#F8EDEF] text-[#683846] text-xs sm:text-[13px] font-bold tracking-wider uppercase px-8 py-3.5 rounded-full border border-[#B75B70]/30 shadow-xs hover:border-[#683846]/40 transition-all transform hover:-translate-y-0.5 text-center"
              >
                <span>{content.heroSecondaryCtaText || 'MEET MUMMA BEE'}</span>
              </Link>
            </div>

            {/* 3-Column Proof Stats Strip */}
            <div className="pt-4 flex items-center gap-6 sm:gap-10 border-t border-[#B75B70]/15">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">100+</div>
                <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-[#332D2F]/60 uppercase mt-0.5">
                  TESTED GUIDES
                </div>
              </div>
              <div className="w-px h-8 bg-[#B75B70]/15 hidden sm:block" />
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">2 Cities</div>
                <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-[#332D2F]/60 uppercase mt-0.5">
                  DUBAI &amp; ABU DHABI
                </div>
              </div>
              <div className="w-px h-8 bg-[#B75B70]/15 hidden sm:block" />
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">100%</div>
                <div className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-[#332D2F]/60 uppercase mt-0.5">
                  HONEST REVIEWS
                </div>
              </div>
            </div>

            {/* Popular Topics Quick Links */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-sans font-bold tracking-wider text-[#683846]/70 uppercase mr-1">
                  POPULAR NOW:
                </span>
                <Link
                  href="/uae-with-kids"
                  className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all hover:-translate-y-0.5"
                >
                  Dubai with kids
                </Link>
                <Link
                  href="/uae-with-kids"
                  className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all hover:-translate-y-0.5"
                >
                  Weekend ideas
                </Link>
                <Link
                  href="/food"
                  className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all hover:-translate-y-0.5"
                >
                  Family dining
                </Link>
                <Link
                  href="/travel"
                  className="text-[11px] bg-white hover:bg-[#F8EDEF] text-[#683846] hover:text-[#B75B70] font-medium px-3.5 py-1 rounded-full border border-gray-200 shadow-2xs transition-all hover:-translate-y-0.5"
                >
                  Staycations
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Arched Portrait Portal with Badges & Playful Doodles */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center relative py-6 lg:py-4">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px]">
              
              {/* Playful Doodles */}
              {/* 1. Golden 4-point sparkle star above arch */}
              <svg 
                aria-hidden="true" 
                className="absolute -top-5 left-10 sm:-top-7 sm:left-14 w-6 h-6 sm:w-7 sm:h-7 text-[#D4A373] pointer-events-none z-20" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
              </svg>

              {/* 2. Squiggly rose doodle line on left */}
              <svg 
                aria-hidden="true" 
                className="absolute top-1/3 -left-6 sm:-left-8 w-8 h-8 sm:w-10 sm:h-10 text-[#B75B70]/70 pointer-events-none z-20" 
                viewBox="0 0 40 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <path d="M5 28C10 24 12 12 20 20C26 26 30 10 36 16" />
              </svg>

              {/* 3. Starburst sparkle doodle at bottom-right */}
              <svg 
                aria-hidden="true" 
                className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-5 w-8 h-8 sm:w-10 sm:h-10 text-[#B75B70]/60 pointer-events-none z-20" 
                viewBox="0 0 32 32" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              >
                <line x1="16" y1="2" x2="16" y2="30" />
                <line x1="2" y1="16" x2="30" y2="16" />
                <line x1="6" y1="6" x2="26" y2="26" />
                <line x1="6" y1="26" x2="26" y2="6" />
              </svg>

              {/* Outer delicate golden / rose framing outline */}
              <div 
                aria-hidden="true"
                className="absolute -inset-2.5 sm:-inset-3.5 rounded-t-[160px] sm:rounded-t-[190px] rounded-b-[40px] sm:rounded-b-[48px] border-2 border-[#D4A373]/40 pointer-events-none"
              />

              {/* Main Arched Frame */}
              <div 
                className="relative aspect-[4/5] w-full rounded-t-[150px] sm:rounded-t-[180px] rounded-b-[36px] sm:rounded-b-[44px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(104,56,70,0.18)] border-6 sm:border-8 border-white group"
              >
                <img
                  src={content.heroImage || "/images/358792494_661391199240576_3424351230899219709_n.jpg"}
                  alt="Donne and her daughters in the UAE"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/358792494_661391199240576_3424351230899219709_n.jpg";
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
                />

                {/* Subtle warm depth vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#683846]/20 via-transparent to-transparent opacity-30 pointer-events-none" />
              </div>

              {/* Floating Top-Right Tag: DUBAI & BEYOND */}
              <div className="absolute top-4 -right-2 sm:top-6 sm:-right-4 bg-white/95 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-[0_4px_16px_rgba(104,56,70,0.14)] border border-[#B75B70]/20 flex items-center gap-1.5 z-20">
                <span className="w-2 h-2 rounded-full bg-[#E5A83B]" />
                <span className="font-sans text-[10px] sm:text-[11px] font-bold tracking-wider text-[#683846] uppercase whitespace-nowrap">
                  DUBAI &amp; BEYOND
                </span>
              </div>

              {/* Floating Bottom Badge: Tested by Donne & Family • 100% Real Reviews */}
              <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-[0_8px_24px_rgba(104,56,70,0.15)] border border-[#B75B70]/25 flex items-center justify-center gap-2 z-20 whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B75B70] animate-pulse shrink-0" />
                <span className="font-serif text-xs font-bold text-[#683846] whitespace-nowrap">
                  Tested by Donne &amp; Family
                </span>
                <span className="text-[#B75B70]/50">•</span>
                <span className="font-sans text-[11px] text-[#332D2F]/70 font-medium whitespace-nowrap">
                  100% Real Reviews
                </span>
              </div>

            </div>

            {/* Social Follow Strip below portrait */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#332D2F]/75">
              <span className="text-[11px] font-medium tracking-wide">Follow our adventures:</span>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#B75B70] hover:text-[#683846] font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@mummabeeblog</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
