'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, getInitialAbout, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function DonneSection() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [imgSrc, setImgSrc] = useState<string>('');

  const loadLatest = () => {
    const localHp = getInitialHomepage();
    const localAbout = getInitialAbout();
    
    // Resolve Donne's image from Homepage store, with fallback to About page profileImage
    const resolvedImage = localHp.donneImage || localAbout.profileImage || DEFAULT_HOMEPAGE.donneImage;
    setContent(localHp);
    setImgSrc(resolvedImage);

    // Fetch fresh homepage data from server
    fetch(`/api/homepage?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          try { localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(data)); } catch (_) {}
          setContent((prev) => {
            const merged = { ...prev, ...data };
            if (data.donneImage) {
              setImgSrc(data.donneImage);
            }
            return merged;
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = (e: any) => {
      if (e.detail?.key === STORAGE_KEYS.HOMEPAGE && e.detail?.data) {
        setContent(e.detail.data);
        if (e.detail.data.donneImage) {
          setImgSrc(e.detail.data.donneImage);
        }
      } else if (e.detail?.key === STORAGE_KEYS.ABOUT && e.detail?.data?.profileImage) {
        setImgSrc((current) => current || e.detail.data.profileImage);
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

  return (
    <section className="py-16 sm:py-20 bg-[#F8EDEF] border-y border-[#B75B70]/15">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Circular Photo */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full p-2 bg-white shadow-soft border-2 border-[#B75B70]/20">
              <img
                key={imgSrc || 'default-donne-img'}
                src={imgSrc || content.donneImage || '/uploads/donne_about_us-1787911839557.jpg'}
                alt="Donne - the mum behind MummaBeeBlog"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('mama-logo.png')) {
                    target.src = '/images/mama-logo.png';
                  }
                }}
                className="w-full h-full object-cover rounded-full"
              />
              {/* Overlapping Badge */}
              <div className="absolute bottom-1 right-1 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-1 shadow-md flex items-center justify-center border border-gray-100">
                <img
                  src="/images/mama-logo.png"
                  alt="MummaBee logo badge"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-7 space-y-4 text-center md:text-left">
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#B75B70] uppercase block">
              THE MUM BEHIND THE GUIDES
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
              {content.donneHeadline || "Hi, I'm Donne."}
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#332D2F] leading-relaxed max-w-xl">
              {content.donneDescription || "I'm a South African mum living in the UAE with my husband and two daughters. MummaBeeBlog is where I share real, tested family guides — from weekend days out in Dubai to road trips across the Emirates, honest dining reviews, and the everyday adventures of raising kids in the desert."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                href="/about"
                className="bg-[#683846] hover:bg-[#522b37] text-white text-xs font-bold tracking-wider uppercase px-7 py-3 rounded-full shadow-soft transition-all"
              >
                OUR STORY
              </Link>
              <a
                href="https://www.instagram.com/mummabeeblog/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold tracking-wider text-[#683846] hover:text-[#B75B70] uppercase transition-colors inline-flex items-center gap-1"
              >
                <span>FOLLOW ON INSTAGRAM</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
