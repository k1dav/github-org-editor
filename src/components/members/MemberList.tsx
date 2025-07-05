/**
 * 組織成員管理元件
 * 提供查看、新增、編輯和刪除組織成員的功能
 */
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Users, Crown, Edit3, Trash2 } from 'lucide-react'
import type { OrganizationMember } from '@/types/github'

/**
 * 成員列表元件
 * 
 * 功能包括：
 * - 顯示組織所有成員
 * - 新增新成員到組織
 * - 編輯成員角色（admin/member）
 * - 移除組織成員
 * - 顯示成員狀態（active/pending）
 * 
 * @returns JSX.Element
 */
export function MemberList() {
  // 取得當前使用者的認證會話
  const { data: session } = useSession()
  
  // 元件狀態管理
  const [members, setMembers] = useState<OrganizationMember[]>([]) // 組織成員列表
  const [loading, setLoading] = useState(true) // 載入狀態
  const [error, setError] = useState<string | null>(null) // 錯誤訊息
  const [editingMember, setEditingMember] = useState<string | null>(null) // 目前正在編輯的成員
  const [newMember, setNewMember] = useState({ // 新成員表單資料
    username: '', 
    role: 'member' as 'admin' | 'member' 
  })

  // 當使用者認證狀態改變時，重新載入成員資料
  useEffect(() => {
    if (session) {
      fetchMembers()
    }
  }, [session])

  /**
   * 從 API 取得組織成員列表
   * 更新 members 狀態並處理載入和錯誤狀態
   */
  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/members')
      if (!response.ok) throw new Error('Failed to fetch members')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch members')
      setMembers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 新增成員到組織
   * 驗證輸入資料，發送 API 請求，並更新本地狀態
   */
  const addMember = async () => {
    // 驗證使用者名稱不可為空
    if (!newMember.username.trim()) return

    try {
      // 發送新增成員的 API 請求
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) throw new Error('Failed to add member')
      
      // 清空表單並重新載入成員列表
      setNewMember({ username: '', role: 'member' })
      await fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    }
  }

  /**
   * 從組織中移除成員
   * 顯示確認對話框，成功後更新成員列表
   * 
   * @param username - 要移除的成員使用者名稱
   */
  const removeMember = async (username: string) => {
    // 要求使用者確認移除操作
    if (!confirm(`確定要移除成員 ${username} 嗎？`)) return

    try {
      // 發送刪除成員的 API 請求
      const response = await fetch(`/api/members/${username}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')
      
      // 重新載入成員列表
      await fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  /**
   * 更新成員在組織中的角色
   * 
   * @param username - 要更新的成員使用者名稱
   * @param role - 新的角色（admin 或 member）
   */
  const updateMemberRole = async (username: string, role: 'admin' | 'member') => {
    try {
      // 發送更新成員角色的 API 請求
      const response = await fetch(`/api/members/${username}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) throw new Error('Failed to update member role')
      
      // 退出編輯模式並重新載入成員列表
      setEditingMember(null)
      await fetchMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role')
    }
  }


  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">請先登入以管理組織成員</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">載入成員資料中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMembers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          重新載入
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 批次操作控制面板 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增成員
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="GitHub 使用者名稱"
            value={newMember.username}
            onChange={(e) => setNewMember(prev => ({ ...prev, username: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newMember.role}
            onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'admin' | 'member' }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={addMember}
            disabled={!newMember.username.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            新增
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            組織成員 ({members.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar_url}
                  alt={member.login}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{member.login}</h3>
                    {member.role === 'admin' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {member.state === 'pending' && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        待接受
                      </span>
                    )}
                  </div>
                  {member.name && (
                    <p className="text-gray-600">{member.name}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {member.role === 'admin' ? '管理員' : '成員'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingMember === member.login ? (
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={member.role}
                      onChange={(e) => updateMemberRole(member.login, e.target.value as 'admin' | 'member')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => setEditingMember(null)}
                      className="px-2 py-1 text-gray-600 hover:text-gray-800"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingMember(member.login)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeMember(member.login)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>目前沒有成員</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}