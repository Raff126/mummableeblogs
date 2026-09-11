'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles, getDeletedArticleIds, loadArticlesFromServer, getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

interface ExpatGuideCard {
  id: string;
  slug: string;
  badge: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  link: string;
  bgColor: string;
}

const BADGE_COLORS = ['bg-[#B75B70]', 'bg-[#4D7987]', 'bg-[#D79A30]', 'bg-[#683846]'];

const DEFAULT_EXPAT_CARDS: ExpatGuideCard[] = [
  {
    id: 'art-15',
    slug: 'how-to-build-a-supportive-mum-community-as-an-expat-in-the-uae',
    badge: 'COMMUNITY & FRIENDSHIPS',
    title: 'How to Build a Supportive Mum Village as an Expat',
    category: 'The Expat Edit',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop&q=80',
    link: '/the-expat-edit/how-to-build-a-supportive-mum-community-as-an-expat-in-the-uae',
    bgColor: 'bg-[#B75B70]',
  },
  {
    id: 'art-19',
    slug: 'choosing-between-british-ib-and-american-curriculums-in-the-uae',
    badge: 'SCHOOL & EDUCATION',
    title: 'Choosing Between British, IB, & American Curriculums',
    category: 'The Expat Edit',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&fit=crop&q=80',
    link: '/the-expat-edit/choosing-between-british-ib-and-american-curriculums-in-the-uae',
    bgColor: 'bg-[#4D7987]',
  },
  {
    id: 'art-17',
    slug: 'how-we-handle-seasonal-transitions-and-summer-months-with-kids',
    badge: 'UAE LIVING & SEASONS',
    title: 'Handling Seasonal Transitions & Summer with Kids',
    category: 'The Expat Edit',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&fit=crop&q=80',
    link: '/the-expat-edit/how-we-handle-seasonal-transitions-and-summer-months-with-kids',
    bgColor: 'bg-[#D79A30]',
  },
  {
    id: 'art-16',
    slug: 'our-daily-uae-family-routine-balancing-school-heat-and-activities',
    badge: 'PARENTING & ROUTINES',
    title: 'Our Daily UAE Family Routine: School & Heat',
    category: 'The Expat Edit',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&fit=crop&q=80',
    link: '/the-expat-edit/our-daily-uae-family-routine-balancing-school-heat-and-activities',
    bgColor: 'bg-[#683846]',
  },
];

const isExpatCategory = (cat?: string): boolean => {
  if (!cat) return false;
  const c = cat.toLowerCase().trim();
  return c === 'the-expat-edit' || c === 'expat-edit';
};

const isArticlePublished = (a: ArticleItem, deleted: Set<string>): boolean => {
  if (!a) return false;
  if (a.isDraft || a.status === 'draft') return false;
  if (deleted.has(a.id) || (a.slug && deleted.has(a.slug))) return false;
  return true;
};

function articleToCard(article: ArticleItem, index: number): ExpatGuideCard {
  const defaultMatch = DEFAULT_EXPAT_CARDS.find(
    (c) => c.slug === article.slug || c.id === article.id
  );

  const rawBadge = article.subcategory || (article.tags && article.tags[0]) || defaultMatch?.badge || 'EXPAT ESSENTIALS';
  const badge = rawBadge.toUpperCase();

  const isImageErased = article.featuredImage !== undefined && article.featuredImage.trim() === '';
  const image = isImageErased
    ? ''
    : (article.featuredImage ||
       article.heroImage ||
       article.thumbnailImage ||
       (defaultMatch?.image || ''));

  const readTime = article.readTime || defaultMatch?.readTime || '4 min read';
  const bgColor = defaultMatch?.bgColor || BADGE_COLORS[index % BADGE_COLORS.length];
  const catSlug = article.category ? article.category.toLowerCase().trim() : 'the-expat-edit';

  return {
    id: article.id,
    slug: article.slug,
    badge,
    title: article.title,
    category: 'The Expat Edit',
    readTime,
    image,
    link: `/${catSlug}/${article.slug}`,
    bgColor,
  };
}

