// export { auth as middleware } from './auth'

export { default } from 'next-auth/middleware'

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/', '/chat']
// }

export const config = {
  matcher: ['/', '/chat']
}
