import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DiscountCode, DEFAULT_DEALS } from '../../../data/store';

const FILE_PATH = path.join(process.cwd(), 'data', 'deals.json');

function readFromFile(): DiscountCode[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading data/deals.json:', error);
  }
  return DEFAULT_DEALS;
}

function writeToFile(deals: DiscountCode[]): boolean {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(deals, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data/deals.json:', error);
    return false;
  }
}

export async function GET() {
  const deals = readFromFile();
  return NextResponse.json(deals, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Deals must be an array' }, { status: 400 });
    }

    const success = writeToFile(body);
    if (success) {
      return NextResponse.json({ success: true, count: body.length });
    } else {
      return NextResponse.json({ error: 'Failed to write deals file' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/deals error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
