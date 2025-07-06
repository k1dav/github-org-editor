/**
 * 組織成員管理 API 路由
 * 提供取得組織成員列表和新增成員的功能
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubClient } from '@/lib/github'

/**
 * GET /api/members
 * 取得組織所有成員列表
 *
 * @param request - Next.js 請求物件
 * @returns 成員列表 JSON 回應
 *
 * 需要：
 * - 有效的使用者認證會話
 * - GitHub access token
 * - 環境變數中設定的組織名稱
 */
export async function GET(request: NextRequest) {
  try {
    // 檢查使用者認證狀態
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查組織配置
    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    // 建立 GitHub 客戶端並取得成員列表
    const github = new GitHubClient(session.accessToken, org)
    const members = await github.getOrganizationMembers()

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch members' }, { status: 500 })
  }
}

/**
 * POST /api/members
 * 新增成員到組織
 *
 * @param request - Next.js 請求物件，body 包含 { username: string, role?: 'admin' | 'member' }
 * @returns 操作成功回應
 *
 * 需要：
 * - 有效的使用者認證會話
 * - 請求 body 中包含有效的 username
 * - 使用者需要有組織管理權限
 */
export async function POST(request: NextRequest) {
  try {
    // 檢查使用者認證狀態
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查組織配置
    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    // 解析請求資料
    const { username, role } = await request.json()

    // 驗證必要欄位
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // 執行新增成員操作
    const github = new GitHubClient(session.accessToken, org)
    await github.addMemberToOrganization(username, role || 'member')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
  }
}
