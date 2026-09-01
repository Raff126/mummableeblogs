'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getInitialArticles,
  saveArticles,
  Article,
} from '../../data/store';
import { CATEGORIES } from '../../data/categories';

export default function AdminDashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const loadArticles = () => {
    setArticles(getInitialArticles());
    fetch(`/api/articles?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: Article[]) => {
        if (Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadArticles();
    const handleUpdate = () => loadArticles();
    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const handleTogglePublish = (id: string) => {
    const updated = articles.map((a) => {
      if (a.id === id) {
        return { ...a, isDraft: !a.isDraft };
      }
      return a;
    });
    setArticles(updated);
    saveArticles(updated);
    setMessage('Article status updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const updated = articles.filter((a) => a.id !== id);
      setArticles(updated);
      saveArticles(updated);
      setMessage('Article deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = articles.filter((a) => !a.isDraft).length;
  const draftCount = articles.filter((a) => a.isDraft).length;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Write Hero */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#B75B70]/20 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <h1 className="font-serif text-3xl font-bold text-[#683846]">Welcome, Donne!</h1>
          </div>
          <p className="text-xs text-[#332D2F] font-sans">
            You currently have <strong className="text-[#683846]">{publishedCount} published guides</strong> and <strong className="text-[#B75B70]">{draftCount} drafts</strong>.
          </p>
        </div>

        <Link
          href="/admin/articles/new/"
          className="inline-flex items-center justify-center gap-2 bg-[#683846] hover:bg-[#332D2F] text-white font-sans text-xs sm:text-sm font-bold tracking-wider uppercase px-7 py-3.5 rounded-full shadow-md transition-all hover:-translate-y-0.5 flex-shrink-0"
        >
          <span>✍️</span>
          <span>Write New Post</span>
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-2xs">
          ✨ {message}
        </div>
      )}

      {/* Daily Articles Management */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#683846]">Recent Guides & Articles</h2>
            <p className="text-xs text-[#332D2F]/70">Quickly edit, preview, or publish updates to your website.</p>
          </div>
          <input
            type="search"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
          />
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length > 0 ? (
            filtered.map((art) => {
              const catInfo = CATEGORIES[art.category];
              return (
                <div
                  key={art.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8EDEF]/40 transition-colors"
                >
                  {/* Article Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 flex-shrink-0 shadow-2xs"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B75B70]">
                          {catInfo ? catInfo.name : art.category}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          art.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-[#F8EDEF] text-[#683846] border border-[#D7BB91]'
                        }`}>
                          {art.isDraft ? 'Draft' : 'Live'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#683846] leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-[11px] text-[#332D2F]/80 line-clamp-1">{art.excerpt}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <Link
                      href={`/${art.category}/${art.slug}/`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#332D2F] hover:bg-gray-50"
                    >
                      View Live
                    </Link>
                    <Link
                      href={`/admin/articles/${art.id}/`}
                      className="px-3 py-1.5 rounded-xl bg-[#F8EDEF] text-xs font-bold text-[#683846] hover:bg-[#B75B70] hover:text-white transition-colors"
                    >
                      Edit Post
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(art.id)}
                      className="px-3 py-1.5 rounded-xl border border-[#B75B70]/30 text-xs font-semibold text-[#B75B70] hover:bg-[#F8EDEF]"
                    >
                      {art.isDraft ? 'Publish' : 'Unpublish'}
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1.5 text-xs text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete post"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-[#332D2F]/70">
              No blog posts found. Click <strong>Write New Post</strong> to add your first guide!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
