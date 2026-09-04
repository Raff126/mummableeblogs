import articlesData from './articles.json';

export interface ArticleQuickFacts {
  location?: string;
  bestFor?: string;
  timeNeeded?: string;
  budget?: string;
  indoorOutdoor?: string;
  parking?: string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  category: string;
  subcategory?: string;
  title: string;
  excerpt: string;
  answerSummary?: string;
  content: string;
  author: string;
  publishedAt: string;
  lastUpdated?: string;
  readTime: string;
  featuredImage: string;
  heroImage?: string;
  thumbnailImage?: string;
  imageAlt: string;
  imageCaption?: string;
  location?: string;
  ageGroup?: string;
  indoorOutdoor?: string;
  budget?: string;
  tags: string[];
  featured?: boolean;
  quickFacts?: ArticleQuickFacts;
  mummaBeeTip?: string;
  quickAnswer?: string;
  goodToKnow?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isDraft?: boolean;
  goodToKnowEnabled?: boolean;
  showGoodToKnow?: boolean;
}

export type Article = ArticleItem;

export const ARTICLES: ArticleItem[] = articlesData as unknown as ArticleItem[];

export function getAllArticles(): ArticleItem[] {
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const jsonPath = path.join(process.cwd(), 'data', 'articles.json');
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }
  return ARTICLES;
}

export function getArticleBySlug(slug: string): ArticleItem | undefined {
  if (!slug) return undefined;
  const all = getAllArticles();
  const normalized = slug.toLowerCase().trim();
  return (
    all.find((a) => a.slug?.toLowerCase() === normalized || a.id?.toLowerCase() === normalized) ||
    all.find((a) => a.slug?.toLowerCase().startsWith(normalized) || normalized.startsWith(a.slug?.toLowerCase()))
  );
}

export function getArticlesByCategory(categorySlug: string): ArticleItem[] {
  const all = getAllArticles();
  return all.filter((a) => a.category === categorySlug && !a.isDraft);
}

export function getRelatedArticles(currentSlug: string, categorySlug: string, count = 4): ArticleItem[] {
  const all = getAllArticles();
  return all.filter((a) => a.category === categorySlug && a.slug !== currentSlug && !a.isDraft).slice(0, count);
}
