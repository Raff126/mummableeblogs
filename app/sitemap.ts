import { MetadataRoute } from 'next';
import { getAllArticles } from '../data/articles';
import { CATEGORIES } from '../data/categories';


export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mummabeeblog.com';
  const rawArticles = getAllArticles().filter((a) => !a.isDraft && a.slug && a.category);

  // De-duplicate article URLs by category and slug
  const seenUrls = new Set<string>();
  const articles = rawArticles.filter((article) => {
    const url = `${baseUrl}/${article.category}/${article.slug}`;
    if (seenUrls.has(url)) return false;
    seenUrls.add(url);
    return true;
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work-with-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map((catSlug) => ({
    url: `${baseUrl}/${catSlug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    let lastmod: Date;
    try {
      lastmod = article.publishedAt ? new Date(article.publishedAt) : new Date();
      if (isNaN(lastmod.getTime())) lastmod = new Date();
    } catch {
      lastmod = new Date();
    }

    return {
      url: `${baseUrl}/${article.category}/${article.slug}`,
      lastModified: lastmod,
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
