'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInitialHomepage, getInitialAbout, DEFAULT_HOMEPAGE, HomepageContent, STORAGE_KEYS } from '../data/store';

export default function DonneSection() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [imgSrc, setImgSrc] = useState<string>('');

  const loadLatest = async () => {
    const localHp = getInitialHomepage();
    const localAbout = getInitialAbout();
    
    // Resolve Donne's image from Homepage store, with fallback to About page profileImage
    const resolvedImage = localHp.donneImage || localAbout.profileImage || DEFAULT_HOMEPAGE.donneImage;
    setContent(localHp);
    setImgSrc(resolvedImage);

    // 1. Query live Firestore first (cross-device cloud sync)
    let firestoreLoaded = false;
    try {
      const { fetchHomepageFromFirestore } = await import('../utils/firestoreSettings');
      const fsData = await fetchHomepageFromFirestore();
      if (fsData && typeof fsData === 'object' && Object.keys(fsData).length > 0) {
        firestoreLoaded = true;
        setContent((prev) => {
          if (prev.updatedAt && fsData.updatedAt && prev.updatedAt > fsData.updatedAt) {
            return prev;
          }
          const merged = { ...DEFAULT_HOMEPAGE, ...prev, ...fsData };
          if (fsData.donneImage) {
            setImgSrc(fsData.donneImage);
          }
          try {
            localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
        return;
      }
    } catch (_) {}

    // 2. Fetch fresh homepage data from server or static json without destructive overwriting only if Firestore didn't load
    if (!firestoreLoaded) {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const endpoint = isLocal ? `/api/homepage/?t=${Date.now()}` : `/data/homepage.json?t=${Date.now()}`;
      fetch(endpoint, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data === 'object') {
            setContent((prev) => {
              const merged = { ...data, ...prev };
              const effectiveImage = merged.donneImage || resolvedImage;
              if (effectiveImage) {
                setImgSrc(effectiveImage);
              }
              return merged;
            });
          }
        })
        .catch(() => {});
    }
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
              {(content.donneImage !== undefined && content.donneImage.trim() === '') ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#F8EDEF] to-[#F3E2E6] flex items-center justify-center p-8">
                  <img
                    src="/images/mama-logo.png"
                    alt="MummaBee logo"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain opacity-85"
                  />
                </div>
              ) : (
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
              )}
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

            {/* Only render headline if user hasn't explicitly cleared it */}
            {(content.donneHeadline !== undefined ? content.donneHeadline.trim() : DEFAULT_HOMEPAGE.donneHeadline) ? (
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#683846]">
                {content.donneHeadline !== undefined ? content.donneHeadline : DEFAULT_HOMEPAGE.donneHeadline}
              </h2>
            ) : null}

            {/* Only render description if user hasn't explicitly cleared it */}
            {(content.donneDescription !== undefined ? content.donneDescription.trim() : DEFAULT_HOMEPAGE.donneDescription) ? (
              <p className="font-sans text-sm sm:text-base text-[#332D2F] leading-relaxed max-w-xl">
                {content.donneDescription !== undefined ? content.donneDescription : DEFAULT_HOMEPAGE.donneDescription}
              </p>
            ) : null}

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
