'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getInitialAbout, saveAbout, AboutPageContent, DEFAULT_ABOUT } from '../../../data/store';
import ImageInputWithPaste from '../../../components/admin/ImageInputWithPaste';

export default function AdminAboutEditPage() {
  const [about, setAbout] = useState<AboutPageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState('');
  const isUserEditing = useRef(false);

  useEffect(() => {
    const local = getInitialAbout();
    setAbout(local);

    const loadRemote = async () => {
      let firestoreLoaded = false;
      // 1. Try Firestore first
      try {
        const { fetchAboutFromFirestore } = await import('../../../utils/firestoreSettings');
        const fsData = await fetchAboutFromFirestore();
        if (fsData && typeof fsData === 'object' && (fsData.headline || fsData.profileImage || fsData.profileStory)) {
          firestoreLoaded = true;
          setAbout((prev) => {
            if (isUserEditing.current) return prev;
            if (!prev) return fsData;
            if (prev.updatedAt && fsData.updatedAt && prev.updatedAt > fsData.updatedAt) {
              return prev;
            }
            return { ...prev, ...fsData };
          });
          return;
        }
      } catch (_) {}

      // 2. Fallback to API / static JSON only if Firestore didn't load
      if (!firestoreLoaded) {
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const endpoint = isLocal ? `/api/about/?t=${Date.now()}` : `/data/about.json?t=${Date.now()}`;
        try {
          const res = await fetch(endpoint, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
              setAbout((prev) => {
                if (isUserEditing.current) return prev;
                if (!prev) return data;
                return { ...data, ...prev };
              });
            }
          }
        } catch (_) {}
      }
    };

    loadRemote();
  }, []);

  const updateField = (key: keyof AboutPageContent, value: any) => {
    isUserEditing.current = true;
    setHasUnsavedChanges(true);
    setAbout((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const resetField = (key: keyof AboutPageContent, defaultValue: any) => {
    updateField(key, defaultValue);
  };

  const performSave = async () => {
    if (!about || isSaving) return;
    setIsSaving(true);
    try {
      await saveAbout(about);
      isUserEditing.current = false;
      setHasUnsavedChanges(false);
      setMessage('About page content saved successfully! Changes are live on the website & synced to cloud.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Save about error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [about, isSaving]);

  if (!about) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    performSave();
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans pb-16">
      {/* Top Header Bar with Instant Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">About Page Editor</h1>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Edit your story, family introduction, core trust pillars, and public bio for the main /about page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={performSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#B75B70] hover:bg-[#683846] disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Press Ctrl+S to save anytime"
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
          <Link
            href="/about/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>👁️ Live ↗</span>
          </Link>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-amber-50 text-amber-900 text-xs font-semibold p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>You have edited or deleted words in the form. Click <strong>"Save Changes"</strong> to publish them live to your website!</span>
          </div>
          <button
            type="button"
            onClick={performSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Publish Now →'}
          </button>
        </div>
      )}

      {/* Cross-link helper banner */}
      <div className="bg-[#F8EDEF]/80 border border-[#B75B70]/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#683846]">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span>
            <strong>Note:</strong> Looking to edit the <em>"Hi, I'm Donne (The Mum Behind The Guides)"</em> section on the <strong>Homepage</strong>?
          </span>
        </div>
        <Link
          href="/admin/homepage#donne"
          className="font-bold underline text-[#B75B70] hover:text-[#683846] whitespace-nowrap"
        >
          Edit Homepage Donne Section →
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
              1. Hero Header &amp; Introduction
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">
              Top Eyebrow Badge
            </label>
            <input
              type="text"
              value={about.eyebrow}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="e.g. THE MUM BEHIND THE GUIDES"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Main Headline</label>
              <button
                type="button"
                onClick={() => resetField('headline', DEFAULT_ABOUT.headline)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default headline"
              >
                <span>↺ Reset to Default</span>
              </button>
            </div>
            <input
              type="text"
              value={about.headline}
              onChange={(e) => updateField('headline', e.target.value)}
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
              onChange={(e) => updateField('leadText', e.target.value)}
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
              2. Story &amp; Author Profile
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
                onChange={(e) => updateField('profileBadgeText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
                placeholder="e.g. MEET DONNE"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#332D2F] uppercase">Author Profile &amp; Story Photo</label>
                <button
                  type="button"
                  onClick={() => resetField('profileImage', DEFAULT_ABOUT.profileImage)}
                  className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                  title="Restore default Donne photo"
                >
                  <span>↺ Reset to Default Photo</span>
                </button>
              </div>
              <ImageInputWithPaste
                value={about.profileImage}
                onChange={(newUrl) => updateField('profileImage', newUrl)}
                placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
                maxWidth={900}
                maxHeight={900}
                helpText="💡 Tip: You can paste a screenshot or photo directly with Ctrl+V. Erase to show clean logo."
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Story Heading</label>
              <button
                type="button"
                onClick={() => resetField('profileHeading', DEFAULT_ABOUT.profileHeading)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default story heading"
              >
                <span>↺ Reset to Default</span>
              </button>
            </div>
            <input
              type="text"
              value={about.profileHeading}
              onChange={(e) => updateField('profileHeading', e.target.value)}
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
              onChange={(e) => updateField('profileStory', e.target.value)}
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#683846] uppercase">Pillar 1 Title</label>
                <button
                  type="button"
                  onClick={() => resetField('pillar1Title', DEFAULT_ABOUT.pillar1Title)}
                  className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer"
                >
                  <span>↺ Reset</span>
                </button>
              </div>
              <input
                type="text"
                value={about.pillar1Title}
                onChange={(e) => updateField('pillar1Title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] font-bold focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
              <label className="block text-xs font-bold text-[#332D2F] uppercase mt-2">
                Pillar 1 Description
              </label>
              <textarea
                rows={3}
                value={about.pillar1Text}
                onChange={(e) => updateField('pillar1Text', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>

            {/* Pillar 2 */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#F8EDEF]/30 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#683846] uppercase">Pillar 2 Title</label>
                <button
                  type="button"
                  onClick={() => resetField('pillar2Title', DEFAULT_ABOUT.pillar2Title)}
                  className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer"
                >
                  <span>↺ Reset</span>
                </button>
              </div>
              <input
                type="text"
                value={about.pillar2Title}
                onChange={(e) => updateField('pillar2Title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] font-bold focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
              <label className="block text-xs font-bold text-[#332D2F] uppercase mt-2">
                Pillar 2 Description
              </label>
              <textarea
                rows={3}
                value={about.pillar2Text}
                onChange={(e) => updateField('pillar2Text', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Privacy & Family Note */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <h2 className="font-serif text-xl font-bold text-[#683846]">
                4. Family Privacy &amp; Standards Note
              </h2>
            </div>
            <button
              type="button"
              onClick={() => resetField('privacyNote', DEFAULT_ABOUT.privacyNote)}
              className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
              title="Restore original default note"
            >
              <span>↺ Reset to Default Note</span>
            </button>
          </div>
          <div>
            <textarea
              rows={3}
              value={about.privacyNote}
              onChange={(e) => updateField('privacyNote', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              placeholder="Describe how you balance sharing adventures while protecting your children's privacy (leave blank to hide)..."
            />
            <p className="text-[10px] text-[#332D2F]/60 mt-1">
              💡 Tip: If you erase all text and click <strong>"Save Changes"</strong>, this note and its pink box are completely hidden on the /about page. Click <strong>"↺ Reset to Default Note"</strong> to restore the original wording.
            </p>
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