function resolveExpatCards(allArticles: ArticleItem[], deleted: Set<string>): ExpatGuideCard[] {
  // 1. Find all published articles belonging to the expat category
  const publishedExpat = allArticles.filter(
    (a) => isExpatCategory(a.category) && isArticlePublished(a, deleted)
  );

  // 2. Sort by published date descending (newest first), then by id
  publishedExpat.sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() || 0 : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() || 0 : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });

  const cards: ExpatGuideCard[] = [];
  const seenKeys = new Set<string>();

  // 3. Add dynamic published expat articles up to 4
  for (const art of publishedExpat) {
    if (cards.length >= 4) break;
    const key = art.slug || art.id;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    cards.push(articleToCard(art, cards.length));
  }

  // 4. Backfill from default fallback cards if needed, but ONLY if not drafted/deleted
  if (cards.length < 4) {
    for (const def of DEFAULT_EXPAT_CARDS) {
      if (cards.length >= 4) break;
      const key = def.slug || def.id;
      if (seenKeys.has(key)) continue;

      const matched = allArticles.find(
        (a) => a.slug === def.slug || a.id === def.id || (a.slug && def.link.includes(a.slug))
      );

      // If matched in database and is drafted or deleted, do NOT show it
      if (matched && !isArticlePublished(matched, deleted)) {
        continue;
      }
      if (deleted.has(def.id) || deleted.has(def.slug)) {
        continue;
      }

      seenKeys.add(key);
      cards.push(def);
    }
  }

  return cards;
}

export default function ExpatEditSection() {
  const [hpContent, setHpContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [cards, setCards] = useState<ExpatGuideCard[]>(() => {
    const deleted = getDeletedArticleIds();
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();
    return resolveExpatCards(all, deleted);
  });

  const refreshCards = async () => {
    const localHp = getInitialHomepage();
    setHpContent(localHp);

    const deleted = getDeletedArticleIds();
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();

    const localCards = resolveExpatCards(all, deleted);
    if (localCards.length > 0) {
      setCards(localCards);
    }

    // Sync with Firestore
    try {
      const serverArticles = await loadArticlesFromServer();
      if (Array.isArray(serverArticles) && serverArticles.length > 0) {
        const curDeleted = getDeletedArticleIds();
        const serverCards = resolveExpatCards(serverArticles, curDeleted);
        setCards(serverCards);
      }
    } catch (_) {}

    try {
      const { fetchHomepageFromFirestore } = await import('../utils/firestoreSettings');
      const fsHp = await fetchHomepageFromFirestore();
      if (fsHp && typeof fsHp === 'object') {
        setHpContent((prev) => ({ ...prev, ...fsHp }));
      }
    } catch (_) {}
  };

  useEffect(() => {
    refreshCards();

    const handleUpdate = () => refreshCards();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const eyebrow = hpContent.expatEyebrow !== undefined ? hpContent.expatEyebrow.trim() : (DEFAULT_HOMEPAGE.expatEyebrow || 'CURATED ESSENTIALS FOR UAE FAMILIES');
  const headline = hpContent.expatHeadline !== undefined ? hpContent.expatHeadline.trim() : (DEFAULT_HOMEPAGE.expatHeadline || 'The Expat Edit');
  const description = hpContent.expatDescription !== undefined ? hpContent.expatDescription.trim() : (DEFAULT_HOMEPAGE.expatDescription || 'Practical guides, school choices & community wisdom for raising kids in the Emirates');

  // If no published cards exist, hide section
  if (cards.length === 0) {
    return null;
  }

  return (
    <section id="expat-edit" className="py-16 sm:py-20 bg-[#F8EDEF]/40 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(eyebrow || headline || description) && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              {eyebrow ? (
                <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
                  {eyebrow}
                </span>
              ) : null}
              {headline ? (
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
                  {headline}
                </h2>
              ) : null}
              {description ? (
                <p className="text-xs sm:text-sm text-[#332D2F]/80 font-sans mt-1">
                  {description}
                </p>
              ) : null}
            </div>
            <Link
              href="/the-expat-edit"
              className="text-xs font-bold tracking-wider text-[#B75B70] hover:text-[#683846] transition-colors uppercase self-start sm:self-auto inline-flex items-center gap-1"
            >
              <span>View All Expat Guides</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Dynamic Published Expat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            return (
              <Link
                key={card.id || card.slug}
                href={card.link}
                className="group bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {card.image && card.image.trim() ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/mama-logo.png';
                        target.className = 'w-full h-full object-contain p-8 opacity-60';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F8EDEF] to-[#F3E2E6] p-4 text-center">
                      <img
                        src="/images/mama-logo.png"
                        alt="MummaBee logo"
                        className="w-14 h-14 object-contain opacity-75"
                      />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase text-white px-3 py-1 rounded-full shadow-xs ${card.bgColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Text Container */}
                <div className="p-6 space-y-2 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-[10px] font-bold text-[#B75B70] uppercase tracking-wider block mb-1">
                      {card.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#332D2F] group-hover:text-[#B75B70] transition-colors leading-snug line-clamp-2">
                      {card.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-[#332D2F]/60 font-sans">
                    <span>{card.readTime || '4 min read'}</span>
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
