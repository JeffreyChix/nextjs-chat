'use client'

import { useSession } from 'next-auth/react'

import { useGoogleIdentify } from '@/lib/hooks/useGoogleIdentify'

export const GoogleOneTap = () => {
  const { data: session } = useSession()

  const { isSignedIn } = useGoogleIdentify({
    googleOpt: { isOneTap: true, prompt_parent_id: 'oneTap' },
    nextAuthOpt: { redirect: true }
  })

  return !isSignedIn ? (
    <div
      id="oneTap"
      style={{ position: 'fixed', right: '0', zIndex: '1001' }}
    ></div>
  ) : null
}
