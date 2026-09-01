'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES, CategoryInfo } from '../../data/categories';
import { ArticleItem, getAllArticles } from '../../data/articles';
import { getInitialArticles, getInitialCategories } from '../../data/store';
import GuideCard from '../../components/GuideCard';
import DiscountCodesSection from '../../components/DiscountCodesSection';
import NewsletterBand from '../../components/NewsletterBand';

interface CategoryViewProps {
  categorySlug: string;
}

export default function CategoryView({ categorySlug }: CategoryViewProps) {
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>(
    CATEGORIES[categorySlug] || {
      slug: categorySlug,
      name: categorySlug,
      heroEyebrow: 'UAE FAMILY GUIDE',
      heroTitle: categorySlug,
      heroIntro: 'Family guides and recommendations.',
      description: 'Family guides and recommendations.',
      subcategories: ['All Guides'],
      color: 'pink',
      icon: '✨',
      seoTitle: 'Family Guides',
      seoDescription: 'Family guides and recommendations.',
    }
  );

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  const refreshCategoryArticles = () => {
    const cats = getInitialCategories();
    if (cats[categorySlug]) {
      setCategoryInfo(cats[categorySlug]);
    }

    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();
    const filtered = all.filter((a) => a.category === categorySlug && !a.isDraft);

    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime() || 0;
      const timeB = new Date(b.publishedAt).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return b.id.localeCompare(a.id);
    });

    setArticles(sorted);
    setIsLoading(false);

    fetch(`/api/articles?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((apiArticles: ArticleItem[]) => {
        if (Array.isArray(apiArticles)) {
          const apiFiltered = apiArticles.filter((a) => a.category === categorySlug && !a.isDraft);
          const apiSorted = [...apiFiltered].sort((a, b) => {
            const timeA = new Date(a.publishedAt).getTime() || 0;
            const timeB = new Date(b.publishedAt).getTime() || 0;
            if (timeB !== timeA) return timeB - timeA;
            return b.id.localeCompare(a.id);
          });
          setArticles(apiSorted);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setMounted(true);
    if (!categorySlug) return;

    refreshCategoryArticles();

    const handleUpdate = (e: any) => {
      refreshCategoryArticles();
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [categorySlug]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-[#F8EDEF] py-20 px-4 flex items-center justify-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center space-y-4 max-w-md">
          <span className="text-4xl">📚</span>
          <h1 className="font-serif text-2xl font-bold text-[#683846]">Category Not Found</h1>
          <p className="text-xs text-[#332D2F]">Please choose one of our official hub categories.</p>
          <Link href="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://mummabeeblog.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryInfo.name,
        item: `https://mummabeeblog.com/${categorySlug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      {/* Category Hero / Header */}
      <section className="bg-[#F8EDEF] py-12 lg:py-16 border-b border-[#B75B70]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#332D2F] space-x-2">
            <Link href="/" className="hover:text-[#B75B70]">Home</Link>
            <span>/</span>
            <span className="text-[#683846] font-semibold">{categoryInfo.name}</span>
          </nav>

          <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
            {categoryInfo.heroEyebrow}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#683846] leading-tight">
            {categoryInfo.heroTitle}
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#332D2F] max-w-2xl mx-auto leading-relaxed">
            {categoryInfo.heroIntro}
          </p>
        </div>
      </section>

      {/* For UAE Deals hub: place Discount Codes at the top */}
      {categorySlug === 'uae-deals' && (
        <>
          <DiscountCodesSection placement="dealsPage" />
          
          {/* How to Redeem Tip Banner */}
          <div className="bg-white py-8 border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-2">
                💡 HOW TO USE OUR EXCLUSIVE CODES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-[#F8EDEF]/50 p-4 rounded-2xl border border-[#B75B70]/15">
                  <div className="font-bold text-xs text-[#683846] mb-1">1. Copy the Code</div>
                  <p className="text-[11px] text-[#332D2F]">Click the code box to automatically copy the discount code to your clipboard.</p>
                </div>
                <div className="bg-[#F8EDEF]/50 p-4 rounded-2xl border border-[#B75B70]/15">
                  <div className="font-bold text-xs text-[#683846] mb-1">2. Visit the Store</div>
                  <p className="text-[11px] text-[#332D2F]">Click the shop link button to head over to the official website or app.</p>
                </div>
                <div className="bg-[#F8EDEF]/50 p-4 rounded-2xl border border-[#B75B70]/15">
                  <div className="font-bold text-xs text-[#683846] mb-1">3. Apply at Checkout</div>
                  <p className="text-[11px] text-[#332D2F]">Paste the code in the promo / coupon box at checkout to get your discount!</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Dynamic Editorial Article Archive Grid (Always shown for standard categories, or if deals hub has articles) */}
      {(categorySlug !== 'uae-deals' || (mounted && visibleArticles.length > 0)) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                Latest {categoryInfo.name} Guides
              </h2>
              <span className="text-xs text-[#332D2F]/80 font-medium">
                {articles.length} {articles.length === 1 ? 'guide' : 'guides'} available
              </span>
            </div>

            {visibleArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleArticles.map((article) => (
                  <GuideCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="bg-[#F8EDEF] rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                  <span className="text-3xl">📝</span>
                  <h3 className="font-serif text-xl font-bold text-[#683846]">Guides Coming Soon</h3>
                  <p className="text-xs text-[#332D2F]">
                    We are actively publishing fresh guides for this hub. Check back soon or subscribe to our newsletter.
                  </p>
                </div>
              )
            )}

            {/* Load More Button / Reached End Status */}
            <div className="mt-12 text-center flex flex-col items-center justify-center">
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
                  You've reached the latest guides in this category.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <NewsletterBand />
    </>
  );
}
