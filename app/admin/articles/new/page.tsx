'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getInitialArticles,
  saveArticles,
  getInitialMedia,
  saveMedia,
  Article,
  MediaItem,
} from '../../../../data/store';
import { CATEGORIES } from '../../../../data/categories';
import { compressImage } from '../../../../utils/imageCompressor';
import ImageInputWithPaste from '../../../../components/admin/ImageInputWithPaste';

const IMAGE_PRESETS = [
  { label: 'Dubai Activities', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&fit=crop&q=80' },
  { label: 'Family Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&fit=crop&q=80' },
  { label: 'Beach & Weekend', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&fit=crop&q=80' },
  { label: 'School & Learning', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&fit=crop&q=80' },
];

export default function AdminNewArticlePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('uae-with-kids');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState(IMAGE_PRESETS[0].url);
  const [imageCaption, setImageCaption] = useState('');
  const [answerSummary, setAnswerSummary] = useState('');
  const [mummaBeeTip, setMummaBeeTip] = useState('');
  const [factLocation, setFactLocation] = useState('');
  const [factBestFor, setFactBestFor] = useState('');
  const [factBudget, setFactBudget] = useState('');
  const [factTimeNeeded, setFactTimeNeeded] = useState('');
  const [tags, setTags] = useState('Dubai, UAE, Family Guide');

  // Media Library state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMediaList(getInitialMedia());
  }, []);

  // Handle direct file upload from computer with client-side compression
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
      // Compress and resize image to prevent storage errors
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.82);
      setFeaturedImage(compressedDataUrl);

      // Store in Media Library for reuse
      const newMedia: MediaItem = {
        id: `med-${Date.now()}`,
        url: compressedDataUrl,
        filename: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        dimensions: '1200x800',
      };
      const updatedMedia = [newMedia, ...mediaList];
      setMediaList(updatedMedia);
      saveMedia(updatedMedia);

      setMessage('Photo uploaded, optimized, and set as Cover Image!');
      setTimeout(() => setMessage(''), 3000);
    } catch (uploadError) {
      console.error('Image compression failed:', uploadError);
      setError('Failed to process image. Please try another image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (isDraft: boolean) => {
    if (!title.trim()) {
      setError('Please enter a title for your blog post.');
      return;
    }
    if (!excerpt.trim()) {
      setError('Please enter a short summary or excerpt.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const currentArticles = getInitialArticles();
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newArticle: Article = {
        id: `art-${Date.now()}`,
        slug: slug || `post-${Date.now()}`,
        title,
        category,
        excerpt,
        content: content || `<p>${excerpt}</p>`,
        publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: '4 min read',
        author: 'Donne',
        featuredImage: featuredImage || IMAGE_PRESETS[0].url,
        imageAlt: title,
        imageCaption,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isDraft,
        answerSummary: answerSummary || excerpt,
        quickFacts: {
          location: factLocation || 'Dubai & Abu Dhabi',
          bestFor: factBestFor || 'All Ages',
          budget: factBudget || 'Varies',
          timeNeeded: factTimeNeeded || '2–3 hours',
        },
        location: factLocation,
        mummaBeeTip: mummaBeeTip || 'Always book morning slots during peak months to skip queues!',
      };

      const updated = [newArticle, ...currentArticles];
      await saveArticles(updated);

      setMessage(isDraft ? '✨ Draft saved successfully!' : '🎉 Post published live to the website!');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } catch (saveErr) {
      console.error('Error publishing post:', saveErr);
      setError('An error occurred while publishing. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs font-bold text-[#B75B70] hover:underline mb-1 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Write New Blog Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#332D2F] hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Publishing...' : 'Publish Post 🚀'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-2xs">
          ✨ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Editor Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6 font-sans">
        {/* Post Title */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
            Post Title *
          </label>
          <input
            type="text"
            placeholder="e.g. 5 Fun Weekend Spots in Abu Dhabi We Loved"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-base font-serif font-bold text-[#683846]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-bold text-[#332D2F] bg-white"
          >
            {Object.entries(CATEGORIES).map(([catSlug, info]) => (
              <option key={catSlug} value={catSlug}>{info.name}</option>
            ))}
          </select>
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

        {/* Short Summary */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
            Short Summary (1-2 sentences) *
          </label>
          <textarea
            rows={2}
            placeholder="A quick summary for parents scanning the guide..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F] leading-relaxed"
          />
        </div>

        {/* Quick Answer Callout */}
        <div className="bg-[#F8EDEF] p-5 rounded-2xl border-2 border-[#B75B70] space-y-2">
          <label className="block text-xs font-bold text-[#683846] uppercase tracking-wider">
            ⚡ Quick Answer / Executive Summary
          </label>
          <textarea
            rows={2}
            value={answerSummary}
            onChange={(e) => setAnswerSummary(e.target.value)}
            placeholder="Provide a quick direct answer for readers searching for recommendations..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
          />
        </div>

        {/* Good to Know Grid */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#D7BB91] space-y-3">
          <label className="block text-xs font-bold text-[#683846] uppercase tracking-wider">
            📌 Good to Know (Quick Facts)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Location</label>
              <input
                type="text"
                placeholder="e.g. Downtown Dubai"
                value={factLocation}
                onChange={(e) => setFactLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Best For Ages</label>
              <input
                type="text"
                placeholder="e.g. Ages 3-12"
                value={factBestFor}
                onChange={(e) => setFactBestFor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Budget</label>
              <input
                type="text"
                placeholder="e.g. Free admission / AED 50"
                value={factBudget}
                onChange={(e) => setFactBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#683846] uppercase mb-0.5">Time Needed</label>
              <input
                type="text"
                placeholder="e.g. Half day"
                value={factTimeNeeded}
                onChange={(e) => setFactTimeNeeded(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
          </div>
        </div>

        {/* Post Story Content */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
            Blog Story & Details (HTML formatting supported)
          </label>
          <textarea
            rows={8}
            placeholder="Write your guide, tips, and experiences here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs leading-relaxed font-sans text-[#332D2F]"
          />
        </div>

        {/* Mumma Bee Tip */}
        <div className="bg-[#F8EDEF] p-5 rounded-2xl border-l-4 border-[#B75B70] space-y-2">
          <label className="block text-xs font-bold text-[#683846] uppercase tracking-wider">
            🐝 Mumma Bee Tip Callout
          </label>
          <input
            type="text"
            placeholder="e.g. Best to book online 2 days in advance to skip the queue!"
            value={mummaBeeTip}
            onChange={(e) => setMummaBeeTip(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs text-[#332D2F]"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
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

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-5 py-3 rounded-xl border border-gray-200 text-xs font-bold text-[#332D2F] hover:bg-gray-50 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? 'Publishing...' : 'Publish Post 🚀'}
          </button>
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
