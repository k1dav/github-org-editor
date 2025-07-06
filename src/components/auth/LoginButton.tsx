'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Github, LogOut } from 'lucide-react'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200"></div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src={session.user?.image || ''}
            alt={session.user?.name || ''}
            className="h-8 w-8 rounded-full"
          />
          <span className="text-sm font-medium">{session.user?.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800"
    >
      <Github className="h-4 w-4" />
      使用 GitHub 登入
    </button>
  )
}
