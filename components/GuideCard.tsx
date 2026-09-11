import Link from 'next/link';
import { ArticleItem } from '../data/articles';
import { CATEGORIES } from '../data/categories';

interface GuideCardProps {
  article: ArticleItem;
}

export default function GuideCard({ article }: GuideCardProps) {
  const categoryInfo = CATEGORIES[article.category] || { name: article.category };

  return (
    <article className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-soft hover:shadow-soft-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <Link href={`/${article.category}/${article.slug}`} prefetch={false} className="block relative aspect-[16/10] overflow-hidden bg-[#F8EDEF]">
        {article.featuredImage && article.featuredImage.trim() ? (
          <img
            src={article.featuredImage}
            alt={article.imageAlt || article.title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/mama-logo.png';
              target.className = 'w-full h-full object-contain p-8 opacity-60';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F8EDEF] to-[#F3E2E6] p-6 text-center">
            <img
              src="/images/mama-logo.png"
              alt="MummaBee logo"
              className="w-16 h-16 object-contain opacity-75 group-hover:scale-110 transition-transform duration-500"
            />
            <span className="text-[10px] font-bold text-[#683846]/70 uppercase tracking-widest mt-2">
              {categoryInfo.name}
            </span>
          </div>
        )}
        {article.subcategory && (
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#683846] text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border border-gray-100 shadow-xs">
            {article.subcategory}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4 min-w-0">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B75B70] min-w-0">
            <span className="truncate">{categoryInfo.name}</span>
            {article.location && <span className="text-[#332D2F]/60 truncate">• 📍 {article.location}</span>}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#683846] group-hover:text-[#B75B70] transition-colors leading-snug line-clamp-2 break-words">
            <Link href={`/${article.category}/${article.slug}`} prefetch={false}>
              {article.title}
            </Link>
          </h3>

          <p className="text-xs text-[#332D2F] line-clamp-2 leading-relaxed break-words">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-[#332D2F]/70 font-medium">{article.readTime}</span>
          <Link
            href={`/${article.category}/${article.slug}`}
            prefetch={false}
            className="font-bold text-[#683846] group-hover:text-[#B75B70] transition-colors inline-flex items-center gap-1"
          >
            Read Guide <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
