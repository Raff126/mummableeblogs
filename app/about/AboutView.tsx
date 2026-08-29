'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NewsletterBand from '../../components/NewsletterBand';
import GuideCard from '../../components/GuideCard';
import { Article } from '../../data/articles';
import { getInitialAbout, getInitialHomepage, DEFAULT_ABOUT, AboutPageContent, STORAGE_KEYS } from '../../data/store';

export default function AboutView({ topGuides }: { topGuides: Article[] }) {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT);
  const [imgSrc, setImgSrc] = useState<string>('');

  const loadLatest = () => {
    const localAbout = getInitialAbout();
    const localHp = getInitialHomepage();
    const resolvedImage = localAbout.profileImage || localHp.donneImage || DEFAULT_ABOUT.profileImage;
    setContent(localAbout);
    setImgSrc(resolvedImage);

    fetch(`/api/about?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          try { localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(data)); } catch (_) {}
          setContent((prev) => {
            const merged = { ...prev, ...data };
            if (data.profileImage) {
              setImgSrc(data.profileImage);
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.ABOUT && e.detail?.data) {
        setContent(e.detail.data);
        if (e.detail.data.profileImage) {
          setImgSrc(e.detail.data.profileImage);
        }
      } else if (e.detail?.key === STORAGE_KEYS.HOMEPAGE && e.detail?.data?.donneImage) {
        setImgSrc((curr) => curr || e.detail.data.donneImage);
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
    <>
      {/* Hero Section */}
      <section className="bg-[#F8EDEF] py-14 lg:py-20 border-b border-[#B75B70]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
            {content.eyebrow || 'THE MUM BEHIND THE GUIDES'}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#683846] leading-tight">
            {content.headline || "Hi, I'm Donne, the mum behind Mumma Bee Blog."}
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#332D2F] max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {content.leadText || "I'm a mum raising two girls between Dubai and Abu Dhabi. MummaBeeBlog is where I share the family-friendly places we explore, the practical guides I wish I'd had, and the honest recommendations I'd genuinely give to another parent."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-[#332D2F]">
          {/* Author Profile Highlight */}
          <div className="bg-[#F8EDEF] p-8 sm:p-10 rounded-3xl border border-[#B75B70]/20 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-soft">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-white border-2 border-[#B75B70]/40 shadow-xs flex-shrink-0">
              <img
                src={content.profileImage || "/images/358792494_661391199240576_3424351230899219709_n.jpg"}
                alt="Donne - MummaBeeBlog"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <span className="text-[10px] font-bold tracking-widest text-[#B75B70] uppercase block">
                {content.profileBadgeText || 'MEET DONNE'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                {content.profileHeading || 'Why I Started MummaBeeBlog'}
              </h2>
              <p className="text-sm sm:text-base text-[#332D2F] leading-relaxed whitespace-pre-line">
                {content.profileStory || "When we first started exploring the UAE as a family with young kids, finding genuinely useful, family-first information wasn't easy. Tourism websites often copied the same generic bullet points, without answering the practical questions parents actually care about: Is it stroller-accessible? What's the budget? Is there clean shade? When does it get crowded?"}
              </p>
            </div>
          </div>

          {/* Core Philosophy: Experience & Trust */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-3">
              <span className="text-2xl block">🔍</span>
              <h3 className="font-serif text-xl font-bold text-[#683846]">
                {content.pillar1Title || 'Tested Before Recommended'}
              </h3>
              <p className="text-xs sm:text-sm text-[#332D2F] leading-relaxed whitespace-pre-line">
                {content.pillar1Text || "Every venue, play area, and family dining spot featured on MummaBeeBlog has been personally visited and tested with my own daughters. If an experience doesn't meet our standards, it doesn't make it onto the website."}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-3">
              <span className="text-2xl block">👨‍👩‍👧‍👧</span>
              <h3 className="font-serif text-xl font-bold text-[#683846]">
                {content.pillar2Title || 'Our Family Perspective'}
              </h3>
              <p className="text-xs sm:text-sm text-[#332D2F] leading-relaxed whitespace-pre-line">
                {content.pillar2Text || 'Living between Dubai and Abu Dhabi allows us to bring a balanced, two-city perspective. We navigate the early morning school runs, high-summer indoor transitions, and weekend coastal road trips just like you.'}
              </p>
            </div>
          </div>

          {/* Family Privacy Note */}
          <div className="bg-[#F8EDEF]/60 p-6 rounded-2xl border border-[#D7BB91] text-xs text-[#332D2F]/80 leading-relaxed text-center whitespace-pre-line">
            {content.privacyNote || "Note on Family Privacy: While I love sharing real experiences, our daughters' safety and privacy are paramount. We share practical venue insights and memories while keeping full names, exact school schedules, and personal identifiers private."}
          </div>

          {/* Primary CTA */}
          <div className="text-center pt-2">
            <Link
              href="/uae-with-kids"
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>Explore UAE Family Guides</span>
              <span>→</span>
            </Link>
          </div>

          {/* Top Guides Links */}
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#B75B70] uppercase block">
                  START EXPLORING
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                  Popular Guides to Read Next
                </h3>
              </div>
              <Link
                href="/uae-with-kids"
                className="text-xs font-bold text-[#B75B70] hover:text-[#683846] uppercase"
              >
                All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topGuides.map((article) => (
                <GuideCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
