'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles } from '../data/store';
import GuideCard from './GuideCard';

export default function LatestGuidesSection() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Load from local store immediately
    const local = getInitialArticles();
    const published = (local.length > 0 ? local : getAllArticles()).filter((a) => !a.isDraft);

    // Sort newest first
    const sorted = [...published].sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime() || 0;
      const timeB = new Date(b.publishedAt).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });

    setArticles(sorted);
    setIsLoading(false);

    // 2. Refresh from server API in background
    fetch('/api/articles')
      .then((res) => res.json())
      .then((apiArticles: ArticleItem[]) => {
        if (Array.isArray(apiArticles) && apiArticles.length > 0) {
          const apiPublished = apiArticles.filter((a) => !a.isDraft);
          const apiSorted = [...apiPublished].sort((a, b) => {
            const timeA = new Date(a.publishedAt).getTime() || 0;
            const timeB = new Date(b.publishedAt).getTime() || 0;
            if (timeB !== timeA) return timeB - timeA;
            return b.id.localeCompare(a.id);
          });
          setArticles(apiSorted);
        }
      })
      .catch((err) => console.error('Error refreshing articles:', err));
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              LATEST UAE FAMILY GUIDES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              Plan your next family day
            </h2>
          </div>
          <Link
            href="/uae-with-kids"
            className="text-[11px] font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto"
          >
            VIEW ALL GUIDES →
          </Link>
        </div>

        {/* 3 Featured Editorial Cards Matching Exact Reference Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: DUBAI (Berry Pink) */}
          <Link
            href="/uae-with-kids/10-family-friendly-things-to-do-in-dubai-this-weekend"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Pink Block with Overlapping Circles */}
            <div className="relative bg-[#DF2A64] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              {/* Overlapping Translucent Circles */}
              <div className="absolute -top-8 -right-6 w-32 h-32 bg-[#F8EDEF]/25 rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -right-6 w-36 h-36 bg-white/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                WEEKEND GUIDE
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                DUBAI
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                10 Dubai Activities for Kids
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                Activities • 4 min read
              </span>
            </div>
          </Link>

          {/* Card 2: EAT (Mustard Gold) */}
          <Link
            href="/food/family-friendly-cafes-dubai"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Gold Block with Overlapping Circle */}
            <div className="relative bg-[#D79A30] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              {/* Overlapping Translucent Circle extending onto card */}
              <div className="absolute -bottom-8 -right-6 w-36 h-36 bg-white/25 rounded-full pointer-events-none" />
              <div className="absolute -bottom-4 right-10 w-28 h-28 bg-[#F8EDEF]/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                FAMILY DINING
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                EAT
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                7 Family Restaurants in Dubai
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                Food • 4 min read
              </span>
            </div>
          </Link>

          {/* Card 3: SCHOOL (Slate Teal) */}
          <Link
            href="/school-and-activities/back-to-school-uae-parent-checklist"
            className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
          >
            {/* Top Teal Block with Overlapping Circles */}
            <div className="relative bg-[#4D7987] text-white p-7 h-44 flex flex-col justify-between overflow-hidden">
              {/* Overlapping Translucent Teal Circle extending outside */}
              <div className="absolute -top-10 -right-6 w-36 h-36 bg-[#86B3C2]/30 rounded-full pointer-events-none" />
              <div className="absolute -bottom-8 -right-6 w-32 h-32 bg-white/20 rounded-full pointer-events-none" />

              <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                PARENT GUIDE
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                SCHOOL
              </h3>
            </div>

            {/* Bottom White Area */}
            <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
              <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors">
                Back-to-School Checklist
              </h4>
              <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                School • 5 min read
              </span>
            </div>
          </Link>
        </div>

        {/* Dynamic All Guides Grid & Load More */}
        {visibleArticles.length > 0 && (
          <div className="pt-8 border-t border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#683846]">
                All Recent Guides
              </h3>
              <span className="text-xs text-[#332D2F]/70">
                {articles.length} guides published
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleArticles.map((article) => (
                <GuideCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="mt-10 text-center flex flex-col items-center justify-center">
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center justify-center gap-2 bg-[#B75B70] hover:bg-[#683846] text-white font-sans text-xs font-bold tracking-wider uppercase px-8 py-3.5 rounded-full shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span>Load More Guides</span>
                  <span className="text-sm">↓</span>
                </button>
              )}

              {!hasMore && articles.length > 4 && (
                <p className="text-xs text-[#332D2F]/70 font-sans tracking-wide">
                  You've reached the latest guides.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
