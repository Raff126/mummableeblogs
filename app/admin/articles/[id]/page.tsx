import { getAllArticles } from '../../../../data/articles';
import EditArticleView from './EditArticleView';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    id: article.id,
  }));
}

export default function AdminEditArticlePage({ params }: PageProps) {
  return <EditArticleView articleId={params.id} />;
}
