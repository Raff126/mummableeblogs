'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles, getDeletedArticleIds, loadArticlesFromServer } from '../data/store';

interface FeaturedSlot {
  slotKey: string;
  category: string;
  preferredSlug: string;
  headerLabel: string;
  headline: string;
  bgColor: string;
  circleAccent: string;
}

const FEATURED_SLOTS: FeaturedSlot[] = [
  {
    slotKey: 'dubai',
    category: 'uae-with-kids',
    preferredSlug: '10-family-friendly-things-to-do-in-dubai-this-weekend',
    headerLabel: 'WEEKEND GUIDE',
    headline: 'DUBAI',
    bgColor: 'bg-[#DF2A64]',
    circleAccent: 'bg-[#F8EDEF]/25',
  },
  {
    slotKey: 'food',
    category: 'food',
    preferredSlug: '7-dubai-restaurants-parents-and-kids-will-both-enjoy',
    headerLabel: 'FAMILY DINING',
    headline: 'EAT',
    bgColor: 'bg-[#D79A30]',
    circleAccent: 'bg-white/25',
  },
  {
    slotKey: 'school',
    category: 'school-and-activities',
    preferredSlug: 'a-uae-back-to-school-checklist-for-busy-parents',
    headerLabel: 'PARENT GUIDE',
    headline: 'SCHOOL',
    bgColor: 'bg-[#4D7987]',
    circleAccent: 'bg-[#86B3C2]/30',
  },
];

export default function FeaturedGuidesSection() {
  const [slotArticles, setSlotArticles] = useState<Record<string, ArticleItem | null>>({});

  const resolveSlots = (allArticles: ArticleItem[], deleted: Set<string>) => {
    const isPublished = (a: ArticleItem) => !a.isDraft && a.status !== 'draft' && !deleted.has(a.id) && (!a.slug || !deleted.has(a.slug));
    const publishedOnly = allArticles.filter(isPublished);

    const resolved: Record<string, ArticleItem | null> = {};

    for (const slot of FEATURED_SLOTS) {
      // 1. Try to find the preferred article ONLY if it is strictly published
      const preferred = publishedOnly.find(
        (a) => a.slug === slot.preferredSlug || a.id === slot.preferredSlug
      );

      if (preferred) {
        resolved[slot.slotKey] = preferred;
      } else {
        // 2. Fall back to any published article in the category
        const fallback = publishedOnly.find((a) => a.category === slot.category);
        resolved[slot.slotKey] = fallback || null;
      }
    }

    setSlotArticles(resolved);
  };

  const refreshFeatured = async () => {
    const deleted = getDeletedArticleIds();
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();
    resolveSlots(all, deleted);

    try {
      const serverArticles = await loadArticlesFromServer();
      if (Array.isArray(serverArticles) && serverArticles.length > 0) {
        const curDeleted = getDeletedArticleIds();
        resolveSlots(serverArticles, curDeleted);
      }
    } catch (_) {}
  };

  useEffect(() => {
    refreshFeatured();

    const handleUpdate = () => refreshFeatured();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Filter out any slot that does not have an active published article
  const activeCards = FEATURED_SLOTS.map((slot) => ({
    slot,
    article: slotArticles[slot.slotKey],
  })).filter((item): item is { slot: FeaturedSlot; article: ArticleItem } => item.article !== null && item.article !== undefined);

  if (activeCards.length === 0) {
    return null;
  }

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

        {/* 3 Featured Editorial Cards (Strictly Published Only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCards.map(({ slot, article }) => (
            <Link
              key={slot.slotKey}
              href={`/${article.category}/${article.slug}`}
              className="group bg-white rounded-[26px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col relative"
            >
              {/* Top Colored Block with Overlapping Circles */}
              <div className={`relative ${slot.bgColor} text-white p-7 h-44 flex flex-col justify-between overflow-hidden`}>
                <div className={`absolute -top-8 -right-6 w-32 h-32 ${slot.circleAccent} rounded-full pointer-events-none`} />
                <div className="absolute -bottom-10 -right-6 w-36 h-36 bg-white/20 rounded-full pointer-events-none" />

                <span className="text-[9px] font-bold tracking-widest uppercase text-white/90">
                  {slot.headerLabel}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {slot.headline}
                </h3>
              </div>

              {/* Bottom White Area */}
              <div className="p-6 space-y-1 flex-1 flex flex-col justify-between bg-white">
                <h4 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <span className="text-[11px] text-[#332D2F]/60 font-medium block">
                  {article.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} • {article.readTime || '4 min read'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
