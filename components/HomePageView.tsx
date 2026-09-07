'use client';

import { useState, useEffect } from 'react';
import ComingSoon from './ComingSoon';
import HeroSection from './HeroSection';
import DiscoverySection from './DiscoverySection';
import FeaturedGuidesSection from './FeaturedGuidesSection';
import RecentBlogsSection from './RecentBlogsSection';
import ExploreByTopicLocation from './ExploreByTopicLocation';
import DonneSection from './DonneSection';
import ExpatEditSection from './ExpatEditSection';
import CredibilitySection from './CredibilitySection';
import InstagramSection from './InstagramSection';
import DiscountCodesSection from './DiscountCodesSection';
import NewsletterBand from './NewsletterBand';
import { getInitialSettings, STORAGE_KEYS } from '../data/store';

interface HomePageViewProps {
  initialComingSoon?: boolean;
}

export default function HomePageView({ initialComingSoon = true }: HomePageViewProps) {
  const [isComingSoon, setIsComingSoon] = useState<boolean>(initialComingSoon);

  useEffect(() => {
    // Check local settings
    const settings = getInitialSettings();
    if (typeof settings.comingSoonMode === 'boolean') {
      setIsComingSoon(settings.comingSoonMode);
    }

    // Listen to live settings updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === STORAGE_KEYS.SETTINGS) {
        setIsComingSoon(customEvent.detail?.data?.comingSoonMode !== false);
      }
    };

    window.addEventListener('mummabee_content_updated', handleUpdate);
    return () => window.removeEventListener('mummabee_content_updated', handleUpdate);
  }, []);

  if (isComingSoon) {
    return <ComingSoon />;
  }

  return (
    <>
      {/* 1. SEARCH-FRIENDLY HERO */}
      <HeroSection />

      {/* 2. QUICK LINKS */}
      <DiscoverySection />

      {/* 3. FEATURED UAE FAMILY GUIDES */}
      <FeaturedGuidesSection />

      {/* 4. RECENT BLOGS */}
      <RecentBlogsSection />

      {/* 5. EXPLORE BY TOPIC OR LOCATION */}
      <ExploreByTopicLocation />

      {/* 6. INTRODUCTION TO MUMMA BEE */}
      <DonneSection />

      {/* 7. THE EXPAT EDIT */}
      <ExpatEditSection />

      {/* 8. REAL PARTNERSHIP OR READER PROOF */}
      <CredibilitySection />

      {/* 9. INSTAGRAM MOMENTS */}
      <InstagramSection />

      {/* 10. DISCOUNT CODES & EXCLUSIVE DEALS */}
      <DiscountCodesSection placement="homepage" />

      {/* 11. NEWSLETTER */}
      <NewsletterBand />
    </>
  );
}
