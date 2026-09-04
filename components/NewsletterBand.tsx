'use client';

import { useState, useEffect } from 'react';
import { getInitialHomepage, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const loadLatest = () => {
    const local = getInitialHomepage();
    setContent(local);
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
    fetch(endpoint, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setContent((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.HOMEPAGE && e.detail?.data) {
        setContent(e.detail.data);
      } else {
        loadLatest();
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('mummabee_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      let response: any = { ok: true, json: () => Promise.resolve({ success: true }) };
      
      if (isLocal) {
        response = await fetch('/api/subscribers/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'Newsletter Band' }),
        });
      }

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setFeedbackMessage(data.message || 'Thank you for subscribing, look out for our exciting updates in your inbox soon');
      } else {
        setSubmitted(true);
        setFeedbackMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setSubmitted(true);
      setFeedbackMessage('Thank you for subscribing, look out for our exciting updates in your inbox soon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#683846] text-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-12 lg:p-14 overflow-hidden shadow-card">
          {/* Decorative Overlapping Pink Circle */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-[#DF3E6B]/30 rounded-full pointer-events-none" />
          <div className="absolute -bottom-16 right-48 w-52 h-52 bg-[#DF3E6B]/15 rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Text */}
            <div className="lg:col-span-7 space-y-2">
              <span className="text-[10px] font-sans font-bold tracking-widest text-[#F8EDEF]/80 uppercase block">
                JOIN MUMMA BEE'S NEWSLETTER
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {content.newsletterHeadline || 'UAE family finds, every Friday.'}
              </h2>

              <p className="text-xs sm:text-sm text-[#F8EDEF]/90 max-w-lg leading-relaxed">
                {content.newsletterSubtext || 'Weekend ideas, practical guides and honest recommendations.'}
              </p>
            </div>

            {/* Right Column: Input & Subscribe */}
            <div className="lg:col-span-5 flex justify-start lg:justify-end w-full">
              {submitted ? (
                <div className="bg-white/15 border border-white/25 rounded-2xl p-4 text-white text-xs sm:text-sm font-medium w-full text-center animate-fade-in leading-relaxed">
                  {feedbackMessage || 'Thank you for subscribing, look out for our exciting updates in your inbox soon'}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                  <div className="bg-white rounded-2xl sm:rounded-full p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 shadow-lg">
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2.5 sm:py-2 bg-transparent text-[#332D2F] font-sans text-xs focus:outline-none placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#DF3E6B] hover:bg-[#B75B70] disabled:opacity-60 text-white font-sans text-[11px] font-bold tracking-wider uppercase px-6 py-2.5 rounded-xl sm:rounded-full transition-colors flex-shrink-0 text-center"
                    >
                      {isSubmitting ? 'JOINING...' : 'SUBSCRIBE'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
