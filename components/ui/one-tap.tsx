'use client'

import { useOneTapSignin } from '@/lib/hooks/useOneTapSignIn'

export const OneTapComponent = () => {
  const { isLoading: oneTapIsLoading } = useOneTapSignin({
    redirect: false,
    parentContainerId: 'oneTap'
  })

  return <div id="oneTap" className="fixed top-0 right-0 z-[100]" /> // This is done with tailwind. Update with system of choice
}
