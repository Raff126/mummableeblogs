'use client';

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

export default function HomePageView() {
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
