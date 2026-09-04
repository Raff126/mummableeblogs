'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES, CategoryInfo } from '../../../data/categories';
import { getInitialCategories, saveCategories } from '../../../data/store';

function AdminCategoriesContent() {
  const searchParams = useSearchParams();
  const editSlugParam = searchParams.get('edit');

  const [categoriesMap, setCategoriesMap] = useState<Record<string, CategoryInfo>>(CATEGORIES);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryInfo | null>(null);

  const [message, setMessage] = useState('');

  useEffect(() => {
    const loaded = getInitialCategories();
    setCategoriesMap(loaded);

    if (editSlugParam && loaded[editSlugParam]) {
      setEditingSlug(editSlugParam);
      setEditForm({ ...loaded[editSlugParam] });
    }
  }, [editSlugParam]);

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingSlug(cat.slug);
    setEditForm({ ...cat });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editingSlug) return;

    const updated = {
      ...categoriesMap,
      [editingSlug]: editForm,
    };

    setCategoriesMap(updated);
    saveCategories(updated);
    setMessage(`"${editForm.name}" category updated successfully!`);
    setEditingSlug(null);
    setEditForm(null);
    setTimeout(() => setMessage(''), 4000);
  };

  const [deleteConfirmCat, setDeleteConfirmCat] = useState<{ slug: string; name: string } | null>(null);

  const handleDeleteCategory = (slug: string, name: string) => {
    const updated = { ...categoriesMap };
    delete updated[slug];

    setCategoriesMap(updated);
    saveCategories(updated);
    if (editingSlug === slug) {
      setEditingSlug(null);
      setEditForm(null);
    }
    setDeleteConfirmCat(null);
    setMessage(`"${name || slug}" category deleted successfully!`);
    setTimeout(() => setMessage(''), 4000);
  };

  const categoriesList = Object.values(categoriesMap).filter(cat => cat.slug !== 'expat-edit');

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Category Hub Editors</h1>
          <p className="text-xs text-[#332D2F]/70 mt-0.5">
            Edit hero banners, descriptions, and SEO details for topic hub pages.
          </p>
        </div>
        <Link
          href="/admin/pages"
          className="text-xs font-bold text-[#B75B70] hover:text-[#683846] uppercase tracking-wider"
        >
          ← Back to Site Pages
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      {/* Edit Category Modal / Expanded Card */}
      {editingSlug && editForm && (
        <form onSubmit={handleSaveEdit} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#B75B70]/40 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{editForm.icon}</span>
              <h2 className="font-serif text-xl font-bold text-[#683846]">
                Editing Hub: {editForm.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingSlug(null);
                setEditForm(null);
              }}
              className="text-xs font-bold text-gray-400 hover:text-[#332D2F]"
            >
              Cancel ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Hub Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#683846]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Hero Eyebrow</label>
              <input
                type="text"
                value={editForm.heroEyebrow}
                onChange={(e) => setEditForm({ ...editForm, heroEyebrow: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Hero Title (Headline)</label>
            <input
              type="text"
              value={editForm.heroTitle}
              onChange={(e) => setEditForm({ ...editForm, heroTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-serif font-bold text-base text-[#683846]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Hero Intro / Description</label>
            <textarea
              rows={3}
              value={editForm.heroIntro}
              onChange={(e) => setEditForm({ ...editForm, heroIntro: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">SEO Meta Title</label>
              <input
                type="text"
                value={editForm.seoTitle}
                onChange={(e) => setEditForm({ ...editForm, seoTitle: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">SEO Meta Description</label>
              <input
                type="text"
                value={editForm.seoDescription}
                onChange={(e) => setEditForm({ ...editForm, seoDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3">
            <button type="submit" className="btn-primary">
              Save Hub Changes
            </button>
            <Link
              href={`/${editForm.slug}`}
              target="_blank"
              className="text-xs font-bold text-[#B75B70] hover:text-[#683846] uppercase"
            >
              View Hub Live →
            </Link>
          </div>
        </form>
      )}

      {/* Active Categories List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#683846]">Site Hub Categories ({categoriesList.length})</h2>
          <span className="text-xs text-gray-500 font-sans">Manage and customize category hub pages</span>
        </div>
        <div className="divide-y divide-gray-100 text-xs font-sans">
          {categoriesList.map((cat) => (
            <div key={cat.slug} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8EDEF]/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.icon || '📁'}</span>
                  <h3 className="font-serif text-base font-bold text-[#683846]">{cat.name || cat.slug}</h3>
                  <span className="text-[10px] bg-[#F8EDEF] text-[#B75B70] border border-[#B75B70]/30 px-2 py-0.5 rounded-full font-mono">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-xs text-[#332D2F]/80 max-w-xl">{cat.heroIntro || cat.description}</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {/* Edit Icon Button */}
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="w-9 h-9 rounded-xl bg-[#683846] text-white hover:bg-[#B75B70] flex items-center justify-center transition-all shadow-2xs hover:scale-105"
                  title={`Edit ${cat.name || cat.slug}`}
                  aria-label={`Edit ${cat.name || cat.slug}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* View Live Icon Button */}
                <Link
                  href={`/${cat.slug}`}
                  target="_blank"
                  className="w-9 h-9 rounded-xl bg-[#F8EDEF] text-[#683846] hover:bg-[#B75B70] hover:text-white flex items-center justify-center transition-all border border-[#B75B70]/20 shadow-2xs hover:scale-105"
                  title={`View ${cat.name || cat.slug} Live`}
                  aria-label={`View ${cat.name || cat.slug} Live`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>

                {/* Delete Icon Button */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCat({ slug: cat.slug, name: cat.name || cat.slug })}
                  className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all border border-red-200 shadow-2xs hover:scale-105"
                  title={`Delete ${cat.name || cat.slug}`}
                  aria-label={`Delete ${cat.name || cat.slug}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-fade-in">
            <span className="text-3xl">⚠️</span>
            <h3 className="font-serif text-xl font-bold text-[#683846]">Delete Category Hub?</h3>
            <p className="text-xs text-[#332D2F]/80 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#683846]">"{deleteConfirmCat.name}"</strong>? This will remove the category from the site hub list.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#332D2F] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(deleteConfirmCat.slug, deleteConfirmCat.name)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm transition-colors"
              >
                Delete Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#332D2F]">Loading Categories Hub...</div>}>
      <AdminCategoriesContent />
    </Suspense>
  );
}
