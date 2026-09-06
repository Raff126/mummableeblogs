import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 200,
    message: 'System Analytics Endpoint (Protected: Admin Only)',
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body?.callerRole;

    if (role === 'Assistant') {
      return NextResponse.json(
        {
          error: 'Forbidden: System Analytics is restricted to Administrators only.',
          status: 403,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: 'Authorized Admin Telemetry Access',
    });
  } catch (_) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
