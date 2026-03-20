import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export function middleware(req: NextRequest) {

    console.log("hoiiiii middleware");


    const { cookies, nextUrl } = req;

    
    
    const protectedRoutes = ["/user/profile", "/admin/dashboard", "/carOwner/dashboard/home", "/carOwner/dashboard/registration", "/carOwner/dashboard/profile"]


    if (protectedRoutes.some((route) => nextUrl.pathname.startsWith(route)) && !isAuthenticated) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next()

}

export const config = {
    matcher: ["/user/profile", "/admin/dashboard", "/carOwner/dashboard/home", "/carOwner/dashboard/registration", "/carOwner/dashboard/profile"]}