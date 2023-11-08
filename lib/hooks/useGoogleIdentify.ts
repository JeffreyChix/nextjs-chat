import { useCallback, useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

import { GOOGLE_CLIENT_ID } from '@/google'

interface GoogleIndentifyProps {
  nextAuthOpt: {
    redirect: boolean
  }
  googleOpt: {
    isOneTap: boolean
    prompt_parent_id: string
  }
}

export const useGoogleIdentify = (props: GoogleIndentifyProps) => {
  const URL = 'https://accounts.google.com/gsi/client'

  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  const { nextAuthOpt, googleOpt } = props || {}

  useEffect(() => {
    if (session) {
      setIsSignedIn(true)
    }
  }, [session])

  const initiateGoogleOneTap = useCallback(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = URL
    document.head.appendChild(script)

    const persistedAuthStatus = sessionStorage.getItem('auth___status')

    if (!isLoading && !isSignedIn && persistedAuthStatus !== 'signed_in') {
      const { google } = window as any

      if (google) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: persistedAuthStatus !== 'signed_out' ? true : false,
          callback: async (response: any) => {
            setIsLoading(true)

            await signIn('googleonetap', {
              credential: response.credential,
              ...nextAuthOpt
            })
            setIsLoading(false)
            sessionStorage.setItem('auth___status', 'signed_in')
          },
          ...googleOpt
        })

        if (googleOpt.isOneTap) {
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log(
                'getNotDisplayedReaseon: ',
                notification.getNotDisplayedReason()
              )
            } else if (notification.isSkippedMoment()) {
              console.log('isSkippedMoment: ', notification.getSkippedReason())
            } else if (notification.isDismissedMoment()) {
              console.log(
                'isDismissedMoment: ',
                notification.getDismissedReason()
              )
            }
          })
        }
      }
    }
  }, [googleOpt, isLoading, isSignedIn, nextAuthOpt])

  useEffect(() => {
    initiateGoogleOneTap()
  }, [initiateGoogleOneTap])

  return { isLoading, isSignedIn }
}
