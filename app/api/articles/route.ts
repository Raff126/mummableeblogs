import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ARTICLES, ArticleItem } from '../../../data/articles';

const ARTICLES_FILE_PATH = path.join(process.cwd(), 'data', 'articles.json');

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
    const dir = path.dirname(ARTICLES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to data/articles.json:', error);
    return false;
  }
}

export async function GET() {
  const articles = readArticlesFromFile();
  return NextResponse.json(articles, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Articles must be an array' }, { status: 400 });
    }

    const success = writeArticlesToFile(body);
    if (success) {
      return NextResponse.json({ success: true, count: body.length });
    } else {
      return NextResponse.json({ error: 'Failed to write articles file' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/articles error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
