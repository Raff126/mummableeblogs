import type { Metadata } from 'next';
import ComingSoon from '../../components/ComingSoon';

export const metadata: Metadata = {
  title: 'MummaBeeBlog — Coming Soon',
  description: "We're currently working behind the scenes to give MummaBeeBlog a fresh new home. Sign up to be the first to know when we launch.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
