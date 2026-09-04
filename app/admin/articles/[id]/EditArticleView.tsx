'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getInitialArticles,
  saveArticles,
  getInitialMedia,
  saveMedia,
  setGoodToKnowVisibility,
  isGoodToKnowVisibleForArticle,
  Article,
  MediaItem,
} from '../../../../data/store';
import { getAllArticles, ArticleItem } from '../../../../data/articles';
import { CATEGORIES } from '../../../../data/categories';
import { compressImage } from '../../../../utils/imageCompressor';
import ImageInputWithPaste from '../../../../components/admin/ImageInputWithPaste';
import RichContentEditor from '../../../../components/admin/RichContentEditor';

const IMAGE_PRESETS = [
  { label: 'Dubai Activities', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&fit=crop&q=80' },
  { label: 'Family Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&fit=crop&q=80' },
  { label: 'Beach & Weekend', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&fit=crop&q=80' },
  { label: 'School & Learning', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&fit=crop&q=80' },
];

export default function EditArticleView({ articleId }: { articleId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('uae-with-kids');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [readTime, setReadTime] = useState('');
  const [answerSummary, setAnswerSummary] = useState('');
  const [mummaBeeTip, setMummaBeeTip] = useState('');
  const [factLocation, setFactLocation] = useState('');
  const [factBestFor, setFactBestFor] = useState('');
  const [factBudget, setFactBudget] = useState('');
  const [factTimeNeeded, setFactTimeNeeded] = useState('');
  const [tags, setTags] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [goodToKnowEnabled, setGoodToKnowEnabled] = useState(true);

  // Media Library state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMediaList(getInitialMedia());
    const allArticles = getInitialArticles();
    const found = allArticles.find((a) => a.id === articleId || a.slug === articleId) ||
                  getAllArticles().find((a) => a.id === articleId || a.slug === articleId);
    if (found) {
      setArticle(found);
      setTitle(found.title);
      setSlug(found.slug);
      setCategory(found.category);
      setExcerpt(found.excerpt);
      setContent(found.content);
      setFeaturedImage(found.featuredImage);
      setImageCaption(found.imageCaption || '');
      setReadTime(found.readTime);
      setAnswerSummary(found.answerSummary || found.quickAnswer || '');
      setMummaBeeTip(found.mummaBeeTip || '');
      setFactLocation(found.quickFacts?.location || found.location || '');
      setFactBestFor(found.quickFacts?.bestFor || '');
      setFactBudget(found.quickFacts?.budget || '');
      setFactTimeNeeded(found.quickFacts?.timeNeeded || '');
      setTags((found.tags || []).join(', '));
      setIsDraft(!!found.isDraft);
      setGoodToKnowEnabled(isGoodToKnowVisibleForArticle(found));
    }
  }, [articleId]);

  // Handle direct file upload from computer with client-side compression & server upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.82);
      
      // Upload to server to get permanent /uploads/ file URL
      let finalUrl = compressedDataUrl;
      try {
        const uploadRes = await fetch('/api/upload/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: compressedDataUrl,
            filename: file.name,
          }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          if (data.url) finalUrl = data.url;
        }
      } catch (uploadErr) {
        console.warn('Server upload fallback:', uploadErr);
      }

      setFeaturedImage(finalUrl);

      // Store in Media Library for reuse
      const newMedia: MediaItem = {
        id: `med-${Date.now()}`,
        url: finalUrl,
        filename: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        dimensions: '1200x800',
      };
      const updatedMedia = [newMedia, ...mediaList.filter(m => m.url !== finalUrl)].slice(0, 30);
      setMediaList(updatedMedia);
      saveMedia(updatedMedia);

      setMessage('Photo uploaded, optimized, and set as Cover Image!');
      setTimeout(() => setMessage(''), 3000);
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      setError('Failed to process image file. Please try another image.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!article) {
    return (
      <div className="py-12 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-[#683846]">Article Not Found</h1>
        <Link href="/admin/articles" className="btn-primary">
          Return to Articles
        </Link>
      </div>
    );
  }

  const handleSave = async (draftStatus: boolean) => {
    if (!title.trim()) {
      setError('Please enter an article title.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let allArticles = getInitialArticles();
      const isLocal = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      );
      const endpoint = isLocal ? `/api/articles/?t=${Date.now()}` : `/data/articles.json?t=${Date.now()}`;
      try {
        const apiRes = await fetch(endpoint, { cache: 'no-store' });
        if (apiRes.ok) {
          const list = await apiRes.json();
          if (Array.isArray(list) && list.length > 0) {
            allArticles = list;
          }
        }
      } catch (fetchErr) {
        // Fallback to allArticles
      }

      let updated: ArticleItem[];
      const articleIndex = allArticles.findIndex(
        (a) => a.id === articleId || a.slug === articleId || (article && a.id === article.id) || (slug && a.slug === slug)
      );

      const targetArticle = articleIndex !== -1 ? allArticles[articleIndex] : (article || getAllArticles().find(a => a.id === articleId || a.slug === articleId));

      const updatedArticle: ArticleItem = {
        ...(targetArticle || {}),
        id: targetArticle?.id || articleId,
        author: targetArticle?.author || 'Donne',
        publishedAt: targetArticle?.publishedAt || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        title: title.trim(),
        slug: slug.trim() || targetArticle?.slug || articleId,
        category,
        excerpt: excerpt.trim(),
        content: content.trim() || `<p>${excerpt.trim()}</p>`,
        featuredImage: featuredImage || targetArticle?.featuredImage || '',
        imageAlt: targetArticle?.imageAlt || title.trim(),
        imageCaption: imageCaption.trim(),
        readTime: readTime || '4 min read',
        answerSummary: (answerSummary || excerpt).trim(),
        mummaBeeTip: mummaBeeTip.trim(),
        quickFacts: {
          location: factLocation.trim(),
          bestFor: factBestFor.trim(),
          budget: factBudget.trim(),
          timeNeeded: factTimeNeeded.trim(),
        },
        location: factLocation.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isDraft: draftStatus,
        goodToKnowEnabled: Boolean(goodToKnowEnabled),
        showGoodToKnow: Boolean(goodToKnowEnabled),
      };

      if (articleIndex !== -1) {
        updated = allArticles.map((a, idx) => (idx === articleIndex ? updatedArticle : a));
      } else {
        updated = [updatedArticle, ...allArticles];
      }

      // 1. Save to Good to Know visibility map for immediate global effect
      setGoodToKnowVisibility(articleId, Boolean(goodToKnowEnabled));
      if (slug.trim()) {
        setGoodToKnowVisibility(slug.trim(), Boolean(goodToKnowEnabled));
      }

      // 2. Save updated articles list
      await saveArticles(updated);
      setMessage('Article updated successfully! Live on website.');
      setTimeout(() => {
        router.push('/admin/articles');
      }, 1000);
    } catch (saveErr) {
      console.error('Failed to save article:', saveErr);
      setError('An error occurred while saving. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/articles" className="text-xs font-bold text-[#B75B70] hover:underline mb-1 inline-block">
            ← Back to Articles
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Edit Article</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#332D2F] hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Update & Publish'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-xl border border-green-200">
          ✨ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-xl border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6 font-sans">
        {/* Core Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
              Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-sm font-serif font-bold text-[#683846]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
                Category Hub *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-semibold text-[#332D2F] bg-white"
              >
                {Object.entries(CATEGORIES).filter(([catSlug]) => catSlug !== 'expat-edit').map(([catSlug, info]) => (
                  <option key={catSlug} value={catSlug}>{info.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Choices: Upload, Media Library, URL, & Presets */}
          <div className="bg-[#F8EDEF]/50 p-6 rounded-3xl border border-gray-200 space-y-4">
            <ImageInputWithPaste
              label="📸 Cover Image Options (Paste Image, Upload File, Media Library, or URL)"
              value={featuredImage}
              onChange={(newUrl) => setFeaturedImage(newUrl)}
              placeholder="Paste image URL, upload photo file, or press Ctrl+V to paste copied image"
              maxWidth={1200}
              maxHeight={1200}
              helpText="💡 Tip: You can paste a copied screenshot with Ctrl+V, drag & drop a file, or browse from your device."
            />

            {/* Quick Photo Presets */}
            <div>
              <span className="text-[10px] font-bold text-[#332D2F]/70 uppercase block mb-1.5">
                Or Quick Photo Theme Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFeaturedImage(preset.url)}
                    className={`text-[11px] px-3.5 py-1.5 rounded-full border transition-all ${
                      featuredImage === preset.url
                        ? 'bg-[#683846] text-white border-[#683846] font-bold shadow-xs'
                        : 'bg-white text-[#332D2F] border-gray-200 hover:border-[#B75B70] hover:bg-[#F8EDEF]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Caption */}
            <div>
              <label className="block text-[11px] font-bold text-[#332D2F]/80 uppercase mb-1">
                Image Caption (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Donne and her daughters enjoying the weekend in Dubai"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider">
                Short Excerpt / Summary
              </label>
              <button
                type="button"
                onClick={() => {
                  const cleanContent = content ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
                  const auto = (cleanContent.length > 0 ? (cleanContent.slice(0, 180) + (cleanContent.length > 180 ? '...' : '')) : '')
                    || (title.trim() ? `${title.trim()} — tested family recommendations, tips, and practical guides for UAE parents.` : '');
                  if (auto) setExcerpt(auto);
                }}
                className="text-[11px] font-bold text-[#B75B70] hover:text-[#683846] transition-colors flex items-center gap-1"
              >
                <span>🪄</span>
                <span>Auto-Fill from Story</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary for preview cards and search results..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F] leading-relaxed"
            />
          </div>

          {/* Quick Answer Callout */}
          <div className="bg-[#F8EDEF] p-5 rounded-2xl border-2 border-[#B75B70] space-y-2">
            <label className="block text-xs font-bold text-[#683846] uppercase tracking-wider">
              ⚡ Quick Answer / Executive Summary Box
            </label>
            <textarea
              rows={2}
              value={answerSummary}
              onChange={(e) => setAnswerSummary(e.target.value)}
              placeholder="Direct answer to what UAE parents are searching for..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
            />
          </div>

          {/* Good to Know / Quick Facts Box */}
          <div className="bg-white rounded-2xl border-2 border-[#D7BB91] p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#683846] uppercase tracking-wider flex items-center gap-2">
                <span>📌</span> Good to Know (Quick Facts)
              </h3>
              <p className="text-[11px] text-[#332D2F]/70 mt-0.5">
                Key details shown at the top of the article.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Al Barsha South, Dubai"
                  value={factLocation}
                  onChange={(e) => setFactLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Best For Ages</label>
                <input
                  type="text"
                  placeholder="e.g. Toddlers & Kids aged 2-10"
                  value={factBestFor}
                  onChange={(e) => setFactBestFor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Budget</label>
                <input
                  type="text"
                  placeholder="e.g. AED 95 per child"
                  value={factBudget}
                  onChange={(e) => setFactBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Time Needed</label>
                <input
                  type="text"
                  placeholder="e.g. 2–3 hours"
                  value={factTimeNeeded}
                  onChange={(e) => setFactTimeNeeded(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>
            </div>
          </div>

          {/* Mumma Bee Tip */}
          <div className="bg-[#F8EDEF] p-5 rounded-2xl border-l-4 border-[#B75B70] space-y-2">
            <label className="block text-xs font-bold text-[#683846] uppercase tracking-wider">
              🐝 Mumma Bee Tip Callout
            </label>
            <input
              type="text"
              value={mummaBeeTip}
              onChange={(e) => setMummaBeeTip(e.target.value)}
              placeholder="e.g. Book morning slots for free parking and quiet play areas!"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
            />
          </div>

          {/* Main Article Content - Visual WYSIWYG Editor */}
          <div>
            <RichContentEditor
              label="Blog Story & Details"
              value={content}
              onChange={setContent}
              placeholder="Write your guide, tips, and experiences here... Highlight any brand/product and click 'Link 🔗' to make it clickable!"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1">
              Topic Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Dubai, Activities, Weekend, Play Areas"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
            />
          </div>
        </div>
      </div>

      {/* Media Library Selection Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#683846]">Pick Photo from Media Library</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-gray-400 hover:text-[#332D2F] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto p-1">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setFeaturedImage(m.url);
                    setShowMediaPicker(false);
                  }}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 aspect-square relative group ${
                    featuredImage === m.url ? 'border-[#B75B70] ring-2 ring-[#B75B70]' : 'border-gray-200 hover:border-[#B75B70]'
                  }`}
                >
                  <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#683846]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Select
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
