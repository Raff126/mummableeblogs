'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles, getDeletedArticleIds, loadArticlesFromServer } from '../data/store';

const BADGE_COLORS = ['bg-[#B75B70]', 'bg-[#4D7987]', 'bg-[#D79A30]', 'bg-[#683846]'];

export default function ExpatEditSection() {
  const [guides, setGuides] = useState<ArticleItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshGuides = async () => {
    const deleted = getDeletedArticleIds();
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();
    const isExpat = (cat: string) => cat === 'the-expat-edit' || cat === 'expat-edit';
    const isPublished = (a: ArticleItem) => !a.isDraft && a.status !== 'draft' && !deleted.has(a.id) && (!a.slug || !deleted.has(a.slug));

    const initial = all.filter((a) => isExpat(a.category) && isPublished(a)).slice(0, 4);
    setGuides(initial);

    try {
      const server = await loadArticlesFromServer();
      if (Array.isArray(server) && server.length > 0) {
        const curDeleted = getDeletedArticleIds();
        const serverPublished = server.filter((a) => isExpat(a.category) && !a.isDraft && a.status !== 'draft' && !curDeleted.has(a.id) && (!a.slug || !curDeleted.has(a.slug)));
        setGuides(serverPublished.slice(0, 4));
      }
    } catch (_) {}
  };

  useEffect(() => {
    setMounted(true);
    refreshGuides();

    const handleUpdate = () => refreshGuides();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Never show draft or empty cards to visitors
  if (guides.length === 0) {
    return null;
  }

  return (
    <section id="expat-edit" className="py-16 sm:py-20 bg-[#F8EDEF]/40 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              CURATED ESSENTIALS FOR UAE FAMILIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              The Expat Edit
            </h2>
            <p className="text-xs sm:text-sm text-[#332D2F]/80 font-sans mt-1">
              Practical guides, school choices & community wisdom for raising kids in the Emirates
            </p>
          </div>
          <Link
            href="/the-expat-edit"
            className="text-xs font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto inline-flex items-center gap-1"
          >
            <span>View All Expat Guides</span>
            <span>→</span>
          </Link>
        </div>

        {/* Dynamic Published Expat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, idx) => {
            const badge = guide.subcategory || (idx === 0 ? 'COMMUNITY & FRIENDSHIPS' : idx === 1 ? 'SCHOOL & EDUCATION' : idx === 2 ? 'UAE LIVING & SEASONS' : 'PARENTING & ROUTINES');
            const bgColor = BADGE_COLORS[idx % BADGE_COLORS.length];
            const link = `/${guide.category}/${guide.slug}`;

            return (
              <Link
                key={guide.id || guide.slug}
                href={link}
                className="group bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={guide.featuredImage}
                    alt={guide.imageAlt || guide.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/mama-logo.png'; }}
                  />
                  <span className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-white px-3 py-1 rounded-full shadow-xs ${bgColor}`}>
                    {badge}
                  </span>
                </div>

                {/* Text Container */}
                <div className="p-6 space-y-2 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block mb-1">
                      The Expat Edit
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors leading-snug line-clamp-2">
                      {guide.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-[#332D2F]/60 font-sans">
                    <span>{guide.readTime || '4 min read'}</span>
                    <span className="font-bold text-[#B75B70] group-hover:translate-x-1 transition-transform">
                      Read Guide →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
