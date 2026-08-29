import type { Metadata } from 'next';
import HeroSection from '../components/HeroSection';
import DiscoverySection from '../components/DiscoverySection';
import FeaturedGuidesSection from '../components/FeaturedGuidesSection';
import RecentBlogsSection from '../components/RecentBlogsSection';
import ExploreByTopicLocation from '../components/ExploreByTopicLocation';
import DonneSection from '../components/DonneSection';
import ExpatEditSection from '../components/ExpatEditSection';
import CredibilitySection from '../components/CredibilitySection';
import InstagramSection from '../components/InstagramSection';
import DiscountCodesSection from '../components/DiscountCodesSection';
import NewsletterBand from '../components/NewsletterBand';

export const metadata: Metadata = {
  title: "MummaBeeBlog | UAE Family Guide — Dubai & Abu Dhabi Days Out, Dining & Travel",
  description: "Your honest guide to family life in the UAE. Tested weekend activities, child-friendly dining, resort staycations, and practical parenting advice across Dubai and Abu Dhabi.",
  alternates: {
    canonical: 'https://mummabeeblog.com',
  },
  openGraph: {
    title: 'MummaBeeBlog | UAE Family Guide — Dubai & Abu Dhabi Days Out, Dining & Travel',
    description: 'Your honest guide to family life in the UAE. Tested weekend activities, child-friendly dining, resort staycations, and practical parenting advice across Dubai and Abu Dhabi.',
    url: 'https://mummabeeblog.com',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'MummaBeeBlog - UAE Family Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MummaBeeBlog | UAE Family Guide — Dubai & Abu Dhabi Days Out, Dining & Travel',
    description: 'Your honest guide to family life in the UAE. Tested weekend activities, child-friendly dining, resort staycations, and practical parenting advice across Dubai and Abu Dhabi.',
    images: ['https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      {/* 1. SEARCH-FRIENDLY HERO — Clear UAE Family Promise */}
      <HeroSection />

      {/* 2. QUICK LINKS TO POPULAR AUDIENCE NEEDS — "What are you looking for?" */}
      <DiscoverySection />

      {/* 3. FEATURED UAE FAMILY GUIDES — "Plan your next family day" (Curated DUBAI, EAT, SCHOOL) */}
      <FeaturedGuidesSection />

      {/* 4. RECENT BLOGS — Newest Published Content (Initial 4 + Dynamic "Load More →") */}
      <RecentBlogsSection />

      {/* 5. EXPLORE BY TOPIC OR LOCATION — Topic & City Discovery */}
      <ExploreByTopicLocation />

      {/* 6. SHORT CREDIBILITY INTRODUCTION TO MUMMA BEE — "Hi, I'm Donne" */}
      <DonneSection />

      {/* 7. THE EXPAT EDIT — Curated Essentials for International UAE Families */}
      <ExpatEditSection />

      {/* 8. REAL PARTNERSHIP OR READER PROOF — Trust & Testing Standards */}
      <CredibilitySection />

      {/* 8. INSTAGRAM / RECENT MOMENTS — Community Visual Diary */}
      <InstagramSection />

      {/* 9. DISCOUNT CODES & EXCLUSIVE FAMILY DEALS */}
      <DiscountCodesSection placement="homepage" />

      {/* 10. NEWSLETTER — Clear Benefit-Led Friday Digest Invitation */}
      <NewsletterBand />
    </>
  );
}
