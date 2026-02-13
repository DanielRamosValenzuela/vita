import { NextRequest, NextResponse } from 'next/server'

import { env } from '@/src/shared/config'
import { prisma } from '@/src/shared/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error)
    return NextResponse.redirect(
      new URL(`/es/dashboard/profile?error=google_link_error`, request.url)
    )

  if (!code || !state)
    return NextResponse.redirect(new URL(`/es/dashboard/profile?error=missing_params`, request.url))

  try {
    const { emailId, userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_LINK_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) throw new Error('Token exchange failed')

    const tokens = await tokenResponse.json()

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!profileResponse.ok) throw new Error('Profile fetch failed')

    const profile = await profileResponse.json()

    const userEmail = await prisma.userEmail.findUnique({
      where: { id: emailId },
    })

    if (!userEmail || userEmail.userId !== userId)
      return NextResponse.redirect(
        new URL(`/es/dashboard/profile?error=invalid_email`, request.url)
      )

    if (profile.email.toLowerCase() !== userEmail.email.toLowerCase())
      return NextResponse.redirect(
        new URL(
          `/es/dashboard/profile?error=email_mismatch&expected=${userEmail.email}&got=${profile.email}`,
          request.url
        )
      )

    await prisma.userEmail.update({
      where: { id: emailId },
      data: {
        provider: 'GOOGLE',
        isVerified: true,
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user && !user.customImage && profile.picture)
      await prisma.user.update({
        where: { id: userId },
        data: {
          image: profile.picture,
          imageProvider: 'OAUTH',
        },
      })

    const existingAccount = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
      },
    })

    if (!existingAccount)
      await prisma.account.create({
        data: {
          userId,
          type: 'oauth',
          provider: 'google',
          providerAccountId: profile.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
          token_type: tokens.token_type,
          scope: tokens.scope,
          id_token: tokens.id_token,
        },
      })

    return NextResponse.redirect(
      new URL(`/es/dashboard/profile?success=google_linked`, request.url)
    )
  } catch (error) {
    console.error('[Google Link Callback] Error:', error)
    return NextResponse.redirect(new URL(`/es/dashboard/profile?error=server_error`, request.url))
  }
}
