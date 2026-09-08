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

import HomePageView from '../components/HomePageView';

export default function HomePage() {
  return <HomePageView />;
}
