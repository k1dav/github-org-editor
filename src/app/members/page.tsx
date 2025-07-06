import { MemberList } from '@/components/members/MemberList'

export default function MembersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">成員管理</h1>
        <p className="text-gray-600">管理您的 GitHub 組織成員，包括新增、刪除成員和設定角色權限</p>
      </div>

      <MemberList />
    </div>
  )
}
