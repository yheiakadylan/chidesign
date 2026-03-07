import { auth } from "@/auth";

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Public routes that don't need authentication
    const publicRoutes = ['/login'];

    // Check if the route is public
    const isPublicRoute = publicRoutes.includes(pathname);

    // Exclude system/static files from redirect
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname.includes('.')
    ) {
        return;
    }

    // If user is not logged in and tries to access a protected route
    if (!req.auth && !isPublicRoute) {
        const newUrl = new URL("/login", req.nextUrl.origin);
        return Response.redirect(newUrl);
    }

    // If user IS logged in and tries to visit login page
    if (req.auth && isPublicRoute) {
        const newUrl = new URL("/", req.nextUrl.origin);
        return Response.redirect(newUrl);
    }
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
