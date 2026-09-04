import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ARTICLES, ArticleItem } from '../../../data/articles';

const ARTICLES_FILE_PATH = path.join(process.cwd(), 'data', 'articles.json');
const PUBLIC_ARTICLES_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'articles.json');

function readArticlesFromFile(): ArticleItem[] {
  try {
    if (fs.existsSync(ARTICLES_FILE_PATH)) {
      const data = fs.readFileSync(ARTICLES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading data/articles.json:', error);
  }
  return ARTICLES;
}

function writeArticlesToFile(articles: ArticleItem[]): boolean {
  try {
    // Write to data/articles.json (build source)
    const dir = path.dirname(ARTICLES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');

    // Also write to public/data/articles.json (static runtime source)
    const publicDir = path.dirname(PUBLIC_ARTICLES_FILE_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_ARTICLES_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');

    return true;
  } catch (error) {
    console.error('Error writing articles files:', error);
    return false;
  }
}

export async function GET() {
  const articles = readArticlesFromFile();
  return NextResponse.json(articles, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let articlesToSave: ArticleItem[] = [];

    if (Array.isArray(body)) {
      articlesToSave = body;
    } else if (body && Array.isArray(body.articles)) {
      articlesToSave = body.articles;
    } else if (body && body.article && typeof body.article === 'object') {
      const current = readArticlesFromFile();
      const existingIdx = current.findIndex((a) => a.id === body.article.id || a.slug === body.article.slug);
      if (existingIdx !== -1) {
        current[existingIdx] = { ...current[existingIdx], ...body.article };
        articlesToSave = current;
      } else {
        articlesToSave = [body.article, ...current];
      }
    } else {
      return NextResponse.json({ error: 'Articles must be an array or object containing articles' }, { status: 400 });
    }

    const success = writeArticlesToFile(articlesToSave);
    if (success) {
      return NextResponse.json({
        success: true,
        count: articlesToSave.length,
        articles: articlesToSave,
      });
    } else {
      return NextResponse.json({ error: 'Failed to write articles file' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/articles error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
