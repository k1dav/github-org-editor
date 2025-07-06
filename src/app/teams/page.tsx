'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Users,
  Settings,
  Trash2,
  Edit,
  GitBranch,
  UserPlus,
  GitBranchPlus,
  Edit3,
} from 'lucide-react'
import { Input, Textarea, Select, Button } from '@/components/ui/FormElements'
import type { Team, TeamMember, Repository, OrganizationMember } from '@/types/github'

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showRepositoryModal, setShowRepositoryModal] = useState(false)
  const [editingRepo, setEditingRepo] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState<string>('')

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTeamDetails = async (teamSlug: string) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(prevTeams => prevTeams.map(team => (team.slug === teamSlug ? data.data : team)))
      }
    } catch (error) {
      console.error(`Failed to update team details for ${teamSlug}:`, error)
    }
  }

  // 優化：只更新特定團隊的成員計數
  const updateTeamMemberCount = async (teamSlug: string) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(prevTeams =>
          prevTeams.map(team =>
            team.slug === teamSlug ? { ...team, members_count: data.data.members_count } : team
          )
        )
      }
    } catch (error) {
      console.error(`Failed to update team member count for ${teamSlug}:`, error)
    }
  }

  // 優化：只更新特定團隊的儲存庫計數
  const updateTeamRepositoryCount = async (teamSlug: string) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(prevTeams =>
          prevTeams.map(team =>
            team.slug === teamSlug ? { ...team, repos_count: data.data.repos_count } : team
          )
        )
      }
    } catch (error) {
      console.error(`Failed to update team repository count for ${teamSlug}:`, error)
    }
  }

  const handleCreateTeam = async (teamData: Partial<Team>) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      })

      if (response.ok) {
        const result = await response.json()
        // 新增團隊後，將新團隊加入列表
        setTeams(prevTeams => [...prevTeams, result.data])
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleEditTeam = async (teamData: Partial<Team>) => {
    if (!selectedTeam) return

    try {
      const response = await fetch(`/api/teams/${selectedTeam.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      })

      if (response.ok) {
        const result = await response.json()
        // 更新特定團隊的資訊
        setTeams(prevTeams =>
          prevTeams.map(team => (team.slug === selectedTeam.slug ? result.team : team))
        )
        setShowEditForm(false)
        setSelectedTeam(null)
      }
    } catch (error) {
      console.error('Failed to update team:', error)
    }
  }

  const handleDeleteTeam = async (teamSlug: string) => {
    if (!confirm('確定要刪除此團隊嗎？')) return

    try {
      const response = await fetch(`/api/teams/${teamSlug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 從列表中移除被刪除的團隊
        setTeams(prevTeams => prevTeams.filter(team => team.slug !== teamSlug))
      }
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-300"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">團隊管理</h1>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增團隊
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">尚無團隊</h3>
          <p className="mb-4 text-gray-500">建立第一個團隊來開始組織您的成員</p>
          <Button onClick={() => setShowCreateForm(true)}>建立團隊</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <div
              key={team.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{team.name}</h3>
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-1 text-xs ${
                        team.privacy === 'secret'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {team.privacy === 'secret' ? '秘密' : '公開'}
                    </span>
                  </div>
                  {team.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{team.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{team.members_count} 位成員</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GitBranch className="h-4 w-4" />
                  <span>{team.repos_count} 個儲存庫</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">權限:</span> {team.permission}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTeam(team)
                      setShowMemberModal(true)
                    }}
                    className="rounded p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="管理成員"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTeam(team)
                      setShowRepositoryModal(true)
                    }}
                    className="rounded p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    title="管理儲存庫"
                  >
                    <GitBranch className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTeam(team)
                      setShowEditForm(true)
                    }}
                    className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                    title="編輯團隊"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.slug)}
                  className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="刪除團隊"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateTeamModal onClose={() => setShowCreateForm(false)} onSubmit={handleCreateTeam} />
      )}

      {showEditForm && selectedTeam && (
        <EditTeamModal
          team={selectedTeam}
          onClose={() => {
            setShowEditForm(false)
            setSelectedTeam(null)
          }}
          onSubmit={handleEditTeam}
        />
      )}

      {showMemberModal && selectedTeam && (
        <TeamMemberModal
          team={selectedTeam}
          onClose={() => {
            setShowMemberModal(false)
            setSelectedTeam(null)
          }}
          onUpdate={() => updateTeamMemberCount(selectedTeam.slug)}
        />
      )}

      {showRepositoryModal && selectedTeam && (
        <TeamRepositoryModal
          team={selectedTeam}
          onClose={() => {
            setShowRepositoryModal(false)
            setSelectedTeam(null)
          }}
          onUpdate={() => updateTeamRepositoryCount(selectedTeam.slug)}
        />
      )}
    </div>
  )
}

function CreateTeamModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: Partial<Team>) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'closed' as 'secret' | 'closed',
    permission: 'pull' as Team['permission'],
  })

  // 添加 ESC 鍵退出功能
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">建立新團隊</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">團隊名稱</label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">隱私設定</label>
            <Select
              value={formData.privacy}
              onChange={e =>
                setFormData({ ...formData, privacy: e.target.value as 'secret' | 'closed' })
              }
            >
              <option value="closed">封閉 - 團隊成員可見</option>
              <option value="secret">秘密 - 完全隱藏</option>
            </Select>
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">預設權限</label>
            <Select
              value={formData.permission}
              onChange={e =>
                setFormData({ ...formData, permission: e.target.value as Team['permission'] })
              }
            >
              <option value="pull">Pull - 讀取權限</option>
              <option value="triage">Triage - 分類權限</option>
              <option value="push">Push - 寫入權限</option>
              <option value="maintain">Maintain - 維護權限</option>
              <option value="admin">Admin - 管理權限</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="secondary">
              取消
            </Button>
            <Button type="submit">建立</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditTeamModal({
  team,
  onClose,
  onSubmit,
}: {
  team: Team
  onClose: () => void
  onSubmit: (data: Partial<Team>) => void
}) {
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description || '',
    privacy: team.privacy,
    permission: team.permission,
  })

  // 添加 ESC 鍵退出功能
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">編輯團隊</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">團隊名稱</label>
            <Input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">隱私設定</label>
            <Select
              value={formData.privacy}
              onChange={e =>
                setFormData({ ...formData, privacy: e.target.value as 'secret' | 'closed' })
              }
            >
              <option value="closed">封閉 - 團隊成員可見</option>
              <option value="secret">秘密 - 完全隱藏</option>
            </Select>
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">預設權限</label>
            <Select
              value={formData.permission}
              onChange={e =>
                setFormData({ ...formData, permission: e.target.value as Team['permission'] })
              }
            >
              <option value="pull">Pull - 讀取權限</option>
              <option value="triage">Triage - 分類權限</option>
              <option value="push">Push - 寫入權限</option>
              <option value="maintain">Maintain - 維護權限</option>
              <option value="admin">Admin - 管理權限</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="secondary">
              取消
            </Button>
            <Button type="submit">更新</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamMemberModal({
  team,
  onClose,
  onUpdate,
}: {
  team: Team
  onClose: () => void
  onUpdate: () => void
}) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [allMembers, setAllMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    username: '',
    role: 'member' as 'member' | 'maintainer',
  })

  // 添加 ESC 鍵退出功能
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    loadMembers()
    loadAllMembers()
  }, [team.slug])

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/teams/${team.slug}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setAllMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load all members:', error)
    }
  }

  const addMember = async () => {
    if (!newMember.username) return

    try {
      const response = await fetch(`/api/teams/${team.slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })

      if (response.ok) {
        await loadMembers()
        onUpdate()
        setNewMember({ username: '', role: 'member' })
        setShowAddMember(false)
      }
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const updateMemberRole = async (username: string, role: 'member' | 'maintainer') => {
    try {
      const response = await fetch(`/api/teams/${team.slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role }),
      })

      if (response.ok) {
        await loadMembers()
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to update member role:', error)
    }
  }

  const removeMember = async (username: string) => {
    if (!confirm(`確定要將 ${username} 從團隊中移除嗎？`)) return

    try {
      const response = await fetch(`/api/teams/${team.slug}/members?username=${username}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadMembers()
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const availableMembers = allMembers.filter(
    member => !members.some(teamMember => teamMember.login === member.login)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{team.name} - 成員管理</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">團隊成員</h3>
            <p className="text-sm text-gray-500">點擊下拉選單調整成員權限</p>
          </div>
          <Button
            onClick={() => setShowAddMember(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            新增成員
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">載入中...</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center text-gray-500">此團隊尚無成員</div>
        ) : (
          <div className="mb-6 space-y-3">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar_url}
                    alt={member.login}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{member.login}</div>
                    {member.name && <div className="text-sm text-gray-500">{member.name}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onChange={e =>
                      updateMemberRole(member.login, e.target.value as 'member' | 'maintainer')
                    }
                    fullWidth={false}
                    className="min-w-[120px] text-xs"
                  >
                    <option value="member">成員 - 一般權限</option>
                    <option value="maintainer">維護者 - 管理權限</option>
                  </Select>
                  <button
                    onClick={() => removeMember(member.login)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="移除成員"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddMember && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 font-medium">新增成員</h4>
            <div className="mb-3 flex gap-3">
              <Select
                value={newMember.username}
                onChange={e => setNewMember({ ...newMember, username: e.target.value })}
                fullWidth={false}
                className="min-w-[200px]"
              >
                <option value="">選擇成員</option>
                {availableMembers.map(member => (
                  <option key={member.id} value={member.login}>
                    {member.login} {member.name && `(${member.name})`}
                  </option>
                ))}
              </Select>
              <Select
                value={newMember.role}
                onChange={e =>
                  setNewMember({ ...newMember, role: e.target.value as 'member' | 'maintainer' })
                }
                fullWidth={false}
              >
                <option value="member">成員 - 一般權限</option>
                <option value="maintainer">維護者 - 管理權限</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addMember} disabled={!newMember.username} size="sm">
                新增
              </Button>
              <Button onClick={() => setShowAddMember(false)} variant="secondary" size="sm">
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamRepositoryModal({
  team,
  onClose,
  onUpdate,
}: {
  team: Team
  onClose: () => void
  onUpdate: () => void
}) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [allRepositories, setAllRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddRepository, setShowAddRepository] = useState(false)
  const [newRepository, setNewRepository] = useState({ name: '', permission: 'pull' as string })
  const [editingRepo, setEditingRepo] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState<string>('')

  // 添加 ESC 鍵退出功能
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    loadRepositories()
    loadAllRepositories()
  }, [team.slug])

  const loadRepositories = async () => {
    try {
      const response = await fetch(`/api/teams/${team.slug}/repositories`)
      if (response.ok) {
        const data = await response.json()
        setRepositories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load team repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllRepositories = async () => {
    try {
      const response = await fetch('/api/repositories')
      if (response.ok) {
        const data = await response.json()
        setAllRepositories(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load all repositories:', error)
    }
  }

  const addRepository = async () => {
    if (!newRepository.name) return

    try {
      const response = await fetch(`/api/teams/${team.slug}/repositories/${newRepository.name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission: newRepository.permission }),
      })

      if (response.ok) {
        await loadRepositories()
        onUpdate()
        setNewRepository({ name: '', permission: 'pull' })
        setShowAddRepository(false)
      }
    } catch (error) {
      console.error('Failed to add repository:', error)
    }
  }

  const removeRepository = async (repoName: string) => {
    if (!confirm(`確定要將 ${repoName} 從團隊中移除嗎？`)) return

    try {
      const response = await fetch(`/api/teams/${team.slug}/repositories/${repoName}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadRepositories()
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to remove repository:', error)
    }
  }

  const updateRepositoryPermission = async (repoName: string, permission: string) => {
    try {
      const response = await fetch(`/api/teams/${team.slug}/repositories/${repoName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission }),
      })

      if (response.ok) {
        await loadRepositories()
        // 權限變更不需要更新團隊計數，因為儲存庫數量沒有改變
      }
    } catch (error) {
      console.error('Failed to update repository permission:', error)
    }
  }

  const availableRepositories = allRepositories.filter(
    repo => !repositories.some(teamRepo => teamRepo.name === repo.name)
  )

  const permissionOptions = [
    { value: 'pull', label: 'Pull - 讀取權限' },
    { value: 'triage', label: 'Triage - 分類問題和 PR' },
    { value: 'push', label: 'Push - 讀取和寫入' },
    { value: 'maintain', label: 'Maintain - 管理儲存庫' },
    { value: 'admin', label: 'Admin - 完整管理權限' },
  ]

  const saveDescription = async (repoName: string) => {
    try {
      const response = await fetch(`/api/repositories/${repoName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription }),
      })
      if (response.ok) {
        setRepositories((prev: Repository[]) =>
          prev.map(r => (r.name === repoName ? { ...r, description: editDescription } : r))
        )
        setEditingRepo(null)
        setEditDescription('')
        onUpdate()
      }
    } catch (error) {
      // 可加錯誤提示
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{team.name} - 儲存庫管理</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">團隊儲存庫</h3>
            <p className="text-sm text-gray-500">點擊下拉選單調整儲存庫權限</p>
          </div>
          <Button
            onClick={() => setShowAddRepository(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <GitBranchPlus className="h-4 w-4" />
            新增儲存庫
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center">載入中...</div>
        ) : repositories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">此團隊尚無儲存庫</div>
        ) : (
          <div className="mb-6 space-y-3">
            {repositories.map(repo => (
              <div
                key={repo.id}
                className="flex items-center justify-between rounded border border-gray-200 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <GitBranch className="h-8 w-8 text-gray-400" />
                  <div className="max-w-xs truncate font-medium" title={repo.name}>
                    {repo.name}
                  </div>
                  {editingRepo === repo.name ? (
                    <>
                      <input
                        className="max-w-xs rounded border border-gray-300 px-2 py-1 text-sm"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveDescription(repo.name)} className="ml-1">
                        儲存
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingRepo(null)
                          setEditDescription('')
                        }}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      {repo.description && (
                        <div
                          className="max-w-xs truncate text-sm text-gray-500"
                          title={repo.description}
                        >
                          {repo.description}
                        </div>
                      )}
                      <button
                        className="ml-1 p-1 text-gray-400 hover:text-blue-600"
                        title="編輯描述"
                        onClick={() => {
                          setEditingRepo(repo.name)
                          setEditDescription(repo.description || '')
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={
                      repo.permissions.admin
                        ? 'admin'
                        : repo.permissions.maintain
                          ? 'maintain'
                          : repo.permissions.push
                            ? 'push'
                            : repo.permissions.triage
                              ? 'triage'
                              : 'pull'
                    }
                    onChange={e => updateRepositoryPermission(repo.name, e.target.value)}
                    fullWidth={false}
                    className="min-w-[150px]"
                  >
                    {permissionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <button
                    onClick={() => removeRepository(repo.name)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="移除儲存庫"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddRepository && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 font-medium">新增儲存庫</h4>
            <div className="mb-3 flex gap-3">
              <Select
                value={newRepository.name}
                onChange={e => setNewRepository({ ...newRepository, name: e.target.value })}
                fullWidth={false}
                className="min-w-[200px]"
              >
                <option value="">選擇儲存庫</option>
                {availableRepositories
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(repo => (
                    <option key={repo.id} value={repo.name}>
                      {repo.name} {repo.description && `(${repo.description.slice(0, 30)}...)`}
                    </option>
                  ))}
              </Select>
              <Select
                value={newRepository.permission}
                onChange={e => setNewRepository({ ...newRepository, permission: e.target.value })}
                fullWidth={false}
              >
                {permissionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addRepository} disabled={!newRepository.name} size="sm">
                新增
              </Button>
              <Button onClick={() => setShowAddRepository(false)} variant="secondary" size="sm">
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
