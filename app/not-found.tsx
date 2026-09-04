'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialArticles } from '../data/store';
import ArticleView from './[category]/[slug]/ArticleView';
import EditArticleView from './admin/articles/[id]/EditArticleView';

export default function NotFound() {
  const [resolvedComponent, setResolvedComponent] = useState<{
    type: 'article' | 'edit_article' | '404';
    category?: string;
    slug?: string;
    id?: string;
  }>({ type: '404' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname.replace(/\/$/, '').replace(/^\//, '');
    const parts = pathname.split('/').filter(Boolean);

    // Check if it is an admin edit page: admin/articles/[id]
    if (parts[0] === 'admin' && parts[1] === 'articles' && parts[2]) {
      setResolvedComponent({ type: 'edit_article', id: parts[2] });
      return;
    }

    // Check if it is a dynamic article: [category]/[slug]
    if (parts.length === 2) {
      const [category, slug] = parts;
      const all = getInitialArticles();
      const normalizedSlug = decodeURIComponent(slug).toLowerCase().trim();
      const match = all.find(
        (a) =>
          a.category === category &&
          (a.slug?.toLowerCase().trim() === normalizedSlug || a.id?.toLowerCase().trim() === normalizedSlug)
      );

      if (match) {
        setResolvedComponent({ type: 'article', category, slug });
        return;
      }
    }

    setResolvedComponent({ type: '404' });
  }, []);

  if (resolvedComponent.type === 'article' && resolvedComponent.category && resolvedComponent.slug) {
    return <ArticleView categorySlug={resolvedComponent.category} slug={resolvedComponent.slug} />;
  }

  if (resolvedComponent.type === 'edit_article' && resolvedComponent.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <EditArticleView articleId={resolvedComponent.id} />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 bg-[#F8EDEF]/50 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-soft border border-gray-100 max-w-md w-full space-y-4">
        <span className="text-4xl">📚</span>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Page Not Found</h1>
        <p className="text-xs text-[#332D2F]/80 leading-relaxed font-sans">
          The guide or page you are looking for might have been moved, deleted, or is not yet available.
        </p>
        <div className="pt-2">
          <Link href="/" className="btn-primary inline-block">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
