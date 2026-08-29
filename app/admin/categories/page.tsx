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

  const [newCatName, setNewCatName] = useState('');
  const [newCatEyebrow, setNewCatEyebrow] = useState('');
  const [newCatIntro, setNewCatIntro] = useState('');
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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: CategoryInfo = {
      slug,
      name: newCatName,
      heroEyebrow: newCatEyebrow || 'UAE FAMILY GUIDE',
      heroTitle: newCatName,
      heroIntro: newCatIntro || `Practical guides and recommendations for ${newCatName}.`,
      description: `Guides for ${newCatName}`,
      subcategories: ['All Guides'],
      color: 'pink',
      icon: '✨',
      seoTitle: `${newCatName} | MummaBeeBlog`,
      seoDescription: `Practical guides and tips for ${newCatName}.`,
    };

    const updated = { ...categoriesMap, [slug]: newCategory };
    setCategoriesMap(updated);
    saveCategories(updated);
    setNewCatName('');
    setNewCatEyebrow('');
    setNewCatIntro('');
    setMessage('Category added successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const categoriesList = Object.values(categoriesMap);

  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Category Hub Editors</h1>
          <p className="text-xs text-[#332D2F]/70 mt-0.5">
            Edit hero banners, descriptions, and SEO details for all 5 topic hub pages.
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
          <span className="text-xs text-gray-500 font-sans">Click "Edit Hub" to customize any category page</span>
        </div>
        <div className="divide-y divide-gray-100 text-xs font-sans">
          {categoriesList.map((cat) => (
            <div key={cat.slug} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8EDEF]/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <h3 className="font-serif text-base font-bold text-[#683846]">{cat.name}</h3>
                  <span className="text-[10px] bg-[#F8EDEF] text-[#B75B70] border border-[#B75B70]/30 px-2 py-0.5 rounded-full font-mono">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-xs text-[#332D2F]/80 max-w-xl">{cat.heroIntro}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#683846] text-white text-xs font-bold hover:bg-[#B75B70] transition-colors"
                >
                  ✏️ Edit Hub
                </button>
                <Link
                  href={`/${cat.slug}`}
                  target="_blank"
                  className="px-3.5 py-1.5 rounded-xl bg-[#F8EDEF] text-xs font-bold text-[#683846] hover:bg-[#B75B70] hover:text-white transition-colors"
                >
                  View Live →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Category Section */}
      <form onSubmit={handleAddCategory} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#683846]">Create New Category Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nursery & Preschool"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Hero Eyebrow</label>
            <input
              type="text"
              placeholder="e.g. UAE NURSERY GUIDES"
              value={newCatEyebrow}
              onChange={(e) => setNewCatEyebrow(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Category Description</label>
          <input
            type="text"
            placeholder="Short intro describing this hub..."
            value={newCatIntro}
            onChange={(e) => setNewCatIntro(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
          />
        </div>
        <button type="submit" className="btn-primary">
          Add Category
        </button>
      </form>
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
