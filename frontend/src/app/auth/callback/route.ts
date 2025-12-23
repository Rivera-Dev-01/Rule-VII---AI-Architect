import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const cookieStore = cookies()

        // 1. Use createServerClient to handle cookies correctly
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // This writes the cookie to the browser
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )

        // 2. Exchange code for session (and auto-save to cookies)
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Login successful -> Redirect to dashboard
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Login failed -> Redirect to error page
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}