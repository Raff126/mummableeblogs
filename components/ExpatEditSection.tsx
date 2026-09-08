'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, getAllArticles } from '../data/articles';
import { getInitialArticles, getDeletedArticleIds, loadArticlesFromServer } from '../data/store';

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

export default function ExpatEditSection() {
  const [cards, setCards] = useState<ExpatGuideCard[]>(DEFAULT_EXPAT_CARDS);
  const [mounted, setMounted] = useState(false);

  const refreshCards = async () => {
    const deleted = getDeletedArticleIds();
    const local = getInitialArticles();
    const all = local.length > 0 ? local : getAllArticles();

    const resolveCard = (card: ExpatGuideCard, articleList: ArticleItem[]): ExpatGuideCard | null => {
      if (deleted.has(card.id) || deleted.has(card.slug)) return null;
      const matched = articleList.find(
        (a) =>
          a.slug === card.slug ||
          a.id === card.id ||
          (a.slug && card.link.includes(a.slug))
      );
      if (matched) {
        if (matched.isDraft || matched.status === 'draft') return null;
        if (deleted.has(matched.id) || (matched.slug && deleted.has(matched.slug))) return null;
        return {
          ...card,
          id: matched.id || card.id,
          slug: matched.slug || card.slug,
          title: matched.title || card.title,
          image: matched.featuredImage || matched.thumbnailImage || card.image,
          readTime: matched.readTime || card.readTime,
          link: `/${matched.category || 'the-expat-edit'}/${matched.slug || card.slug}`,
        };
      }
      return card;
    };

    // Filter and update with local store first
    const visibleCards = DEFAULT_EXPAT_CARDS
      .map((c) => resolveCard(c, all))
      .filter((c): c is ExpatGuideCard => c !== null);
    setCards(visibleCards);

    // Sync with Firestore
    try {
      const serverArticles = await loadArticlesFromServer();
      if (Array.isArray(serverArticles)) {
        const serverVisible = DEFAULT_EXPAT_CARDS
          .map((c) => resolveCard(c, serverArticles))
          .filter((c): c is ExpatGuideCard => c !== null);
        setCards(serverVisible);
      }
    } catch (_) {}
  };

  useEffect(() => {
    setMounted(true);
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

  // If all cards were unpublished/drafted, hide section
  if (cards.length === 0) {
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
          {cards.map((card) => {
            return (
              <Link
                key={card.id || card.slug}
                href={card.link}
                className="group bg-white rounded-[24px] border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1 transition-all overflow-hidden flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/mama-logo.png'; }}
                  />
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
