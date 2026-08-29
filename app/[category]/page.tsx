import type { Metadata } from 'next';
import { CATEGORIES } from '../../data/categories';
import CategoryView from './CategoryView';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryInfo = CATEGORIES[params.category];
  if (!categoryInfo) {
    return {
      title: 'Category | MummaBeeBlog',
      description: 'Explore tested UAE family guides across Dubai and Abu Dhabi.',
    };
  }

  const pageTitle = categoryInfo.seoTitle || categoryInfo.name;
  const pageDescription = categoryInfo.seoDescription || categoryInfo.heroIntro;
  const canonicalUrl = `https://mummabeeblog.com/${params.category}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MummaBeeBlog',
      images: [
        {
          url: 'https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg',
          width: 1200,
          height: 630,
          alt: categoryInfo.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ['https://mummabeeblog.com/images/358792494_661391199240576_3424351230899219709_n.jpg'],
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryView categorySlug={params.category} />;
}
