'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { LoginButton } from '@/components/auth/LoginButton'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Github className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              GitHub Organization Manager
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/members" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              成員管理
            </Link>
            <Link 
              href="/teams" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              團隊管理
            </Link>
            <Link 
              href="/repositories" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              儲存庫權限
            </Link>
          </nav>

          <LoginButton />
        </div>
      </div>
    </header>
  )
}