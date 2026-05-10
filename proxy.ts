import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import setCookieParser from 'set-cookie-parser';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  /** no acces token */
  if (!accessToken) {
    /** try refresh session */
    if (refreshToken) {
      try {
        const data = await checkServerSession();

        const setCookie = data.headers['set-cookie'];

        /** refresh success */
        if (setCookie) {
          const cookieArray = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];

          const parsedCookies = setCookieParser.parse(cookieArray);

          for (const cookie of parsedCookies) {
  const sameSite =
    cookie.sameSite?.toLowerCase() as
      | 'lax'
      | 'strict'
      | 'none'
      | undefined;

  cookieStore.set(cookie.name, cookie.value, {
    expires: cookie.expires,
    path: cookie.path,
    maxAge: cookie.maxAge,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite,
  });
}

          /** authenticated user on public route */
          if (isPublicRoute) {
            return NextResponse.redirect(new URL('/', request.url), {
              headers: {
                Cookie: cookieStore.toString(),
              },
            });
          }

          /** authenticated user on private route */
          if (isPrivateRoute) {
            return NextResponse.next({
              headers: {
                Cookie: cookieStore.toString(),
              },
            });
          }

          return NextResponse.next({
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    }

    /** refresh failed or no refresh token */

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
  }

  /** acces tocen exists */

  /** authenticated user cannot access auth pages */
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  /** authenticated user can access private pages */
  if (isPrivateRoute) {
    return NextResponse.next();
  }

  /** all other routes */
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/notes/:path*',
    '/sign-in',
    '/sign-up',
  ],
};