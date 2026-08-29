'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialAbout, saveAbout, AboutPageContent } from '../../../data/store';
import ImageInputWithPaste from '../../../components/admin/ImageInputWithPaste';

export default function AdminAboutEditPage() {
  const [about, setAbout] = useState<AboutPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const local = getInitialAbout();
    setAbout(local);
    fetch(`/api/about?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setAbout((prev) => (prev ? { ...prev, ...data } : data));
        }
      })
      .catch(() => {});
  }, []);

  if (!about) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveAbout(about);
      setMessage('About page content saved successfully! Changes are live on the website.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Save about error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#683846]">About Page Editor</h1>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Edit your story, family introduction, core trust pillars, and public bio.
          </p>
        </div>
        <Link
          href="/about/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors w-fit shadow-xs"
        >
          <span>👁️ View Live About Page ↗</span>
        </Link>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-xs flex items-center gap-2">
          <span>✨</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-sans">
        {/* Section 1: Hero Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🌟</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              1. Hero Header & Introduction
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Top Eyebrow Badge
            </label>
            <input
              type="text"
              value={about.eyebrow}
              onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="e.g. THE MUM BEHIND THE GUIDES"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Main Headline
            </label>
            <input
              type="text"
              value={about.headline}
              onChange={(e) => setAbout({ ...about, headline: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-serif font-bold text-base text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="e.g. The Mum Behind MummaBeeBlog"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Lead Paragraph (Subheading)
            </label>
            <textarea
              rows={3}
              value={about.leadText}
              onChange={(e) => setAbout({ ...about, leadText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="A brief warm introduction summarizing who you are..."
            />
          </div>
        </div>

        {/* Section 2: Story & Profile Highlight */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">📖</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              2. Story & Author Profile
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={about.profileBadgeText}
                onChange={(e) => setAbout({ ...about, profileBadgeText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                placeholder="e.g. MEET DONNE"
              />
            </div>

            <div>
              <ImageInputWithPaste
                label="Author Profile & Story Photo"
                value={about.profileImage}
                onChange={(newUrl) => setAbout({ ...about, profileImage: newUrl })}
                placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
                maxWidth={900}
                maxHeight={900}
                helpText="💡 Tip: You can paste a screenshot or photo directly with Ctrl+V, drag & drop a file, or browse from your device."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Story Heading
            </label>
            <input
              type="text"
              value={about.profileHeading}
              onChange={(e) => setAbout({ ...about, profileHeading: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-serif font-bold text-sm text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="e.g. How MummaBeeBlog Began"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Full Story (Paragraphs separated by blank lines)
            </label>
            <textarea
              rows={8}
              value={about.profileStory}
              onChange={(e) => setAbout({ ...about, profileStory: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-sans"
              placeholder="Write your complete personal story and background here..."
            />
          </div>
        </div>

        {/* Section 3: Core Trust Pillars */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🛡️</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              3. Core Trust Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#F8EDEF]/30 border border-gray-100">
              <label className="block text-xs font-bold text-[#683846] uppercase">
                Pillar 1 Title
              </label>
              <input
                type="text"
                value={about.pillar1Title}
                onChange={(e) => setAbout({ ...about, pillar1Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] font-bold focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
              <label className="block text-xs font-bold text-[#332D2F] uppercase mt-2">
                Pillar 1 Description
              </label>
              <textarea
                rows={3}
                value={about.pillar1Text}
                onChange={(e) => setAbout({ ...about, pillar1Text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>

            {/* Pillar 2 */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#F8EDEF]/30 border border-gray-100">
              <label className="block text-xs font-bold text-[#683846] uppercase">
                Pillar 2 Title
              </label>
              <input
                type="text"
                value={about.pillar2Title}
                onChange={(e) => setAbout({ ...about, pillar2Title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] font-bold focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
              <label className="block text-xs font-bold text-[#332D2F] uppercase mt-2">
                Pillar 2 Description
              </label>
              <textarea
                rows={3}
                value={about.pillar2Text}
                onChange={(e) => setAbout({ ...about, pillar2Text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Family Note */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-lg">🔒</span>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              4. Family Privacy & Standards Note
            </h2>
          </div>
          <div>
            <textarea
              rows={3}
              value={about.privacyNote}
              onChange={(e) => setAbout({ ...about, privacyNote: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="Describe how you balance sharing adventures while protecting your children's privacy..."
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
            <span>{isSaving ? 'Saving Changes...' : 'Save About Page Changes'}</span>
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
