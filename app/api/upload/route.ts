import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const contentType = request.headers.get('content-type') || '';

    // 1. Handle JSON Payload with Base64 Data URL
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { image, filename } = body;

      if (!image) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      let buffer: Buffer;
      let ext = '.jpg';

      if (image.startsWith('data:image/')) {
        const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const rawExt = matches[1].toLowerCase();
          ext = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`;
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          return NextResponse.json({ error: 'Invalid base64 data URL' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Image must be a base64 data URL' }, { status: 400 });
      }

      const cleanName = (filename || `upload-${Date.now()}`)
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueFilename = `${cleanName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFilename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: uniqueFilename,
      });
    }

    // 2. Handle Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file found in form data' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || `photo-${Date.now()}.jpg`;
      const ext = path.extname(originalName) || '.jpg';
      const cleanName = path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueFilename = `${cleanName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFilename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: uniqueFilename,
      });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
