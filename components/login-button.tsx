'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconGitHub, IconGoogle, IconSpinner } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {
  provider?: 'GITHUB' | 'GOOGLE'
  text?: string
}

export function LoginButton({
  text = 'Login with GitHub',
  provider = 'GITHUB',
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const signInProvider = provider.toLowerCase().trim()

  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        signIn(signInProvider, { callbackUrl: `/` })
        sessionStorage.setItem('auth___status', 'signed_in')
      }}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : provider === 'GITHUB' ? (
        <IconGitHub className="mr-2" />
      ) : provider === 'GOOGLE' ? (
        <IconGoogle className="mr-2" />
      ) : null}
      {text}
    </Button>
  )
}
