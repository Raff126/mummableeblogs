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
    canonical: 'https://www.mummabeeblog.com',
  },
  openGraph: {
    title: 'MummaBeeBlog | UAE Family Guide — Dubai & Abu Dhabi Days Out, Dining & Travel',
    description: 'Your honest guide to family life in the UAE. Tested weekend activities, child-friendly dining, resort staycations, and practical parenting advice across Dubai and Abu Dhabi.',
    url: 'https://www.mummabeeblog.com',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
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
    images: ['https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

import fs from 'fs';
import path from 'path';
import HomePageView from '../components/HomePageView';

function getInitialComingSoon(): boolean {
  // In development (localhost), show the full behind-the-scenes website so you can work on it!
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }
  try {
    const filePath = path.join(process.cwd(), 'data', 'settings.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (typeof data.comingSoonMode === 'boolean') {
        return data.comingSoonMode;
      }
    }
  } catch (_) {}
  return true; // Default to true in production as requested
}

export default function HomePage() {
  const isComingSoon = getInitialComingSoon();
  return <HomePageView initialComingSoon={isComingSoon} />;
}
