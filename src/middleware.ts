import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

 
export default authMiddleware({
  afterAuth(auth, req, evt) {
    // // handle users who aren't authenticated
    // if (!auth.userId && !auth.isPublicRoute) {
    //   const signInUrl = new URL('/', req.url)
    //   signInUrl.searchParams.set('/schedule', req.url)
    //   return NextResponse.redirect(signInUrl)
    // }
    // // rededirect them to organization selection page
    // if(!auth.orgId && req.nextUrl.pathname !== "/org-selection"){
    //   const orgSelection = new URL('/org-selection', req.url)
    //   return NextResponse.redirect(orgSelection)
    // }
    if (!auth.userId){
      return NextResponse.redirect('http://localhost:3000/')
    }
  },
});

// export default withClerkMiddleware((req: NextRequest) => {
//   return NextResponse.next();
// });
 
 
// export const config = {
//   matcher: [
//     "/((?!static|.*\\..*|_next|favicon.ico).*)",
//     "/",
//   ],
// }

export const config = { matcher:  '/((?!_next/image|_next/static|favicon.ico).*)',};