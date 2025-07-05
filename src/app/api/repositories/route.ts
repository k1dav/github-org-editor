import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubClient } from '@/lib/github'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    // 檢查查詢參數
    const { searchParams } = new URL(request.url)
    const ownerOnly = searchParams.get('ownerOnly') === 'true'

    const github = new GitHubClient(session.accessToken, org)
    
    // 根據查詢參數決定要取得哪種儲存庫
    const repositories = ownerOnly 
      ? await github.getOwnerOnlyRepositories()
      : await github.getOrganizationRepositories()

    return NextResponse.json({
      success: true,
      data: repositories
    })
  } catch (error) {
    console.error('Failed to fetch repositories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}