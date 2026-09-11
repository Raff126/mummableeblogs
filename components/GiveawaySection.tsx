'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GiveawayCampaign,
  DEFAULT_GIVEAWAY,
  getInitialGiveaway,
  addGiveawayEntry,
  STORAGE_KEYS,
} from '../data/store';

interface GiveawaySectionProps {
  placement?: 'homepage' | 'standalone';
}

export default function GiveawaySection({ placement = 'homepage' }: GiveawaySectionProps) {
  const [campaign, setCampaign] = useState<GiveawayCampaign>(DEFAULT_GIVEAWAY);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [optInNewsletter, setOptInNewsletter] = useState(true);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    const initial = getInitialGiveaway();
    setCampaign(initial);

    // Sync from live Firestore in background
    import('../utils/firestoreSettings')
      .then(({ fetchGiveawayFromFirestore }) => fetchGiveawayFromFirestore())
      .then((fsCampaign) => {
        if (fsCampaign && typeof fsCampaign === 'object') {
          setCampaign(fsCampaign);
          try {
            localStorage.setItem(STORAGE_KEYS.GIVEAWAY, JSON.stringify(fsCampaign));
          } catch (_) {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: any) => {
      if (e?.detail) setCampaign(e.detail);
    };
    window.addEventListener('mummabee_giveaway_updated', handleUpdate);
    return () => window.removeEventListener('mummabee_giveaway_updated', handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!socialHandle.trim()) {
      setErrorMessage('Please enter your social media handle (e.g. @yourinstagram).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the giveaway terms and privacy notice to enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      addGiveawayEntry({
        giveawayId: campaign.id || 'giveaway-current',
        fullName: fullName.trim(),
        socialHandle: socialHandle.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        agreeTerms,
        optInNewsletter,
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If inactive on homepage, gracefully hide
  if (mounted && !campaign.isActive && placement === 'homepage') {
    return null;
  }

  return (
    <section
      id="giveaway"
      className={`relative w-full overflow-hidden ${
        placement === 'homepage'
          ? 'py-16 md:py-24 bg-gradient-to-b from-[#FAF7F7] via-white to-[#FAF7F7]'
          : 'py-10 md:py-16 bg-white'
      } font-sans`}
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-[#F8EDEF]/40 to-transparent pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. HERO HEADER (Matching Wireframe) */}
        <div className="text-center space-y-3">
          <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#B75B70] bg-[#F8EDEF] px-3.5 py-1 rounded-full border border-[#B75B70]/25">
            {campaign.badge || 'MUMMABEE GIVEAWAY'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#683846] tracking-tight">
            {campaign.title || 'Win a family day out in the UAE'}
          </h2>
          <p className="text-sm sm:text-base text-[#332D2F]/75 max-w-xl mx-auto font-sans leading-relaxed">
            {campaign.subtitle || 'Enter below for your chance to win. Full details and terms apply.'}
          </p>
        </div>

        {/* 2. PRIZE HIGHLIGHT CARD (Matching Wireframe 2-column Card) */}
        <div className="bg-white rounded-3xl border border-[#B75B70]/20 shadow-soft overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* Left: Giveaway Image Area */}
            <div className="md:col-span-5 bg-[#F8EDEF]/50 relative min-h-[260px] md:min-h-[300px] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#B75B70]/15">
              {campaign.prizeImage ? (
                <img
                  src={campaign.prizeImage}
                  alt={campaign.prizeTitle || 'Giveaway Prize'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/80 border border-[#B75B70]/20 flex items-center justify-center mx-auto text-2xl text-[#B75B70]">
                    🎁
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#683846]">
                    Your giveaway image here
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-[#B75B70] font-bold block">
                    CAMPAIGN VISUAL
                  </span>
                </div>
              )}
            </div>

            {/* Right: Prize Details */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-bold text-[#683846]">
                  {campaign.prizeTitle || 'The prize'}
                </h3>
                <p className="text-sm text-[#332D2F]/80 leading-relaxed font-sans">
                  {campaign.prizeDescription ||
                    'A family experience to enjoy together. One winner will be selected after the giveaway closes.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#B75B70]/15 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B75B70] block">
                  ENTRIES CLOSE
                </span>
                <div className="font-serif text-lg font-bold text-[#683846]">
                  {campaign.entriesCloseText || 'Sunday 11:59 PM'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. HOW TO ENTER (Matching Wireframe 01 - 02 - 03 Stepper) */}
        <div className="text-center space-y-6 pt-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
            How to enter
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {/* Step 01 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#B75B70] leading-none">
                01
              </span>
              <p className="text-xs sm:text-sm text-[#332D2F]/80 font-medium leading-snug">
                {campaign.step1Text || 'Fill in the form below'}
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#B75B70] leading-none">
                02
              </span>
              <p className="text-xs sm:text-sm text-[#332D2F]/80 font-medium leading-snug">
                {campaign.step2Text || 'Follow the giveaway details'}
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#B75B70] leading-none">
                03
              </span>
              <p className="text-xs sm:text-sm text-[#332D2F]/80 font-medium leading-snug">
                {campaign.step3Text || 'Wait for winner announcement'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. ENTRY FORM CARD OR CONFIRMATION (Matching Wireframe) */}
        <div className="bg-white rounded-3xl border border-[#B75B70]/20 p-6 sm:p-10 shadow-soft max-w-2xl mx-auto">
          {isSubmitted ? (
            /* Thank You / Submission Confirmation State */
            <div className="text-center space-y-5 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                ✨
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                  {campaign.thankYouHeading || 'Thank you for entering!'}
                </h4>
                <p className="text-xs sm:text-sm text-[#332D2F]/80 max-w-md mx-auto leading-relaxed">
                  {campaign.thankYouMessage ||
                    "We've received your entry. Best of luck! The winner will be contacted directly via email and announced on our Instagram."}
                </p>
              </div>

              {campaign.relatedGuideUrl && (
                <div className="pt-4">
                  <Link
                    href={campaign.relatedGuideUrl}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:-translate-y-0.5"
                  >
                    <span>{campaign.relatedGuideLinkText || 'Explore UAE Family Guides'}</span>
                    <span>→</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Active Form State */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[#683846]">
                  Enter the giveaway
                </h4>
                <p className="text-xs text-[#332D2F]/70">
                  Please complete all required fields.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-2xl border border-red-200 flex items-center gap-2 animate-fade-in">
                  <span>⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B75B70] focus:ring-1 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] bg-white transition-all placeholder:text-stone-400"
                  />
                </div>

                {/* Social Media Handle */}
                <div>
                  <label className="block text-[10px] font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
                    SOCIAL MEDIA HANDLE *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @sarah_in_dubai"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B75B70] focus:ring-1 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] bg-white transition-all placeholder:text-stone-400"
                  />
                </div>

                {/* Email and Mobile Number (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B75B70] focus:ring-1 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] bg-white transition-all placeholder:text-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
                      MOBILE NUMBER <span className="text-stone-400 normal-case font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#B75B70] focus:ring-1 focus:ring-[#B75B70] text-xs font-medium text-[#332D2F] bg-white transition-all placeholder:text-stone-400"
                    />
                  </div>
                </div>

                {/* Terms and Consent Checkboxes */}
                <div className="pt-2 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#332D2F]/85">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70] mt-0.5"
                    />
                    <span className="leading-snug">
                      {campaign.termsText ||
                        'I have read and agree to the giveaway terms and privacy notice.'}{' '}
                      {campaign.termsUrl && (
                        <Link
                          href={campaign.termsUrl}
                          target="_blank"
                          className="text-[#B75B70] underline hover:text-[#683846]"
                        >
                          View terms
                        </Link>
                      )}
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#332D2F]/75">
                    <input
                      type="checkbox"
                      checked={optInNewsletter}
                      onChange={(e) => setOptInNewsletter(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B75B70] focus:ring-[#B75B70] mt-0.5"
                    />
                    <span className="leading-snug">
                      Keep me updated with MummaBee&apos;s weekly UAE family newsletter with tested weekend finds and tips.
                    </span>
                  </label>
                </div>

                {/* Submit CTA Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#B75B70] hover:bg-[#683846] disabled:opacity-70 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting entry...</span>
                      </>
                    ) : (
                      <span>ENTER GIVEAWAY</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
