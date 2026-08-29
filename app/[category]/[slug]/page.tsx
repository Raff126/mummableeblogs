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
  const articles = getAllArticles().filter((a) => a.slug && a.category);
  const params: { category: string; slug: string }[] = [];
  const seen = new Set<string>();

  articles.forEach((article) => {
    const key = `${article.category}/${article.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      params.push({ category: article.category, slug: article.slug });
    }

    if (article.category === 'the-expat-edit') {
      const expatKey = `expat-edit/${article.slug}`;
      if (!seen.has(expatKey)) {
        seen.add(expatKey);
        params.push({ category: 'expat-edit', slug: article.slug });
      }
    } else if (article.category === 'expat-edit') {
      const theExpatKey = `the-expat-edit/${article.slug}`;
      if (!seen.has(theExpatKey)) {
        seen.add(theExpatKey);
        params.push({ category: 'the-expat-edit', slug: article.slug });
      }
    }
  });

  return params;
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
