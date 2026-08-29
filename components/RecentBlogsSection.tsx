'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles } from '../data/store';
import GuideCard from './GuideCard';

export default function RecentBlogsSection() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Load from local store immediately (includes any articles added in Admin Panel)
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

  // Limit visible articles to 4 (exactly 1 row of 4 on desktop)
  const visibleArticles = articles.slice(0, 4);

  return (
    <section className="py-16 sm:py-20 bg-[#FEFAF9] border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              Recent Blogs
            </h2>
            <p className="text-xs sm:text-sm text-[#332D2F]/80 font-sans mt-1">
              The latest stories, guides & family finds from MummaBeeBlog
            </p>
          </div>
          <Link
            href="/uae-with-kids"
            className="text-xs font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto inline-flex items-center gap-1"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {/* Dynamic 4-Column Responsive Grid */}
        {visibleArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleArticles.map((article) => (
              <GuideCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-md mx-auto space-y-3 shadow-soft">
              <span className="text-3xl">📝</span>
              <h3 className="font-serif text-xl font-bold text-[#683846]">No Blogs Found</h3>
              <p className="text-xs text-[#332D2F]">Check back soon for fresh UAE guides!</p>
            </div>
          )
        )}

        {/* Explore All Button */}
        {articles.length > 4 && (
          <div className="mt-12 text-center">
            <Link
              href="/uae-with-kids"
              className="inline-flex items-center justify-center gap-2 bg-[#B75B70] hover:bg-[#683846] text-white font-sans text-xs font-bold tracking-wider uppercase px-8 py-3.5 rounded-full shadow-soft hover:shadow-soft-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>Explore All Guides</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
