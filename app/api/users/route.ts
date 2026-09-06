import { NextResponse } from 'next/server';
import { DEFAULT_USERS } from '../../../data/users';

export async function GET() {
  return NextResponse.json({
    users: DEFAULT_USERS.map(({ passwordHash, ...safeUser }) => safeUser),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body?.callerRole;

    if (role === 'Assistant') {
      return NextResponse.json(
        {
          error: 'Forbidden: Assistants are not permitted to create user accounts.',
          status: 403,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: 'User created successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const role = body?.callerRole;

    if (role === 'Assistant') {
      return NextResponse.json(
        {
          error: 'Forbidden: Assistants are not permitted to delete user accounts.',
          status: 403,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
