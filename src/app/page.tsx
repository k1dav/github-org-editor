import Link from 'next/link'
import { Github, Users, Shield, GitBranch } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <div className="mb-4 flex items-center justify-center">
          <Github className="mr-3 h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">GitHub Organization Manager</h1>
        </div>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          管理您的 GitHub 組織成員、團隊和儲存庫權限的統一平台
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <Link href="/members" className="group">
          <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center">
              <Users className="mr-3 h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">成員管理</h2>
            </div>
            <p className="text-muted-foreground">管理組織成員、邀請新成員、設定成員角色和權限</p>
          </div>
        </Link>

        <Link href="/teams" className="group">
          <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center">
              <Shield className="mr-3 h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">團隊管理</h2>
            </div>
            <p className="text-muted-foreground">建立和管理團隊、設定團隊權限、分配團隊成員</p>
          </div>
        </Link>

        <Link href="/repositories" className="group">
          <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-center">
              <GitBranch className="mr-3 h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">儲存庫權限</h2>
            </div>
            <p className="text-muted-foreground">
              管理儲存庫訪問權限、設定使用者權限、預覽變更結果
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <div className="mx-auto max-w-4xl rounded-lg bg-muted p-6">
          <h3 className="mb-2 text-lg font-semibold">主要功能</h3>
          <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
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
