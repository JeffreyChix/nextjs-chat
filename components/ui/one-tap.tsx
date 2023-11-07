'use client'

import { useOneTapSignin } from '@/lib/hooks/useOneTapSignIn'

export const OneTapComponent = () => {
  const { isSignedIn } = useOneTapSignin({
    redirect: true,
    parentContainerId: 'oneTap'
  })

  return !isSignedIn ? (
    <div
      id="oneTap"
      data-auto_select="true"
      className="fixed top-0 right-0 z-[100]"
    />
  ) : null
}
