'use client';

import { useState, useEffect } from 'react';
import NewsletterBand from '../../components/NewsletterBand';
import { getInitialWorkWithUs, DEFAULT_WORK_WITH_US, WorkWithUsPageContent } from '../../data/store';

export default function WorkWithUsView() {
  const [content, setContent] = useState<WorkWithUsPageContent>(DEFAULT_WORK_WITH_US);

  useEffect(() => {
    setContent(getInitialWorkWithUs());
  }, []);

  const formats = [
    {
      title: content.format1Title,
      description: content.format1Desc,
      icon: '🗺️',
    },
    {
      title: content.format2Title,
      description: content.format2Desc,
      icon: '📱',
    },
    {
      title: content.format3Title,
      description: content.format3Desc,
      icon: '💌',
    },
    {
      title: content.format4Title,
      description: content.format4Desc,
      icon: '✨',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#F8EDEF] py-14 lg:py-20 border-b border-[#B75B70]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
            {content.eyebrow}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#683846] leading-tight whitespace-pre-line">
            {content.headline}
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#332D2F] max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {content.leadText}
          </p>
          <div className="pt-2">
            <a
              href={`mailto:${content.ctaEmail}?subject=Partnership%20Inquiry%20-%20MummaBeeBlog`}
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>🤝</span>
              <span>{content.ctaButtonText}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Audience Snapshot & Metrics */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              AUDIENCE SNAPSHOT
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#683846]">
              {content.audienceTitle}
            </h2>
            <p className="text-sm text-[#332D2F]/80 mt-2 leading-relaxed whitespace-pre-line">
              {content.audienceText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-[#F8EDEF]/50 p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#683846] block">
                {content.stats1Number}
              </span>
              <span className="text-xs font-semibold text-[#332D2F] uppercase tracking-wider block mt-1">
                {content.stats1Label}
              </span>
            </div>
            <div className="bg-[#F8EDEF]/50 p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#683846] block">
                {content.stats2Number}
              </span>
              <span className="text-xs font-semibold text-[#332D2F] uppercase tracking-wider block mt-1">
                {content.stats2Label}
              </span>
            </div>
            <div className="bg-[#F8EDEF]/50 p-6 rounded-3xl border border-[#B75B70]/15 shadow-soft">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#683846] block">
                {content.stats3Number}
              </span>
              <span className="text-xs font-semibold text-[#332D2F] uppercase tracking-wider block mt-1">
                {content.stats3Label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Formats */}
      <section className="py-20 bg-[#FEFAF9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block mb-1">
              COLLABORATION FORMATS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#683846]">
              How We Can Work Together
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formats.map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft space-y-3">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-serif text-xl font-bold text-[#683846]">{item.title}</h3>
                <p className="text-xs text-[#332D2F] leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit CTA Section */}
      <section className="py-20 bg-[#F8EDEF] border-t border-[#B75B70]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#683846]">
            Let's Create Something Memorable
          </h2>
          <p className="text-sm sm:text-base text-[#332D2F] max-w-xl mx-auto leading-relaxed whitespace-pre-line">
            {content.mediaKitNote}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={`mailto:${content.ctaEmail}?subject=Partnership%20Inquiry%20-%20MummaBeeBlog`}
              className="btn-primary"
            >
              Discuss a Partnership
            </a>
            <a
              href={`mailto:${content.ctaEmail}?subject=Media%20Kit%20Request%20-%20MummaBeeBlog`}
              className="px-6 py-3 rounded-full bg-white text-[#683846] font-bold text-xs hover:bg-[#F8EDEF] transition-colors border border-[#B75B70]/30 shadow-2xs"
            >
              Request Media Kit ↗
            </a>
          </div>
        </div>
      </section>

      <NewsletterBand />
    </>
  );
}
