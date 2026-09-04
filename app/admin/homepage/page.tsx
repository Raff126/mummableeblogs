'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, saveHomepage, HomepageContent } from '../../../data/store';
import ImageInputWithPaste from '../../../components/admin/ImageInputWithPaste';

export default function AdminHomepageEditPage() {
  const [hp, setHp] = useState<HomepageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const local = getInitialHomepage();
    setHp(local);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setHp((prev) => (prev ? { ...prev, ...data } : data));
        }
      })
      .catch(() => {});
  }, []);

  if (!hp) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveHomepage(hp);
      setMessage('Homepage content saved successfully! Changes are live on the website.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Save homepage error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">Homepage Editor</h1>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Edit your public homepage headline, hero text, photo, buttons, Donne introduction, and newsletter.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors w-fit shadow-xs"
        >
          <span>👁️ View Live Homepage ↗</span>
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-sans">
        {/* Hero Section Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            1. Hero Section Content
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Eyebrow Text</label>
            <input
              type="text"
              value={hp.heroEyebrow}
              onChange={(e) => setHp({ ...hp, heroEyebrow: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Main Headline</label>
            <input
              type="text"
              value={hp.heroHeadline}
              onChange={(e) => setHp({ ...hp, heroHeadline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-serif font-bold text-base text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Description Copy</label>
            <textarea
              rows={3}
              value={hp.heroDescription}
              onChange={(e) => setHp({ ...hp, heroDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <ImageInputWithPaste
              label="Hero Main Photo"
              value={hp.heroImage}
              onChange={(newUrl) => setHp({ ...hp, heroImage: newUrl })}
              placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
              maxWidth={1000}
              maxHeight={1000}
              helpText="💡 Tip: Paste an image directly with Ctrl+V, drag & drop, or browse your files."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Primary Button Text</label>
              <input
                type="text"
                value={hp.heroPrimaryCtaText}
                onChange={(e) => setHp({ ...hp, heroPrimaryCtaText: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Primary Button Link</label>
              <input
                type="text"
                value={hp.heroPrimaryCtaUrl}
                onChange={(e) => setHp({ ...hp, heroPrimaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Secondary Button Text</label>
              <input
                type="text"
                value={hp.heroSecondaryCtaText}
                onChange={(e) => setHp({ ...hp, heroSecondaryCtaText: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Secondary Button Link</label>
              <input
                type="text"
                value={hp.heroSecondaryCtaUrl}
                onChange={(e) => setHp({ ...hp, heroSecondaryCtaUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Donne Section Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            2. Donne Introduction ("The Mum Behind The Guides")
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Headline</label>
            <input
              type="text"
              value={hp.donneHeadline}
              onChange={(e) => setHp({ ...hp, donneHeadline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Bio Description</label>
            <textarea
              rows={3}
              value={hp.donneDescription}
              onChange={(e) => setHp({ ...hp, donneDescription: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <ImageInputWithPaste
              label="Donne Profile Photo (Circular on Homepage)"
              value={hp.donneImage}
              onChange={(newUrl) => setHp({ ...hp, donneImage: newUrl })}
              placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
              maxWidth={800}
              maxHeight={800}
              helpText="💡 Tip: You can paste a screenshot or photo directly with Ctrl+V."
            />
          </div>
        </div>

        {/* Newsletter Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            3. Newsletter Band
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Heading</label>
            <input
              type="text"
              value={hp.newsletterHeadline}
              onChange={(e) => setHp({ ...hp, newsletterHeadline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Supporting Copy</label>
            <input
              type="text"
              value={hp.newsletterSubtext}
              onChange={(e) => setHp({ ...hp, newsletterSubtext: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* Save Bar with Immediate Notification Feedback */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-soft sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving Changes...' : 'Save Homepage Changes'}</span>
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
