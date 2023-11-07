import { useEffect, useState } from 'react'
import { useSession, signIn, SignInOptions } from 'next-auth/react'

import { GOOGLE_CLIENT_ID } from '@/google'

interface OneTapSigninOptions {
  parentContainerId?: string
}

export const useOneTapSignin = (
  opt?: OneTapSigninOptions & Pick<SignInOptions, 'redirect' | 'callbackUrl'>
) => {
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const { parentContainerId } = opt || {}
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      const { google } = window as any
      if (google) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select:true,
          callback: async (response: any) => {
            setIsLoading(true)

            await signIn('googleonetap', {
              credential: response.credential,
              redirect: true,
              ...opt
            })
            setIsLoading(false)
          },
          prompt_parent_id: parentContainerId,
          style:
            'position: absolute; top: 100px; right: 30px;width: 0; height: 0; z-index: 1001;'
        })

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log(notification.getNotDisplayedReason())
          } else if (notification.isSkippedMoment()) {
            console.log(notification.getSkippedReason())
          } else if (notification.isDismissedMoment()) {
            console.log(notification.getDismissedReason())
          }
        })
      }
    }
  }, [isLoading, isSignedIn, opt, parentContainerId])

  return { isLoading, isSignedIn }
}
