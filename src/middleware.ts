import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie, and bounces signed-out visitors to
 * the sign-in page.
 *
 * TWO THINGS THIS IS NOT:
 *
 * It is not the security boundary. Middleware can be bypassed by anything
 * that does not route through it, and a redirect is a UX affordance rather
 * than an authorisation decision. Access is decided in `lib/admin/data.ts`
 * for reads and `requireAdminAccess()` for mutations, both of which run on
 * the server regardless of how the request arrived.
 *
 * It is not a role check. It only asks whether a verified session exists;
 * whether that person is staff is read from the database further in. Doing it
 * here would mean a database round trip on every asset request for a decision
 * that has to be made again anyway.
 *
 * Scoped to `/admin` by the matcher below so the prerendered marketing pages
 * never touch cookies and stay static.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Unconfigured deployments have no session to refresh. The gate denies on
  // its own terms, so there is nothing useful to do here.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() rather than getSession(): this both verifies the token and
  // triggers the refresh that writes the rotated cookie above. Without the
  // call, sessions would expire mid-use and sign people out unpredictably.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    // Only the path, never the query string: it could carry a search term or
    // a filter, and putting that in a URL that ends up in logs and referrers
    // is how enquiry data leaks.
    redirectUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
