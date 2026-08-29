import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_ABOUT, AboutPageContent } from '../../../data/store';

const FILE_PATH = path.join(process.cwd(), 'data', 'about.json');

function readFromFile(): AboutPageContent {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 2) {
        return { ...DEFAULT_ABOUT, ...parsed };
      }
    }
  } catch (error) {
    console.error('Error reading data/about.json:', error);
  }
  return DEFAULT_ABOUT;
}

function writeToFile(content: AboutPageContent): boolean {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(content, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data/about.json:', error);
    return false;
  }
}

export async function GET() {
  const content = readFromFile();
  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const merged = { ...DEFAULT_ABOUT, ...body };
    const success = writeToFile(merged);
    if (success) {
      return NextResponse.json({ success: true, data: merged });
    } else {
      return NextResponse.json({ error: 'Failed to write about file' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/about error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
