'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getInitialHomepage, saveHomepage, HomepageContent, DEFAULT_HOMEPAGE } from '../../../data/store';
import ImageInputWithPaste from '../../../components/admin/ImageInputWithPaste';

export default function AdminHomepageEditPage() {
  const [hp, setHp] = useState<HomepageContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState('');
  const isUserEditing = useRef(false);

  useEffect(() => {
    const local = getInitialHomepage();
    setHp(local);

    const loadRemote = async () => {
      // 1. Try Firestore first
      try {
        const { fetchHomepageFromFirestore } = await import('../../../utils/firestoreSettings');
        const fsData = await fetchHomepageFromFirestore();
        if (fsData && typeof fsData === 'object' && Object.keys(fsData).length > 0) {
          // If the user is currently typing in the form, NEVER overwrite their active edits!
          if (isUserEditing.current) return;

          setHp((prev) => {
            if (!prev) return fsData;
            if (prev.updatedAt && fsData.updatedAt && prev.updatedAt > fsData.updatedAt) {
              return prev;
            }
            return { ...prev, ...fsData };
          });
          return;
        }
      } catch (_) {}

      // 2. Fallback to API / static JSON
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
      try {
        const res = await fetch(endpoint, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !isUserEditing.current) {
            setHp((prev) => {
              if (!prev) return data;
              return { ...data, ...prev };
            });
          }
        }
      } catch (_) {}
    };

    loadRemote();
  }, []);

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        performSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hp]);

  if (!hp) return null;

  const performSave = async () => {
    if (!hp || isSaving) return;
    setIsSaving(true);
    try {
      await saveHomepage(hp);
      isUserEditing.current = false;
      setHasUnsavedChanges(false);
      setMessage('Homepage content saved successfully! Changes are live on https://mummabeeblog.com and all devices.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error('Save homepage error:', err);
      setMessage('⚠️ Error saving to cloud. Saved locally.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSave();
  };

  const updateField = (field: keyof HomepageContent, value: string) => {
    isUserEditing.current = true;
    setHasUnsavedChanges(true);
    setHp((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const resetField = (field: keyof HomepageContent, defaultVal: string) => {
    updateField(field, defaultVal);
  };

  return (
    <div className="space-y-6 max-w-4xl font-sans pb-16">
      {/* Top Header Bar with Instant Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-[#683846]">Homepage Editor</h1>
            {hasUnsavedChanges && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
                ⚠️ Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
            Edit words, titles, proof stats, and images. Changes go live immediately on save. (Press Ctrl+S to save)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={performSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-[#B75B70] hover:bg-[#683846] text-white ring-2 ring-[#B75B70]/30'
                : 'bg-[#683846] hover:bg-[#522b37] text-white'
            }`}
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
          
          <Link
            href="/"
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
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0"
          >
            {isSaving ? 'Saving...' : 'Publish Now →'}
          </button>
        </div>
      )}

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
              onChange={(e) => updateField('heroEyebrow', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Main Headline</label>
              <button
                type="button"
                onClick={() => resetField('heroHeadline', DEFAULT_HOMEPAGE.heroHeadline)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default wording"
              >
                <span>↺ Reset to Default</span>
              </button>
            </div>
            <input
              type="text"
              value={hp.heroHeadline ?? ''}
              onChange={(e) => updateField('heroHeadline', e.target.value)}
              placeholder='Default: "Your guide to family life in the UAE."'
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-serif font-bold text-base text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Description Copy</label>
            <textarea
              rows={3}
              value={hp.heroDescription}
              onChange={(e) => updateField('heroDescription', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Hero Main Photo</label>
              <button
                type="button"
                onClick={() => resetField('heroImage', DEFAULT_HOMEPAGE.heroImage)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default family photo"
              >
                <span>↺ Reset to Default Photo</span>
              </button>
            </div>
            <ImageInputWithPaste
              value={hp.heroImage}
              onChange={(newUrl) => updateField('heroImage', newUrl)}
              placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
              maxWidth={1000}
              maxHeight={1000}
              helpText="💡 Tip: Paste an image directly with Ctrl+V, drag & drop, or browse your files. Erase to show clean logo frame."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Primary Button Text</label>
              <input
                type="text"
                value={hp.heroPrimaryCtaText}
                onChange={(e) => updateField('heroPrimaryCtaText', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Primary Button Link</label>
              <input
                type="text"
                value={hp.heroPrimaryCtaUrl}
                onChange={(e) => updateField('heroPrimaryCtaUrl', e.target.value)}
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
                onChange={(e) => updateField('heroSecondaryCtaText', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Secondary Button Link</label>
              <input
                type="text"
                value={hp.heroSecondaryCtaUrl}
                onChange={(e) => updateField('heroSecondaryCtaUrl', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Hero 3-Proof Stats Strip */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-xs font-bold text-[#683846] uppercase mb-3 tracking-wider">
              Hero Proof Stats (3 Columns Strip)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#332D2F]/70">Stat 1 (e.g. 100+)</label>
                <input
                  type="text"
                  value={hp.heroStat1Number ?? '100+'}
                  onChange={(e) => updateField('heroStat1Number', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] font-bold"
                />
                <input
                  type="text"
                  value={hp.heroStat1Label ?? 'TESTED GUIDES'}
                  onChange={(e) => updateField('heroStat1Label', e.target.value)}
                  placeholder="Label"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] text-[#332D2F]/80 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#332D2F]/70">Stat 2 (e.g. 2 Cities)</label>
                <input
                  type="text"
                  value={hp.heroStat2Number ?? '2 Cities'}
                  onChange={(e) => updateField('heroStat2Number', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] font-bold"
                />
                <input
                  type="text"
                  value={hp.heroStat2Label ?? 'DUBAI & ABU DHABI'}
                  onChange={(e) => updateField('heroStat2Label', e.target.value)}
                  placeholder="Label"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] text-[#332D2F]/80 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#332D2F]/70">Stat 3 (e.g. 100%)</label>
                <input
                  type="text"
                  value={hp.heroStat3Number ?? '100%'}
                  onChange={(e) => updateField('heroStat3Number', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] font-bold"
                />
                <input
                  type="text"
                  value={hp.heroStat3Label ?? 'HONEST REVIEWS'}
                  onChange={(e) => updateField('heroStat3Label', e.target.value)}
                  placeholder="Label"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] text-[#332D2F]/80 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Section ("What are you looking for?") */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            2. Quick Discovery Cards ("What are you looking for?")
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Eyebrow Badge</label>
              <input
                type="text"
                value={hp.discoveryEyebrow ?? 'START EXPLORING'}
                onChange={(e) => updateField('discoveryEyebrow', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Main Heading</label>
              <input
                type="text"
                value={hp.discoveryHeadline ?? 'What are you looking for?'}
                onChange={(e) => updateField('discoveryHeadline', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-[#683846] uppercase mb-1">Card 1: UAE With Kids Description</label>
              <input
                type="text"
                value={hp.discoveryCard1Desc ?? 'Activities, attractions and family days out'}
                onChange={(e) => updateField('discoveryCard1Desc', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#683846] uppercase mb-1">Card 2: Food & Dining Description</label>
              <input
                type="text"
                value={hp.discoveryCard2Desc ?? 'Family-friendly places worth trying'}
                onChange={(e) => updateField('discoveryCard2Desc', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#683846] uppercase mb-1">Card 3: Family Travel Description</label>
              <input
                type="text"
                value={hp.discoveryCard3Desc ?? 'Tips, stays and practical itineraries'}
                onChange={(e) => updateField('discoveryCard3Desc', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#683846] uppercase mb-1">Card 4: Family Life Description</label>
              <input
                type="text"
                value={hp.discoveryCard4Desc ?? 'School, motherhood and growing together'}
                onChange={(e) => updateField('discoveryCard4Desc', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
              />
            </div>
          </div>
        </div>

        {/* Credibility Section Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            3. Credibility & Proof Statement Section
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Top Eyebrow Badge</label>
            <input
              type="text"
              value={hp.credibilityBadge ?? 'AUTHENTIC UAE RECOMMENDATIONS'}
              onChange={(e) => updateField('credibilityBadge', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Main Heading</label>
            <input
              type="text"
              value={hp.credibilityHeadline ?? 'Real experiences from a UAE family living between Dubai and Abu Dhabi.'}
              onChange={(e) => updateField('credibilityHeadline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-serif font-bold text-sm text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Description Paragraph</label>
            <textarea
              rows={3}
              value={hp.credibilityDescription ?? 'Every guide is built on authentic parent perspective, practical timing advice, and genuine recommendations designed to help busy families make the most of life in the Emirates.'}
              onChange={(e) => updateField('credibilityDescription', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* The Expat Edit Section Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            4. The Expat Edit Section Header
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Eyebrow Badge</label>
              <input
                type="text"
                value={hp.expatEyebrow ?? 'CURATED ESSENTIALS FOR UAE FAMILIES'}
                onChange={(e) => updateField('expatEyebrow', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Heading</label>
              <input
                type="text"
                value={hp.expatHeadline ?? 'The Expat Edit'}
                onChange={(e) => updateField('expatHeadline', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 font-serif font-bold text-sm text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Subtitle / Supporting Description</label>
            <input
              type="text"
              value={hp.expatDescription ?? 'Practical guides, school choices & community wisdom for raising kids in the Emirates'}
              onChange={(e) => updateField('expatDescription', e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* Explore by Topic or Location Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            5. Explore by Topic or Location Header
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Eyebrow Badge</label>
              <input
                type="text"
                value={hp.exploreEyebrow ?? 'DISCOVER GUIDES'}
                onChange={(e) => updateField('exploreEyebrow', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Heading</label>
              <input
                type="text"
                value={hp.exploreHeadline ?? 'Explore by Topic or Location'}
                onChange={(e) => updateField('exploreHeadline', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 font-serif font-bold text-sm text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Donne Section Card */}
        <div id="donne" className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4 scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-2">
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              6. Donne Introduction ("The Mum Behind The Guides")
            </h2>
            <Link
              href="/admin/about"
              className="text-xs font-bold text-[#B75B70] hover:text-[#683846] underline flex items-center gap-1"
            >
              <span>Edit Full /about Story Page →</span>
            </Link>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Headline</label>
              <button
                type="button"
                onClick={() => resetField('donneHeadline', DEFAULT_HOMEPAGE.donneHeadline)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default wording: Hi, I'm Donne."
              >
                <span>↺ Reset to Default ("Hi, I'm Donne.")</span>
              </button>
            </div>
            <input
              type="text"
              value={hp.donneHeadline ?? ''}
              onChange={(e) => updateField('donneHeadline', e.target.value)}
              placeholder='Default: "Hi, I&#39;m Donne." (or leave blank to hide)'
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
            <p className="text-[10px] text-[#332D2F]/60 mt-1">
              💡 Tip: If you leave this blank and click "Save", the headline is hidden. Click <strong>"↺ Reset"</strong> to restore the original text.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Bio Description</label>
            <textarea
              rows={3}
              value={hp.donneDescription}
              onChange={(e) => updateField('donneDescription', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] leading-relaxed focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#332D2F] uppercase">Donne Profile Photo (Circular on Homepage)</label>
              <button
                type="button"
                onClick={() => resetField('donneImage', DEFAULT_HOMEPAGE.donneImage)}
                className="text-[10px] font-bold text-[#B75B70] hover:text-[#683846] hover:underline cursor-pointer flex items-center gap-1"
                title="Restore default Donne photo"
              >
                <span>↺ Reset to Default Photo</span>
              </button>
            </div>
            <ImageInputWithPaste
              value={hp.donneImage}
              onChange={(newUrl) => updateField('donneImage', newUrl)}
              placeholder="Paste image URL, upload photo, or press Ctrl+V to paste copied image"
              maxWidth={800}
              maxHeight={800}
              helpText="💡 Tip: You can paste a screenshot or photo directly with Ctrl+V. Erase to show clean circular logo."
            />
          </div>
        </div>

        {/* Newsletter Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-2">
            7. Newsletter Band
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Heading</label>
            <input
              type="text"
              value={hp.newsletterHeadline}
              onChange={(e) => updateField('newsletterHeadline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-serif font-bold text-[#683846] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Supporting Copy</label>
            <input
              type="text"
              value={hp.newsletterSubtext}
              onChange={(e) => updateField('newsletterSubtext', e.target.value)}
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
