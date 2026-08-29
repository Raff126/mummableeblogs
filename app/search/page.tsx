import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchClientView from './SearchClientView';

export const metadata: Metadata = {
  title: 'Search UAE Family Guides & Ideas | MummaBeeBlog',
  description: 'Search family-tested recommendations, staycations, weekend plans, and kid-friendly spots across Dubai, Abu Dhabi, and the UAE.',
  alternates: {
    canonical: 'https://mummabeeblog.com/search',
  },
  openGraph: {
    title: 'Search UAE Family Guides & Ideas | MummaBeeBlog',
    description: 'Search family-tested recommendations, staycations, weekend plans, and kid-friendly spots across Dubai, Abu Dhabi, and the UAE.',
    url: 'https://mummabeeblog.com/search',
    type: 'website',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'Search MummaBeeBlog UAE Family Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search UAE Family Guides & Ideas | MummaBeeBlog',
    description: 'Search family-tested recommendations, staycations, weekend plans, and kid-friendly spots across Dubai, Abu Dhabi, and the UAE.',
    images: ['https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCF9F9] py-20 px-4 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-[#B75B70] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-[#683846]">Loading UAE family guides...</p>
          </div>
        </div>
      }
    >
      <SearchClientView />
    </Suspense>
  );
}
