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
  const isDefaultHeadline = headline.trim() === 'Your guide to family life in the UAE.';

  return (
    <section className="relative bg-[#F8EDEF] overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-[#B75B70]/15">
      {/* Sample 3 Subtle Family Doodles Background Pattern (4% opacity) */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.045] bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 15l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM85 70l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM90 20c0 5-4 9-9 9s-9-4-9-9 4-9 9-9 9 4 9 9zM30 85c-4 0-8 3-8 7s4 7 8 7 8-3 8-7-4-7-8-7zM60 45a6 6 0 1 0 0-12 6 6 0 0 0 0 12z' fill='%23683846' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Organic Curved Wave Backdrop flowing behind the circle (Sample 3 style) */}
      <div 
        aria-hidden="true"
        className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-[#FAF3EC]/90 via-[#F3DEE3]/70 to-transparent rounded-bl-[200px] lg:rounded-bl-[320px] pointer-events-none"
      />

      {/* Signature Ambient Circles matching brand */}
      <div 
        aria-hidden="true"
        className="absolute -bottom-24 -left-24 w-88 h-88 sm:w-96 sm:h-96 bg-[#EAD4D0]/80 rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-white/45 rounded-full pointer-events-none" 
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typography & CTAs (inspired by Sample 3: "Play, Learn and Grow, Together..") */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#B75B70]/25 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#B75B70] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase">
                {content.heroEyebrow || 'UAE FAMILY LIFE • FOOD • TRAVEL • ACTIVITIES'}
              </span>
            </div>

            {/* Headline with Sample 3 dual rhythm */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-bold text-[#683846] leading-[1.1] tracking-tight">
              {isDefaultHeadline ? (
                <>
                  <span className="block text-2xl sm:text-4xl lg:text-[46px] font-sans font-bold text-[#683846]">
                    Discover, Explore &amp;
                  </span>
                  <span className="block font-serif text-[#B75B70] mt-1">
                    Family Life, <span className="text-[#683846] font-normal italic">Together.</span>
                  </span>
                </>
              ) : (
                <span>{headline}</span>
              )}
            </h1>

            {/* Supporting Description */}
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#332D2F]/85 leading-relaxed max-w-xl font-normal">
              {content.heroDescription ||
                'Discover family-friendly places, practical guides, honest recommendations and real experiences between Dubai and Abu Dhabi.'}
            </p>

            {/* CTA Buttons (Sample 3 style: Filled burgundy button + Outline button) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1 w-full sm:w-auto">
              <Link
                href={content.heroPrimaryCtaUrl || "/uae-with-kids"}
                className="group inline-flex items-center justify-center gap-2.5 bg-[#683846] hover:bg-[#522b37] text-white text-xs sm:text-[13px] font-bold tracking-wider uppercase px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(104,56,70,0.22)] hover:shadow-[0_12px_28px_rgba(104,56,70,0.32)] transition-all transform hover:-translate-y-0.5 text-center"
              >
                <span>{content.heroPrimaryCtaText || 'EXPLORE UAE GUIDES'}</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href={content.heroSecondaryCtaUrl || "/about"}
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/80 text-[#683846] hover:text-[#522b37] text-xs sm:text-[13px] font-bold tracking-wider uppercase px-8 py-3.5 rounded-full border-2 border-[#683846]/30 hover:border-[#683846] transition-all transform hover:-translate-y-0.5 text-center shadow-xs"
              >
                <span>{content.heroSecondaryCtaText || 'MEET MUMMA BEE'}</span>
              </Link>
            </div>

            {/* Popular Topics Quick Links */}
            <div className="pt-2 sm:pt-3">
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

            {/* Social Follow Strip */}
            <div className="pt-3 border-t border-[#B75B70]/15 flex items-center gap-4 text-xs text-[#332D2F]/75">
              <span className="text-[11px] font-medium tracking-wide">Follow our journey:</span>
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

          {/* Right Column: Circular Portal with Date Burgundy Crescent Ring (Directly inspired by Sample 3) */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center relative py-6 lg:py-4">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[450px]">
              
              {/* Sample 3 Crescent Ring Arc: Rich Date Burgundy & Mumma Rose framing the left curve */}
              <div 
                aria-hidden="true"
                className="absolute -inset-3 sm:-inset-4 rounded-full border-[10px] sm:border-[14px] border-[#683846] border-r-transparent -rotate-12 pointer-events-none transition-transform duration-500 hover:-rotate-6"
              />

              {/* Secondary delicate rose crescent accent */}
              <div 
                aria-hidden="true"
                className="absolute -inset-1.5 sm:-inset-2 rounded-full border-[4px] border-[#B75B70]/40 border-l-transparent rotate-45 pointer-events-none"
              />

              {/* Main Circular Portal framing Donne & her daughters */}
              {/* 1:1 Aspect ratio inside rounded-full: Donne in center-top, both girls beside her */}
              <div 
                className="relative aspect-square w-full rounded-full overflow-hidden bg-white shadow-[0_20px_50px_rgba(104,56,70,0.18)] border-6 sm:border-8 border-white transition-all duration-300 group"
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

              {/* Authentic Floating MummaBee Verification Badge */}
              <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-auto bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-[0_8px_24px_rgba(104,56,70,0.15)] border border-[#B75B70]/25 flex items-center justify-center gap-2.5 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B75B70] animate-pulse shrink-0" />
                <span className="font-serif text-xs font-bold text-[#683846] whitespace-nowrap">
                  Tested by Donne & Family
                </span>
                <span className="hidden sm:inline text-[#B75B70]/50">•</span>
                <span className="hidden sm:inline font-sans text-[10px] text-[#332D2F]/70 font-medium whitespace-nowrap">
                  Dubai & Abu Dhabi
                </span>
              </div>

            </div>

            {/* Trust subtitle */}
            <div className="mt-6 flex items-center gap-2 text-center text-xs text-[#332D2F]/75">
              <span className="text-[11px] font-sans text-[#683846]/80 font-medium">
                Real reviews &amp; advice from a mum raising two girls in the desert
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
