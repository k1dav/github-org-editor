'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Github, LogOut } from 'lucide-react'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-gray-200 rounded-md h-10 w-32"></div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img
            src={session.user?.image || ''}
            alt={session.user?.name || ''}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">{session.user?.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          登出
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
    >
      <Github className="w-4 h-4" />
      使用 GitHub 登入
    </button>
  )
}