// import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

// const PUBLIC_PAGES: string[] = ['/login'];

export async function middleware(request: NextRequest) {
  // const pathname = request.nextUrl.pathname;
  // const isPublicPage = PUBLIC_PAGES.some((page) => pathname.startsWith(page));

  // if (isPublicPage) {
  //   return NextResponse.next();
  // }

  // const token = await getToken({
  //   req: request,
  // });

  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|images|favicon.ico).*)'],
};
