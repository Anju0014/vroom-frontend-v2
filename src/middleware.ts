
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { TokenPayload } from './types/authTypes';

export async function middleware(req: NextRequest) {
  // const url = req.nextUrl.clone();
  // const { pathname } = url;

  // console.log("middleware working")
  // const publicRoutes = [
  //   '/login',
  //   '/admin/login',
  //   '/api/auth/login',
  //   '/',
  //   '/customer/cars',
  //   '/customer/tracking/:bookingId([0-9a-fA-F]{24})',
  //   '/forgotpassword/newPassword',
  //   '/otp',
  //   '/signup',
  //   '/cars/:carId([0-9a-fA-F]{24})', // Dynamic route for /customer/[carId]
  // ];

  // // Check if the route is public (use regex for dynamic routes)
  // const isPublicRoute = publicRoutes.some((route) => {
  //   if (route.includes(':carId')) {
  //     const regex = new RegExp(`^${route.replace(':carId([0-9a-fA-F]{24})', '[0-9a-fA-F]{24}')}$`);
  //     return regex.test(pathname);
  //   }
  //   return pathname===route;
  // });

  // if (isPublicRoute) {
  //   console.log('Skipping middleware for public route:', pathname);
  //   return NextResponse.next();
  // }

  // // Get tokens based on role-specific paths
  // let token: string | undefined = undefined;
  // let refreshToken: string | undefined = undefined;
  // let role: string | null = null;
  // let userId: string | null = null;

  // if (pathname.startsWith('/admin')) {
  //   token = req.cookies.get('adminAccessToken')?.value || undefined;
  //   refreshToken = req.cookies.get('adminRefreshToken')?.value || undefined;
  // } else if (pathname.startsWith('/carOwner')) {
  //   token = req.cookies.get('carOwnerAccessToken')?.value || undefined;
  //   refreshToken = req.cookies.get('carOwnerRefreshToken')?.value || undefined;
  // } else {
  //   token = req.cookies.get('customerAccessToken')?.value || undefined;
  //   refreshToken = req.cookies.get('customerRefreshToken')?.value || undefined;
  // }

  // // Fallback to generic tokens
  // token = token || req.cookies.get('accessToken')?.value || undefined;
  // refreshToken = refreshToken || req.cookies.get('refreshToken')?.value || undefined;

  // // Decode token to get role and userId
  // if (token) {
  //   try {
  //     const decoded = jwt.decode(token) as TokenPayload | null;
  //     role = decoded?.role || null;
  //     userId = decoded?.id || null;
  //   } catch (error) {
  //     console.error('Error decoding token:', error);
  //   }
  // }

  // console.log('Middleware role:', role, 'Path:', pathname, 'UserId:', userId);

  // // Check block status for authenticated users (skip for admin)
  // if (token && userId && role && role !== 'admin') {
  //   console.log("sending blockstatus request")
  //   try {
  //     const apiEndpoint =
  //       role === 'carOwner'
  //         ? `owner/checkblockstatus/${userId}`
  //         : `checkblockstatus/${userId}`;
      
  //     const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}${apiEndpoint}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.data.blockStatus === 1) {
  //      const redirectUrl = new URL(`/login?blocked=1&role=${role}`, req.url);
  //      const response = NextResponse.redirect(redirectUrl);
  //       if (role === 'carOwner') {
  //         response.cookies.delete('carOwnerAccessToken');
  //         response.cookies.delete('carOwnerRefreshToken');
  //       } else if(role==='customer') {
  //         response.cookies.delete('customerAccessToken');
  //         response.cookies.delete('customerRefreshToken');
  //       }
  //       response.cookies.delete('accessToken');
  //       response.cookies.delete('refreshToken');
  //       return response;
  //     }
  //   } catch (error) {
  //     console.error('Error checking block status:', error);
  //     return NextResponse.redirect(new URL('/login', req.url));
  //   }
  // }

  // // Handle missing token
  // if (!token) {
  //   if (pathname.startsWith('/admin')) {
  //     return NextResponse.redirect(new URL('/admin/login', req.url));
  //   }
  //   if (pathname.startsWith('/carOwner')) {
  //     return NextResponse.redirect(new URL('/login', req.url));
  //   }
  //   if (['/bookings', '/checkout', '/wishlist', '/profile'].some((path) => pathname.startsWith(path))) {
  //     return NextResponse.redirect(new URL('/login', req.url));
  //   }
  //   return NextResponse.next();
  // }

  
  // if (!token && refreshToken) {
  //   console.log('Access token expired, but refresh token exists. Allowing frontend to refresh.');
  //   return NextResponse.next();
  // }

  
  // if (role) {
  //   if (pathname.startsWith('/admin') && role !== 'admin') {
  //     return NextResponse.redirect(new URL('/unauthorized', req.url));
  //   }
  //   if (pathname.startsWith('/carOwner') && role !== 'carOwner') {
  //     return NextResponse.redirect(new URL('/unauthorized', req.url));
  //   }
  // }

  
  // const response = NextResponse.next();
  // response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  // response.headers.set('Pragma', 'no-cache');
  // response.headers.set('Expires', '0');
  // return response;
}

export const config = {
  matcher: [
    '/home',
    // '/profile',
    '/bookings/:path*',
    '/checkout',
    '/wishlist',
    '/carOwner/:path*',
    '/admin/:path*',
    '/customer/:path*',
  ],
};