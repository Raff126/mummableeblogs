import type { Metadata } from 'next';
import Link from 'next/link';
import GiveawaySection from '../../components/GiveawaySection';
import NewsletterBand from '../../components/NewsletterBand';

export const metadata: Metadata = {
  title: 'Win a Family Day Out in the UAE — MummaBee Giveaway',
  description: 'Enter our exclusive MummaBee family giveaway for your chance to win tested experiences, family tickets, and days out across Dubai and Abu Dhabi.',
  alternates: {
    canonical: 'https://www.mummabeeblog.com/giveaway',
  },
  openGraph: {
    title: 'Win a Family Day Out in the UAE — MummaBee Giveaway',
    description: 'Enter our exclusive MummaBee family giveaway for your chance to win tested experiences, family tickets, and days out across Dubai and Abu Dhabi.',
    url: 'https://www.mummabeeblog.com/giveaway',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'MummaBee Giveaway',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Win a Family Day Out in the UAE — MummaBee Giveaway',
    description: 'Enter our exclusive MummaBee family giveaway for your chance to win tested experiences, family tickets, and days out across Dubai and Abu Dhabi.',
    images: ['https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

export default function GiveawayPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-[#FAF7F7] border-b border-[#B75B70]/10 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#332D2F]/70 font-sans">
          <Link href="/" className="hover:text-[#B75B70] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#683846] font-semibold">Giveaway</span>
        </div>
      </div>

      {/* Main Giveaway Campaign Layout */}
      <GiveawaySection placement="standalone" />

      {/* Footer Newsletter */}
      <NewsletterBand />
    </main>
  );
}
