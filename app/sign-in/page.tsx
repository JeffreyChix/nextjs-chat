import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/auth'
import { LoginButton } from '@/components/login-button'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10 gap-5">
      <LoginButton />
      <LoginButton text="Login with Google" provider="GOOGLE" />
    </div>
  )
}
