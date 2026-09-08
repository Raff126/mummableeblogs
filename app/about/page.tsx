import type { Metadata } from 'next';
import AboutView from './AboutView';
import { getAllArticles } from '../../data/articles';

export const metadata: Metadata = {
  title: "About Donne — The Mum Behind MummaBeeBlog",
  description: "Meet Donne, the mum behind MummaBeeBlog — raising two girls between Dubai and Abu Dhabi and sharing honest reviews, tested itineraries, and the everyday adventures of UAE family life.",
  alternates: {
    canonical: 'https://www.mummabeeblog.com/about',
  },
  openGraph: {
    title: "About Donne — The Mum Behind MummaBeeBlog",
    description: "Meet Donne, the mum behind MummaBeeBlog — raising two girls between Dubai and Abu Dhabi and sharing honest reviews, tested itineraries, and the everyday adventures of UAE family life.",
    url: 'https://www.mummabeeblog.com/about',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'Donne - MummaBeeBlog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Donne — The Mum Behind MummaBeeBlog",
    description: "Meet Donne, the mum behind MummaBeeBlog — raising two girls between Dubai and Abu Dhabi and sharing honest reviews, tested itineraries, and the everyday adventures of UAE family life.",
    images: ['https://www.mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

export default function AboutPage() {
  const topGuides = getAllArticles().filter((a) => !a.isDraft && a.status !== 'draft').slice(0, 4);

  return <AboutView topGuides={topGuides} />;
}
