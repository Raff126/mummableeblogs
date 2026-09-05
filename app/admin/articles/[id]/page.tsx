import { getAllArticles } from '../../../../data/articles';
import EditArticleView from './EditArticleView';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  const params = articles.map((article) => ({
    id: article.id,
  }));
  params.push({ id: '__fallback__' });
  return params;
}

export default function AdminEditArticlePage({ params }: PageProps) {
  return <EditArticleView articleId={params.id} />;
}
