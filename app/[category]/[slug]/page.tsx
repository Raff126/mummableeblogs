import type { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '../../../data/articles';
import ArticleView from './ArticleView';

interface PageProps {
  params: {
    category: string;
    slug: string;
  };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) {
    return {
      title: 'Guide | MummaBeeBlog',
      description: 'Discover practical UAE family guides and honest recommendations.',
    };
  }

  const canonicalUrl = `https://mummabeeblog.com/${article.category}/${article.slug}`;
  const fullImageUrl = article.featuredImage.startsWith('http')
    ? article.featuredImage
    : `https://mummabeeblog.com${article.featuredImage}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${article.title} | MummaBeeBlog`,
      description: article.excerpt,
      url: canonicalUrl,
      type: 'article',
      publishedTime: article.publishedAt,
      siteName: 'MummaBeeBlog',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | MummaBeeBlog`,
      description: article.excerpt,
      images: [fullImageUrl],
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const initialArticle = getArticleBySlug(params.slug) || null;

  return (
    <ArticleView
      initialArticle={initialArticle}
      categorySlug={params.category}
      slug={params.slug}
    />
  );
}
