import Link from 'next/link'
import { Github, Users, Shield, GitBranch } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Github className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-foreground">
            GitHub Organization Manager
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          管理您的 GitHub 組織成員、團隊和儲存庫權限的統一平台
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Link href="/members" className="group">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">成員管理</h2>
            </div>
            <p className="text-muted-foreground">
              管理組織成員、邀請新成員、設定成員角色和權限
            </p>
          </div>
        </Link>

        <Link href="/teams" className="group">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">團隊管理</h2>
            </div>
            <p className="text-muted-foreground">
              建立和管理團隊、設定團隊權限、分配團隊成員
            </p>
          </div>
        </Link>

        <Link href="/repositories" className="group">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <GitBranch className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-xl font-semibold text-card-foreground">儲存庫權限</h2>
            </div>
            <p className="text-muted-foreground">
              管理儲存庫訪問權限、設定使用者權限、預覽變更結果
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-muted rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">主要功能</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>• 權限管理操作</div>
            <div>• 權限變更預覽</div>
            <div>• Owner-only 專案篩選</div>
            <div>• GitHub 內建權限管理</div>
          </div>
        </div>
      </div>
    </div>
  )
}