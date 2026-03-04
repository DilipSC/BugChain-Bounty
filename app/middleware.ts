import { NextResponse,NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";


export async function middleware(req:NextRequest) {
    
    const token=await getToken({
        req,
        secret:process.env.NEXTAUTH_SECRET
    })

    const {pathname}=req.nextUrl;

    if(!token && pathname.startsWith("/main")){
        return NextResponse.redirect(new URL('/',req.url))
    }

    if(token && pathname.startsWith("/")){
        return NextResponse.redirect(new URL("/main",req.url)) 
    }
}

export const config={
    matcher:["/","/main/:path*"]
}