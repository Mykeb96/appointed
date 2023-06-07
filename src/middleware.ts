import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import { NextRequest } from "next/server";

 
export default authMiddleware({
  afterAuth(auth, req, evt) {
    if (!auth.userId){
      // return NextResponse.redirect('https://appointed.vercel.app/')
    } else {
      NextResponse.next()
    }
    NextResponse.next()
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