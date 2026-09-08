'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getInitialArticles,
  saveArticles,
  deleteArticle,
  getDeletedArticleIds,
  setGoodToKnowVisibility,
  isGoodToKnowVisibleForArticle,
  loadArticlesFromServer,
  Article
} from '../../../data/store';
import { seedFirestoreIfEmpty, FirestoreArticle } from '../../../utils/firestoreArticles';
import { CATEGORIES } from '../../../data/categories';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gtkFilter, setGtkFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'TITLE'>('NEWEST');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLatestArticles = async () => {
    // 1. Show localStorage data immediately
    const local = getInitialArticles();
    setArticles(local);
    setIsLoading(false);

    // 2. Fetch from Firestore (or API on localhost) and merge
    try {
      const serverArticles = await loadArticlesFromServer();
      if (serverArticles.length > 0) {
        setArticles(serverArticles);

        // Seed Firestore if it's empty (first-time setup)
        if (local.length > 0 && serverArticles.length === local.length) {
          seedFirestoreIfEmpty(local as FirestoreArticle[]).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Server fetch failed, using localStorage:', err);
    }
  };

  useEffect(() => {
    loadLatestArticles();

    const handleUpdate = () => {
      const latest = getInitialArticles();
      setArticles(latest);
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', () => loadLatestArticles());

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', () => loadLatestArticles());
    };
  }, []);

  const handleTogglePublish = async (id: string) => {
    const updated = articles.map((a) => {
      if (a.id === id) {
        return { ...a, isDraft: !a.isDraft };
      }
      return a;
    });
    setArticles(updated);
    await saveArticles(updated);
    setMessage('Article status updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleGoodToKnow = (art: Article) => {
    const currentlyVisible = isGoodToKnowVisibleForArticle(art);
    const nextState = !currentlyVisible;
    
    // Save to visibility map in localStorage & dispatch update event
    setGoodToKnowVisibility(art.id, nextState);
    if (art.slug) {
      setGoodToKnowVisibility(art.slug, nextState);
    }

    // Also update articles list in store
    const updated = articles.map((a) => {
      if (a.id === art.id || (art.slug && a.slug === art.slug)) {
        return { ...a, goodToKnowEnabled: nextState, showGoodToKnow: nextState };
      }
      return a;
    });
    setArticles(updated);
    saveArticles(updated);

    setMessage(`"Good to Know" on "${art.title}" is now ${nextState ? 'SHOWN (ON)' : 'HIDDEN (OFF)'}.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (id: string) => {
    const target = articles.find((a) => a.id === id);
    await deleteArticle(id, target?.slug);
    const updated = getInitialArticles();
    setArticles(updated);
    setDeleteConfirmId(null);
    setMessage('Article deleted successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  // Filter & Search Logic
  const filtered = articles
    .filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && !a.isDraft) ||
        (statusFilter === 'DRAFT' && a.isDraft);
      const isVisible = isGoodToKnowVisibleForArticle(a);
      const matchGtk =
        gtkFilter === 'ALL' ||
        (gtkFilter === 'SHOWN' && isVisible) ||
        (gtkFilter === 'HIDDEN' && !isVisible);

      return matchSearch && matchCat && matchStatus && matchGtk;
    })
    .sort((a, b) => {
      if (sortOrder === 'TITLE') return a.title.localeCompare(b.title);
      if (sortOrder === 'OLDEST') return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Articles</h1>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Create, edit, search, publish, and delete blog articles.
          </p>
        </div>
        <Link href="/admin/articles/new/" className="btn-primary text-center">
          + Create New Article
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-3.5 rounded-xl border border-green-200">
          ✨ {message}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col gap-3">
        {/* Search */}
        <div className="w-full">
          <input
            type="search"
            placeholder="Search articles by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-sans text-[#332D2F]"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Filter Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-sans font-semibold text-[#332D2F] bg-white"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CATEGORIES).filter(([catSlug]) => catSlug !== 'expat-edit').map(([catSlug, info]) => (
              <option key={catSlug} value={catSlug}>{info.name}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-sans font-semibold text-[#332D2F] bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Live / Published</option>
            <option value="DRAFT">Drafts</option>
          </select>

          {/* Filter Good to Know */}
          <select
            value={gtkFilter}
            onChange={(e) => setGtkFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-sans font-semibold text-[#332D2F] bg-white"
          >
            <option value="ALL">📌 GTK: All</option>
            <option value="SHOWN">📌 GTK: ON</option>
            <option value="HIDDEN">✕ GTK: OFF</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-sans font-semibold text-[#332D2F] bg-white"
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="TITLE">By Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-xs text-[#332D2F]/60">
          <div className="w-6 h-6 border-2 border-[#B75B70] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading articles...
        </div>
      )}

      {/* ========== MOBILE CARD VIEW (below md) ========== */}
      <div className="md:hidden space-y-3">
        {filtered.length > 0 ? (
          filtered.map((art) => {
            const catInfo = CATEGORIES[art.category];
            const isGtkOn = isGoodToKnowVisibleForArticle(art);
            return (
              <div key={art.id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-4 space-y-3">
                {/* Top Row: Image + Title */}
                <div className="flex items-start gap-3">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/mama-logo.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-bold text-[#683846] line-clamp-2">{art.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-[#B75B70]">{catInfo ? catInfo.name : art.category}</span>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        art.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#F8EDEF] text-[#683846] border border-[#D7BB91]'
                      }`}>
                        {art.isDraft ? 'Draft' : 'Published'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleGoodToKnow(art)}
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      isGtkOn
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-300'
                    }`}
                  >
                    {isGtkOn ? '📌 ON' : '✕ OFF'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/${art.category}/${art.slug}/`}
                      target="_blank"
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#332D2F] bg-gray-50 border border-gray-200"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(art.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#B75B70] bg-[#F8EDEF] border border-[#B75B70]/20"
                    >
                      {art.isDraft ? 'Publish' : 'Unpublish'}
                    </button>
                    <Link
                      href={`/admin/articles/${art.id}/`}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-[#683846]"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmId(art.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-[#332D2F]/60 text-xs">
            No articles found matching your criteria.
          </div>
        )}
      </div>

      {/* ========== DESKTOP TABLE VIEW (md and above) ========== */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden font-sans text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[#332D2F] uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-6">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Good to Know</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((art) => {
                  const catInfo = CATEGORIES[art.category];
                  const isGtkOn = isGoodToKnowVisibleForArticle(art);
                  return (
                    <tr key={art.id} className="hover:bg-[#F8EDEF]/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 max-w-sm">
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/mama-logo.png'; }}
                          />
                          <div>
                            <h3 className="font-serif text-sm font-bold text-[#683846] line-clamp-1">{art.title}</h3>
                            <p className="text-[11px] text-[#332D2F]/80 line-clamp-1 mt-0.5">{art.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#B75B70]">{catInfo ? catInfo.name : art.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          art.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#F8EDEF] text-[#683846] border border-[#D7BB91]'
                        }`}>
                          {art.isDraft ? 'Draft' : 'Published'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleGoodToKnow(art)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all shadow-2xs ${
                            isGtkOn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200'
                          }`}
                          title={`Click to ${isGtkOn ? 'Hide' : 'Show'} Good to Know section on this article page`}
                        >
                          <span>{isGtkOn ? '📌 ON' : '✕ OFF'}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-[#332D2F]/80">{art.publishedAt}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${art.category}/${art.slug}/`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#332D2F] hover:bg-[#F8EDEF]"
                          >
                            Preview
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(art.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#B75B70] hover:bg-[#F8EDEF]"
                          >
                            {art.isDraft ? 'Publish' : 'Unpublish'}
                          </button>
                          <Link
                            href={`/admin/articles/${art.id}/`}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#683846] hover:bg-[#F8EDEF]"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteConfirmId(art.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#332D2F]/60 text-xs">
                    No articles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <span className="text-3xl">⚠️</span>
            <h3 className="font-serif text-xl font-bold text-[#683846]">Delete Article?</h3>
            <p className="text-xs text-[#332D2F]/80 leading-relaxed">
              Are you sure you want to delete this article? This action cannot be easily undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#332D2F] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Delete Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
