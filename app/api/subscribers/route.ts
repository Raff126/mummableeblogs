import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Subscriber, DEFAULT_SUBSCRIBERS } from '../../../data/store';

const FILE_PATH = path.join(process.cwd(), 'data', 'subscribers.json');

function readFromFile(): Subscriber[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading data/subscribers.json:', error);
  }
  return DEFAULT_SUBSCRIBERS;
}

function writeToFile(subscribers: Subscriber[]): boolean {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(subscribers, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing data/subscribers.json:', error);
    return false;
  }
}

export async function GET() {
  const subscribers = readFromFile();
  return NextResponse.json(subscribers, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Bulk update from Admin (e.g. status change or deletion)
    if (Array.isArray(body.subscribers)) {
      const success = writeToFile(body.subscribers);
      if (success) {
        return NextResponse.json({ success: true, subscribers: body.subscribers });
      }
      return NextResponse.json({ error: 'Failed to write subscribers' }, { status: 500 });
    }

    // 2. Single email subscription from public newsletter forms
    const email = (body.email || '').trim().toLowerCase();
    const source = (body.source || 'Website').trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const currentSubscribers = readFromFile();
    const existingIndex = currentSubscribers.findIndex(
      (s) => s.email.toLowerCase() === email
    );

    if (existingIndex !== -1) {
      // Re-activate if was unsubscribed, or return existing status
      const existing = currentSubscribers[existingIndex];
      if (existing.status === 'Unsubscribed') {
        currentSubscribers[existingIndex].status = 'Active';
        writeToFile(currentSubscribers);
        return NextResponse.json({
          success: true,
          reactivated: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to the MummaBee newsletter!',
      });
    }

    // Clean source name
    let cleanSource = source;
    if (cleanSource === '/' || cleanSource === '') cleanSource = 'Homepage';
    else if (cleanSource.startsWith('/')) cleanSource = cleanSource.replace('/', '').replace(/-/g, ' ');

    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email,
      date: new Date().toISOString().split('T')[0],
      source: cleanSource.charAt(0).toUpperCase() + cleanSource.slice(1),
      status: 'Active',
    };

    const updated = [newSubscriber, ...currentSubscribers];
    const success = writeToFile(updated);

    if (success) {
      return NextResponse.json({
        success: true,
        subscriber: newSubscriber,
        message: 'Thank you for subscribing, look out for our exciting updates in your inbox soon',
      });
    } else {
      return NextResponse.json({ error: 'Failed to save subscription.' }, { status: 500 });
    }
  } catch (error) {
    console.error('API /api/subscribers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
