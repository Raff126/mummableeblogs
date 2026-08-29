import type { Metadata } from 'next';
import WorkWithUsView from './WorkWithUsView';

export const metadata: Metadata = {
  title: "Work With Us — Brand Partnerships & Collaborations",
  description: "Partner with MummaBeeBlog. Authentic destination reviews, integrated family campaigns, and seasonal guides reaching engaged UAE parents across Dubai and Abu Dhabi.",
  alternates: {
    canonical: 'https://mummabeeblog.com/work-with-us',
  },
  openGraph: {
    title: "Work With Us — Brand Partnerships & Collaborations | MummaBeeBlog",
    description: "Partner with MummaBeeBlog. Authentic destination reviews, integrated family campaigns, and seasonal guides reaching engaged UAE parents across Dubai and Abu Dhabi.",
    url: 'https://mummabeeblog.com/work-with-us',
    siteName: 'MummaBeeBlog',
    images: [
      {
        url: 'https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
        width: 1200,
        height: 630,
        alt: 'Work With Us - MummaBeeBlog Partnerships',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Work With Us — Partnerships & Media | MummaBeeBlog",
    description: "Partner with MummaBeeBlog. Authentic destination reviews, integrated family campaigns, and seasonal guides reaching engaged UAE parents.",
    images: ['https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
  },
};

export default function WorkWithUsPage() {
  return <WorkWithUsView />;
}

