'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialWorkWithUs, saveWorkWithUs, WorkWithUsPageContent } from '../../../data/store';

export default function AdminWorkWithUsEditPage() {
  const [content, setContent] = useState<WorkWithUsPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setContent(getInitialWorkWithUs());
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/work-with-us/?t=${Date.now()}` : `/data/work-with-us.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setContent((prev) => (prev ? { ...prev, ...data } : data));
        }
      })
      .catch(() => {});
  }, []);

  if (!content) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveWorkWithUs(content);
      setMessage('Work With Us page saved successfully! Changes are live on the website.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Save work with us error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Work With Us Editor</h1>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Manage brand partnerships copy, key statistics, media kit note, and collaboration packages.
          </p>
        </div>
        <Link
          href="/work-with-us"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors w-fit shadow-xs"
        >
          <span>👁️ View Live Page ↗</span>
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-sans">
        {/* Section 1: Hero */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🌟</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              1. Hero Header & Contact Call-to-Action
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Top Eyebrow Badge</label>
            <input
              type="text"
              value={content.eyebrow}
              onChange={(e) => setContent({ ...content, eyebrow: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Main Headline</label>
            <input
              type="text"
              value={content.headline}
              onChange={(e) => setContent({ ...content, headline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-serif font-bold text-base text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Introduction Paragraph</label>
            <textarea
              rows={3}
              value={content.leadText}
              onChange={(e) => setContent({ ...content, leadText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">CTA Button Text</label>
              <input
                type="text"
                value={content.ctaButtonText}
                onChange={(e) => setContent({ ...content, ctaButtonText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Inquiry Email Address</label>
              <input
                type="email"
                value={content.ctaEmail}
                onChange={(e) => setContent({ ...content, ctaEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Partnership Metrics */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">📊</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              2. Key Audience & Engagement Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8EDEF]/50 border border-[#B75B70]/15 space-y-2">
              <label className="block text-[11px] font-bold text-[#683846] uppercase">Stat 1 (e.g. Readers)</label>
              <input
                type="text"
                value={content.stats1Number}
                onChange={(e) => setContent({ ...content, stats1Number: e.target.value })}
                placeholder="45,000+"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#683846]"
              />
              <input
                type="text"
                value={content.stats1Label}
                onChange={(e) => setContent({ ...content, stats1Label: e.target.value })}
                placeholder="Monthly UAE Family Readers"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-[#332D2F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#F8EDEF]/50 border border-[#B75B70]/15 space-y-2">
              <label className="block text-[11px] font-bold text-[#683846] uppercase">Stat 2 (e.g. Community)</label>
              <input
                type="text"
                value={content.stats2Number}
                onChange={(e) => setContent({ ...content, stats2Number: e.target.value })}
                placeholder="12.4K"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#683846]"
              />
              <input
                type="text"
                value={content.stats2Label}
                onChange={(e) => setContent({ ...content, stats2Label: e.target.value })}
                placeholder="Engaged Instagram Community"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-[#332D2F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#F8EDEF]/50 border border-[#B75B70]/15 space-y-2">
              <label className="block text-[11px] font-bold text-[#683846] uppercase">Stat 3 (e.g. Engagement)</label>
              <input
                type="text"
                value={content.stats3Number}
                onChange={(e) => setContent({ ...content, stats3Number: e.target.value })}
                placeholder="4.8%"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#683846]"
              />
              <input
                type="text"
                value={content.stats3Label}
                onChange={(e) => setContent({ ...content, stats3Label: e.target.value })}
                placeholder="Average Social Engagement"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] text-[#332D2F]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Audience Description */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">👨‍👩‍👧‍👧</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              3. Audience Profile
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Audience Section Title</label>
            <input
              type="text"
              value={content.audienceTitle}
              onChange={(e) => setContent({ ...content, audienceTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Audience Description</label>
            <textarea
              rows={3}
              value={content.audienceText}
              onChange={(e) => setContent({ ...content, audienceText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed"
            />
          </div>
        </div>

        {/* Section 4: Collaboration Formats */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🤝</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              4. Collaboration Offerings / Formats
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-[#683846]">Format 1 (Editorial Guides)</label>
              <input
                type="text"
                value={content.format1Title}
                onChange={(e) => setContent({ ...content, format1Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold"
              />
              <textarea
                rows={2}
                value={content.format1Desc}
                onChange={(e) => setContent({ ...content, format1Desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-[#683846]">Format 2 (Social & Reels)</label>
              <input
                type="text"
                value={content.format2Title}
                onChange={(e) => setContent({ ...content, format2Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold"
              />
              <textarea
                rows={2}
                value={content.format2Desc}
                onChange={(e) => setContent({ ...content, format2Desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-[#683846]">Format 3 (Newsletter Features)</label>
              <input
                type="text"
                value={content.format3Title}
                onChange={(e) => setContent({ ...content, format3Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold"
              />
              <textarea
                rows={2}
                value={content.format3Desc}
                onChange={(e) => setContent({ ...content, format3Desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-[#683846]">Format 4 (Product & Brand Reviews)</label>
              <input
                type="text"
                value={content.format4Title}
                onChange={(e) => setContent({ ...content, format4Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold"
              />
              <textarea
                rows={2}
                value={content.format4Desc}
                onChange={(e) => setContent({ ...content, format4Desc: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Media Kit Note */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">📁</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              5. Media Kit Request Note
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Media Kit Note Copy</label>
            <textarea
              rows={2}
              value={content.mediaKitNote}
              onChange={(e) => setContent({ ...content, mediaKitNote: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed"
            />
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-soft sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving Changes...' : 'Save Work With Us Changes'}</span>
          </button>
          
          {message && (
            <div className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-1.5 animate-fade-in">
              <span>✨</span>
              <span>{message}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
