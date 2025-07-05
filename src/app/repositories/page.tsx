'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, Settings, Users, Lock, Unlock } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui/FormElements'
import type { Repository, RepositoryPermission, Team, OrganizationMember } from '@/types/github'

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [permissions, setPermissions] = useState<RepositoryPermission[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [potentialCollaborators, setPotentialCollaborators] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'ownerOnly'>('all')
  const [editingRepo, setEditingRepo] = useState<string | null>(null)
  const [newRepoName, setNewRepoName] = useState('')
  const [updatingRepo, setUpdatingRepo] = useState(false)
  const [editingDescription, setEditingDescription] = useState<string | null>(null)
  const [newDescription, setNewDescription] = useState('')
  const [updatingDescription, setUpdatingDescription] = useState(false)

  useEffect(() => {
    loadRepositories()
    loadTeams()
    loadMembers()
  }, [filterType])

  const loadRepositories = async () => {
    try {
      const url = filterType === 'ownerOnly' 
        ? '/api/repositories?ownerOnly=true'
        : '/api/repositories'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRepositories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load members:', error)
    }
  }

  const loadRepositoryPermissions = async (repoName: string) => {
    try {
      const response = await fetch(`/api/repositories/${repoName}/permissions`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
        setPotentialCollaborators(data.potentialCollaborators || [])
      }
    } catch (error) {
      console.error('Failed to load repository permissions:', error)
    }
  }

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepo(repo)
    loadRepositoryPermissions(repo.name)
    setShowPermissionModal(true)
  }

  const updatePermission = async (type: 'user' | 'team', name: string, permission: string) => {
    if (!selectedRepo) return

    try {
      const response = await fetch(`/api/repositories/${selectedRepo.name}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, permission })
      })

      if (response.ok) {
        await loadRepositoryPermissions(selectedRepo.name)
      }
    } catch (error) {
      console.error('Failed to update permission:', error)
    }
  }

  const removePermission = async (type: 'user' | 'team', name: string) => {
    if (!selectedRepo) return

    try {
      const response = await fetch(`/api/repositories/${selectedRepo.name}/permissions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name })
      })

      if (response.ok) {
        await loadRepositoryPermissions(selectedRepo.name)
      }
    } catch (error) {
      console.error('Failed to remove permission:', error)
    }
  }

  const updateRepositoryName = async (oldName: string, newName: string) => {
    setUpdatingRepo(true)
    try {
      const response = await fetch(`/api/repositories/${oldName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      })

      if (response.ok) {
        const data = await response.json()
        // 更新本地儲存庫列表
        setRepositories(prev => prev.map(repo => 
          repo.name === oldName ? data.data : repo
        ))
        setEditingRepo(null)
        setNewRepoName('')
      } else {
        const errorData = await response.json()
        alert(`更新失敗: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update repository name:', error)
      alert('更新儲存庫名稱時發生錯誤')
    } finally {
      setUpdatingRepo(false)
    }
  }

  const startEditingRepo = (repoName: string) => {
    setEditingRepo(repoName)
    setNewRepoName(repoName)
  }

  const cancelEditingRepo = () => {
    setEditingRepo(null)
    setNewRepoName('')
  }

  const updateRepositoryDescription = async (repoName: string, description: string) => {
    setUpdatingDescription(true)
    try {
      const response = await fetch(`/api/repositories/${repoName}/description`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      if (response.ok) {
        const data = await response.json()
        // 更新本地儲存庫列表
        setRepositories(prev => prev.map(repo => 
          repo.name === repoName ? data.data : repo
        ))
        setEditingDescription(null)
        setNewDescription('')
      } else {
        const errorData = await response.json()
        alert(`更新失敗: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to update repository description:', error)
      alert('更新儲存庫描述時發生錯誤')
    } finally {
      setUpdatingDescription(false)
    }
  }

  const startEditingDescription = (repoName: string, currentDescription: string) => {
    setEditingDescription(repoName)
    setNewDescription(currentDescription || '')
  }

  const cancelEditingDescription = () => {
    setEditingDescription(null)
    setNewDescription('')
  }

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">儲存庫權限管理</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">篩選：</label>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'ownerOnly')}
              className="text-sm"
              fullWidth={false}
            >
              <option value="all">所有儲存庫</option>
              <option value="ownerOnly">無團隊協作</option>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="搜尋儲存庫..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              fullWidth={false}
            />
          </div>
        </div>
      </div>

      {filteredRepositories.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterType === 'ownerOnly' ? '找不到無團隊協作的儲存庫' : '找不到儲存庫'}
          </h3>
          <p className="text-gray-500">
            {filterType === 'ownerOnly' 
              ? '沒有找到沒有團隊協作的儲存庫' 
              : '嘗試調整搜尋條件'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRepositories.map((repo) => (
            <div key={repo.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {editingRepo === repo.name ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value)}
                          className="text-lg font-semibold"
                          fullWidth={false}
                        />
                        <Button
                          onClick={() => updateRepositoryName(repo.name, newRepoName)}
                          disabled={updatingRepo || !newRepoName.trim() || newRepoName === repo.name}
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          {updatingRepo ? '更新中...' : '儲存'}
                        </Button>
                        <Button
                          onClick={cancelEditingRepo}
                          disabled={updatingRepo}
                          variant="secondary"
                          size="sm"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          取消
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{repo.name}</h3>
                        <button
                          onClick={() => startEditingRepo(repo.name)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="編輯儲存庫名稱"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {repo.private ? (
                        <Lock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        repo.private 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {repo.private ? '私人' : '公開'}
                      </span>
                      <a
                        href={`${repo.html_url}/settings/access`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        title="在 GitHub 上查看儲存庫權限設定"
                      >
                        <Settings className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  {editingDescription === repo.name ? (
                    <div className="mb-3">
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-600 resize-none"
                        rows={3}
                        placeholder="輸入儲存庫描述..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => updateRepositoryDescription(repo.name, newDescription)}
                          disabled={updatingDescription}
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          {updatingDescription ? '更新中...' : '儲存'}
                        </Button>
                        <Button
                          onClick={cancelEditingDescription}
                          disabled={updatingDescription}
                          variant="secondary"
                          size="sm"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      {repo.description ? (
                        <div className="flex items-start gap-2">
                          <p className="text-gray-600 flex-1">{repo.description}</p>
                          <button
                            onClick={() => startEditingDescription(repo.name, repo.description || '')}
                            className="text-gray-400 hover:text-gray-600 p-1 mt-1"
                            title="編輯儲存庫描述"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-gray-400 italic">無描述</p>
                          <button
                            onClick={() => startEditingDescription(repo.name, '')}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="新增儲存庫描述"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>預設分支: {repo.default_branch}</span>
                    <span>您的權限: {getPermissionText(repo.permissions)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleRepositorySelect(repo)}
                  variant="secondary"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50 flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  管理權限
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPermissionModal && selectedRepo && (
        <RepositoryPermissionModal
          repository={selectedRepo}
          permissions={permissions}
          teams={teams}
          members={potentialCollaborators}
          onClose={() => {
            setShowPermissionModal(false)
            setSelectedRepo(null)
            setPermissions([])
            setPotentialCollaborators([])
          }}
          onUpdatePermission={updatePermission}
          onRemovePermission={removePermission}
        />
      )}
    </div>
  )
}

function getPermissionText(permissions: Repository['permissions']): string {
  if (permissions.admin) return 'Admin'
  if (permissions.maintain) return 'Maintain'
  if (permissions.push) return 'Write'
  if (permissions.triage) return 'Triage'
  if (permissions.pull) return 'Read'
  return 'None'
}

function RepositoryPermissionModal({
  repository,
  permissions,
  teams,
  members,
  onClose,
  onUpdatePermission,
  onRemovePermission
}: {
  repository: Repository
  permissions: RepositoryPermission[]
  teams: Team[]
  members: OrganizationMember[]
  onClose: () => void
  onUpdatePermission: (type: 'user' | 'team', name: string, permission: string) => void
  onRemovePermission: (type: 'user' | 'team', name: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', permission: 'read' })
  const [newTeam, setNewTeam] = useState({ slug: '', permission: 'read' })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const addUser = async () => {
    if (!newUser.username) return

    try {
      await onUpdatePermission('user', newUser.username, newUser.permission)
      setNewUser({ username: '', permission: 'read' })
      setShowAddUser(false)
    } catch (error) {
      console.error('Failed to add user:', error)
    }
  }

  const addTeam = async () => {
    if (!newTeam.slug) return

    try {
      await onUpdatePermission('team', newTeam.slug, newTeam.permission)
      setNewTeam({ slug: '', permission: 'read' })
      setShowAddTeam(false)
    } catch (error) {
      console.error('Failed to add team:', error)
    }
  }

  const permissionOptions = [
    { value: 'read', label: 'Read - 讀取權限' },
    { value: 'triage', label: 'Triage - 分類問題和 PR' },
    { value: 'write', label: 'Write - 讀取和寫入' },
    { value: 'maintain', label: 'Maintain - 管理儲存庫' },
    { value: 'admin', label: 'Admin - 完整管理權限' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{repository.name} - 權限管理</h2>
            <a
              href={`${repository.html_url}/settings/access`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              title="在 GitHub 上查看儲存庫權限設定"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5z" />
              </svg>
              查看 GitHub 設定
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              使用者權限
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              團隊權限
            </button>
          </nav>
        </div>

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">使用者權限</h3>
                <p className="text-sm text-gray-500 mt-1">顯示分配給使用者的權限</p>
              </div>
              <Button
                onClick={() => setShowAddUser(true)}
                size="sm"
              >
                新增使用者
              </Button>
            </div>
            <div className="space-y-3">
              {permissions.filter(p => p.type === 'user' && p.user).map((permission) => (
                <div key={permission.user!.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <img
                      src={permission.user!.avatar_url}
                      alt={permission.user!.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {permission.user!.login}
                        <a
                          href={permission.user!.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="在 GitHub 上查看使用者"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                      {permission.user!.name && (
                        <div className="text-sm text-gray-500">{permission.user!.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={permission.permission}
                      onChange={(e) => onUpdatePermission('user', permission.user!.login, e.target.value)}
                      className="text-sm"
                      fullWidth={false}
                    >
                      {permissionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={() => onRemovePermission('user', permission.user!.login)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      移除
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {showAddUser && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-3">新增使用者</h4>
                <p className="text-sm text-gray-500 mb-3">選擇要新增到儲存庫的組織成員</p>
                <div className="flex gap-3 mb-3">
                  <Select
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    fullWidth={false}
                    className="min-w-[200px]"
                  >
                    <option value="">選擇使用者</option>
                    {members
                      .slice()
                      .sort((a, b) => a.login.localeCompare(b.login))
                      .map((member) => (
                        <option key={member.id} value={member.login}>
                          {member.login} {member.name && `(${member.name})`}
                        </option>
                      ))}
                  </Select>
                  <Select
                    value={newUser.permission}
                    onChange={(e) => setNewUser({...newUser, permission: e.target.value})}
                    fullWidth={false}
                  >
                    {permissionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addUser}
                    disabled={!newUser.username}
                    size="sm"
                  >
                    新增
                  </Button>
                  <Button
                    onClick={() => setShowAddUser(false)}
                    variant="secondary"
                    size="sm"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">團隊權限</h3>
                <p className="text-sm text-gray-500 mt-1">顯示分配給團隊的權限，團隊成員將繼承這些權限</p>
                <p className="text-sm text-orange-600 mt-1">⚠️ 團隊權限管理功能暫時停用</p>
              </div>
              <Button
                onClick={() => setShowAddTeam(true)}
                size="sm"
                disabled={true}
                className="opacity-50 cursor-not-allowed"
                title="團隊權限功能暫時停用"
              >
                新增團隊
              </Button>
            </div>
            <div className="space-y-3">
              {permissions.filter(p => p.type === 'team' && p.team).map((permission) => (
                <div key={permission.team!.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {permission.team!.name}
                        <a
                          href={permission.team!.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="在 GitHub 上查看團隊"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">{permission.team!.members_count} 位成員</div>
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-1 inline-block">
                        團隊權限
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={permission.permission}
                      onChange={(e) => onUpdatePermission('team', permission.team!.slug, e.target.value)}
                      className="text-sm opacity-50"
                      fullWidth={false}
                      disabled={true}
                      title="團隊權限功能暫時停用"
                    >
                      {permissionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={() => onRemovePermission('team', permission.team!.slug)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 opacity-50 cursor-not-allowed"
                      disabled={true}
                      title="團隊權限功能暫時停用"
                    >
                      移除
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {showAddTeam && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-3">新增團隊</h4>
                <p className="text-sm text-gray-500 mb-3">選擇要新增到儲存庫的組織團隊</p>
                <div className="flex gap-3 mb-3">
                  <Select
                    value={newTeam.slug}
                    onChange={(e) => setNewTeam({...newTeam, slug: e.target.value})}
                    fullWidth={false}
                    className="min-w-[200px]"
                  >
                    <option value="">選擇團隊</option>
                    {teams
                      .filter(team => !permissions.some(p => p.type === 'team' && p.team?.slug === team.slug))
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((team) => (
                        <option key={team.id} value={team.slug}>
                          {team.name} {team.description && `(${team.description.slice(0, 30)}...)`}
                        </option>
                      ))}
                  </Select>
                  <Select
                    value={newTeam.permission}
                    onChange={(e) => setNewTeam({...newTeam, permission: e.target.value})}
                    fullWidth={false}
                  >
                    {permissionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addTeam}
                    disabled={true}
                    size="sm"
                    className="opacity-50 cursor-not-allowed"
                    title="團隊權限功能暫時停用"
                  >
                    新增
                  </Button>
                  <Button
                    onClick={() => setShowAddTeam(false)}
                    variant="secondary"
                    size="sm"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}