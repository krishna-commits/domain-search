import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Simple in-memory user store (in production, use a database)
 */
const users = new Map<string, { id: string; email: string; password: string; apiKeys: string[] }>();

// Initialize with a demo user
if (users.size === 0) {
  users.set('demo@example.com', {
    id: '1',
    email: 'demo@example.com',
    password: 'demo123', // In production, hash passwords
    apiKeys: [],
  });
}

/**
 * POST /api/auth/register - Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    if (action === 'register') {
      // Register new user
      if (users.has(email)) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }

      const userId = Date.now().toString();
      users.set(email, {
        id: userId,
        email,
        password, // In production, hash with bcrypt
        apiKeys: [],
      });

      return NextResponse.json({ success: true, message: 'User registered successfully' });
    } else if (action === 'login') {
      // Login user
      const user = users.get(email);
      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Create JWT token
      const token = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(new TextEncoder().encode(SECRET_KEY));

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return NextResponse.json({ success: true, token, user: { id: user.id, email: user.email } });
    } else if (action === 'generate-api-key') {
      // Generate API key
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.replace('Bearer ', '');
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
        const user = Array.from(users.values()).find(u => u.id === payload.userId);
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate API key
        const apiKey = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        user.apiKeys.push(apiKey);

        return NextResponse.json({ success: true, apiKey });
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/auth/me - Get current user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      const userId = (payload as any).userId;
      const user = Array.from(users.values()).find(u => u.id === userId);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user: { id: user.id, email: user.email, apiKeys: user.apiKeys } });
    } catch (error: any) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

