'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles, ArticleItem } from '../../../data/articles';
import { getInitialArticles, isGoodToKnowVisibleForArticle } from '../../../data/store';
import { CATEGORIES } from '../../../data/categories';
import GuideCard from '../../../components/GuideCard';
import NewsletterBand from '../../../components/NewsletterBand';
import { formatArticleContent } from '../../../utils/contentFormatter';


interface ArticleViewProps {
  initialArticle?: ArticleItem | null;
  categorySlug: string;
  slug: string;
}

export default function ArticleView({ initialArticle, categorySlug, slug }: ArticleViewProps) {
  const [article, setArticle] = useState<ArticleItem | null>(initialArticle || null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(!initialArticle);

  const refreshArticle = () => {
    if (!slug) return;

    const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/\/$/, '');

    const findArticle = (list: ArticleItem[]) => {
      return (
        list.find(
          (a) =>
            a.slug?.toLowerCase().trim().replace(/^\//, '').replace(/\/$/, '') === normalizedSlug ||
            a.id?.toLowerCase().trim() === normalizedSlug
        ) ||
        list.find(
          (a) =>
            encodeURIComponent(a.slug || '').toLowerCase() === normalizedSlug ||
            a.slug?.toLowerCase() === slug.toLowerCase()
        )
      );
    };

    // 1. Check local store FIRST (user edits / drafts in localStorage take precedence over static build)
    const localArticles = getInitialArticles();
    const foundInLocal = findArticle(localArticles);

    if (foundInLocal) {
      setArticle(foundInLocal);
      const all = localArticles.length > 0 ? localArticles : getAllArticles();
      const related = all
        .filter((a) => a.category === foundInLocal.category && a.slug !== foundInLocal.slug && !a.isDraft)
        .slice(0, 4);
      setRelatedArticles(related);
      setIsLoading(false);
      return;
    }

    // 2. Check initialArticle if already matching
    if (initialArticle && (
      initialArticle.slug?.toLowerCase().trim().replace(/\/$/, '') === normalizedSlug ||
      initialArticle.id?.toLowerCase().trim() === normalizedSlug
    )) {
      setArticle(initialArticle);
      const all = getAllArticles();
      const related = all
        .filter((a) => a.category === initialArticle.category && a.slug !== initialArticle.slug && !a.isDraft)
        .slice(0, 4);
      setRelatedArticles(related);
      setIsLoading(false);
      return;
    }

    // 3. Fall back to static articles
    const foundInStatic = findArticle(getAllArticles());
    if (foundInStatic) {
      setArticle(foundInStatic);
      const all = getAllArticles();
      const related = all
        .filter((a) => a.category === foundInStatic.category && a.slug !== foundInStatic.slug && !a.isDraft)
        .slice(0, 4);
      setRelatedArticles(related);
      setIsLoading(false);
      return;
    }

    // 4. Try fetching from static articles.json (works in static export)
    fetch(`/data/articles.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: ArticleItem[]) => {
        if (Array.isArray(data)) {
          const apiFound = findArticle(data);
          if (apiFound) {
            setArticle(apiFound);
            const related = data
              .filter((a) => a.category === apiFound.category && a.slug !== apiFound.slug && !a.isDraft)
              .slice(0, 4);
            setRelatedArticles(related);
          }
        }
      })
      .catch((err) => console.error('Error fetching article from static JSON:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refreshArticle();

    const handleUpdate = () => {
      refreshArticle();
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [slug, categorySlug, initialArticle]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8EDEF] py-20 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center space-y-3 max-w-sm">
          <span className="text-3xl animate-pulse">🐝</span>
          <p className="font-serif text-lg font-bold text-[#683846]">Loading UAE Guide...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F8EDEF] py-20 px-4 flex items-center justify-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center space-y-5 max-w-lg">
          <span className="text-4xl">📝</span>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Guide Not Found</h1>
          <p className="text-sm text-[#332D2F] leading-relaxed">
            The guide you are looking for might have been moved or updated. Explore our latest tested UAE family guides below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[#683846] text-white font-bold text-xs hover:bg-[#332D2F] transition-colors shadow-2xs"
            >
              Back to Home
            </Link>
            <Link
              href={`/${categorySlug || 'uae-with-kids'}`}
              className="px-6 py-3 rounded-full bg-[#F8EDEF] text-[#683846] font-bold text-xs hover:bg-[#B75B70] hover:text-white transition-colors border border-[#B75B70]/30"
            >
              Explore Category Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORIES[article.category] || { name: article.category };
  const canonicalUrl = `https://mummabeeblog.com/${article.category}/${article.slug}`;
  const fullImageUrl = article.featuredImage.startsWith('http')
    ? article.featuredImage
    : `https://mummabeeblog.com${article.featuredImage}`;

  // Structured Data: Article JSON-LD
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: [fullImageUrl],
    datePublished: article.publishedAt,
    dateModified: article.lastUpdated || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Donne',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  // Structured Data: BreadcrumbList JSON-LD
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
        item: `https://mummabeeblog.com/${article.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      {/* Client JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      {/* Outer Atmosphere Canvas: Desert Blush */}
      <div className="bg-[#F8EDEF] min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Article Reading Container: Clean White Reading Canvas */}
        <article className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[36px] shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-10 lg:p-14 space-y-10">
          {/* Article Header */}
          <header className="space-y-4 pb-6 border-b border-gray-100">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="text-xs font-medium text-[#332D2F] space-x-2">
              <Link href="/" className="text-[#332D2F] hover:text-[#B75B70] transition-colors">Home</Link>
              <span>›</span>
              <Link href={`/${article.category}`} className="text-[#332D2F] hover:text-[#B75B70] transition-colors">{categoryInfo.name}</Link>
              <span>›</span>
              <span className="text-[#683846] font-semibold line-clamp-1 inline">{article.title}</span>
            </nav>

            {/* Category Accent Badge */}
            <span className="inline-block bg-[#F8EDEF] text-[#B75B70] text-xs font-bold tracking-wider px-3.5 py-1 rounded-full border border-[#B75B70]/30 shadow-2xs">
              {categoryInfo.name}
            </span>

            {/* Article Title: Date Burgundy */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#683846] leading-[1.15] tracking-tight">
              {article.title}
            </h1>

            {/* Excerpt / Lead Paragraph: Charcoal */}
            <p className="font-sans text-base sm:text-lg text-[#332D2F] leading-relaxed">
              {article.excerpt}
            </p>

            {/* Author Byline & Metadata */}
            <div className="pt-4 flex items-center gap-3.5 text-xs text-[#332D2F] border-t border-gray-100">
              <div className="w-9 h-9 rounded-full bg-[#F8EDEF] border border-[#B75B70]/40 flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
                <img
                  src="/images/mama-logo.png"
                  alt="Donne - MummaBeeBlog"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="font-bold text-[#683846] block text-sm">By {article.author}</span>
                <span className="font-medium text-[#332D2F]/80">
                  Published {article.publishedAt} • {article.readTime}
                  {article.location && <span> • 📍 {article.location}</span>}
                </span>
              </div>
            </div>
          </header>

          {/* Featured Hero Photograph */}
          <div className="space-y-2">
            <div className="rounded-2xl overflow-hidden shadow-soft">
              <div className="relative">
                <img
                  src={article.featuredImage}
                  alt={article.imageAlt || article.title}
                  fetchPriority="high"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('358792494_661391199240576_3424351230899219709_n.jpg')) {
                      target.src = '/images/358792494_661391199240576_3424351230899219709_n.jpg';
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {article.imageCaption && (
              <p className="text-center text-xs text-[#332D2F]/80 italic pt-1">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Main Content Area */}
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Quick Answer / Executive Summary Box */}
            {(article.answerSummary || article.quickAnswer) && (
              <div className="bg-[#F8EDEF] p-6 sm:p-8 rounded-3xl border-2 border-[#B75B70] space-y-2.5 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#683846] uppercase">
                  <span className="text-[#B75B70] text-sm">⚡</span>
                  <span>QUICK ANSWER / EXECUTIVE SUMMARY</span>
                </div>
                <p className="text-base font-medium text-[#332D2F] leading-relaxed">
                  {article.answerSummary || article.quickAnswer}
                </p>
              </div>
            )}

            {/* Good to Know Important Information Box */}
            {(() => {
              if (!isGoodToKnowVisibleForArticle(article)) return null;
              if (!article.quickFacts) return null;
              const hasFacts = Boolean(
                article.quickFacts.location ||
                article.quickFacts.bestFor ||
                article.quickFacts.budget ||
                article.quickFacts.timeNeeded
              );
              if (!hasFacts) return null;

              return (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#D7BB91] shadow-soft space-y-4">
                  <h3 className="font-serif text-xl font-bold text-[#683846] flex items-center gap-2">
                    <span>📌</span> GOOD TO KNOW
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {article.quickFacts.location && (
                      <div className="bg-[#F8EDEF]/50 p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-[#683846] block text-xs uppercase tracking-wider mb-0.5">📍 Location</span>
                        <span className="text-[#332D2F] font-medium">{article.quickFacts.location}</span>
                      </div>
                    )}
                    {article.quickFacts.bestFor && (
                      <div className="bg-[#F8EDEF]/50 p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-[#683846] block text-xs uppercase tracking-wider mb-0.5">👧 Best For</span>
                        <span className="text-[#332D2F] font-medium">{article.quickFacts.bestFor}</span>
                      </div>
                    )}
                    {article.quickFacts.budget && (
                      <div className="bg-[#F8EDEF]/50 p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-[#683846] block text-xs uppercase tracking-wider mb-0.5">💰 Budget</span>
                        <span className="text-[#332D2F] font-medium">{article.quickFacts.budget}</span>
                      </div>
                    )}
                    {article.quickFacts.timeNeeded && (
                      <div className="bg-[#F8EDEF]/50 p-3 rounded-xl border border-gray-100">
                        <span className="font-bold text-[#683846] block text-xs uppercase tracking-wider mb-0.5">⏱️ Time Needed</span>
                        <span className="text-[#332D2F] font-medium">{article.quickFacts.timeNeeded}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Mumma Bee Tip Box */}
            {article.mummaBeeTip && (
              <div className="bg-[#F8EDEF] border-l-4 border-[#B75B70] p-6 rounded-r-2xl text-sm sm:text-base text-[#332D2F] leading-relaxed shadow-2xs">
                <span className="font-bold text-[#683846] block mb-1 text-xs tracking-wider uppercase">
                  🐝 MUMMA BEE TIP
                </span>
                {article.mummaBeeTip}
              </div>
            )}

            {/* Article Long-Form Body HTML with High-Contrast Prose Styling */}
            <div
              className="article-prose pt-4"
              dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }}
            />

            {/* Topics / Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-[#683846] uppercase tracking-wider mr-2">
                  TOPICS:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#F8EDEF] text-[#683846] border border-[#D7BB91] hover:bg-[#B75B70] hover:text-white px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Profile Card */}
            <div className="mt-12 bg-[#F8EDEF] rounded-3xl p-6 sm:p-8 border border-[#B75B70]/20 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-full p-1 bg-white border border-[#B75B70]/30 shadow-xs flex-shrink-0">
                <img
                  src="/images/358792494_661391199240576_3424351230899219709_n.jpg"
                  alt="Donne - MummaBeeBlog"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-bold tracking-widest text-[#B75B70] uppercase block">
                  WRITTEN BY
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#683846]">
                  Donne
                </h4>
                <p className="text-xs sm:text-sm text-[#332D2F] leading-relaxed">
                  Mum raising two daughters between Dubai and Abu Dhabi, sharing practical guides, honest reviews, and tested tips for UAE family life.
                </p>
                <Link
                  href="/about"
                  className="inline-block text-xs font-bold text-[#B75B70] hover:text-[#683846] transition-colors uppercase tracking-wider pt-1"
                >
                  Meet Donne & Our Story →
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Related UAE Guides Section */}
      {relatedArticles.length > 0 && (
        <section className="py-20 bg-[#F8EDEF] border-t border-[#B75B70]/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center">
              <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
                CONTINUE READING
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
                Related UAE Guides
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((rel) => (
                <GuideCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <NewsletterBand />
    </>
  );
}
