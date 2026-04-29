'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
    >
      Sign out
    </button>
  )
}
