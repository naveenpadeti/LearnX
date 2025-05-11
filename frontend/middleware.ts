import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    const publicPaths = ['/', '/sign-in', '/admin/sign-in'];

    let response = NextResponse.next();

    if (!publicPaths.includes(pathname)) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    try {
        if (token) {
            try {
                const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
                const role = payload.role;

                if (role === 'ADMIN') {
                    if (pathname.startsWith('/admin')) return response;
                    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
                }

                if (role === 'MENTOR') {
                    if (pathname.startsWith('/mentor')) return response;
                    return NextResponse.redirect(new URL('/mentor/dashboard', request.url));
                }

                if (role === 'INSTRUCTOR') {
                    if (pathname.startsWith('/instructor')) return response;
                    return NextResponse.redirect(new URL('/instructor/dashboard/manage', request.url));
                }

                if (role === 'STUDENT') {
                    if (pathname.startsWith('/dashboard')) return response;
                    return NextResponse.redirect(new URL('/dashboard/courses', request.url));
                }
            } catch (jwtError: any) {
                if (jwtError.code === 'ERR_JWT_EXPIRED') {
                    console.log('Token expired, redirecting to sign-in');
                    const redirectUrl = new URL('/sign-in', request.url);
                    redirectUrl.searchParams.set('session', 'expired');
                    const response = NextResponse.redirect(redirectUrl);
                    response.cookies.delete('token');
                    return response;
                }
                throw jwtError;
            }
        } else {
            if (!publicPaths.includes(pathname)) {
                return NextResponse.redirect(new URL('/sign-in', request.url));
            }
        }
    } catch (e) {
        console.error('JWT Verification Error:', e);
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/', '/sign-in', '/admin/:path*', '/mentor/:path*', '/instructor/:path*', '/dashboard/:path*'],
};