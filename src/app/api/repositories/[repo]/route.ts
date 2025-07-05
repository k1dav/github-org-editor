import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubClient } from '@/lib/github'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { repo: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    const { repo } = params
    const body = await request.json()
    const { description } = body

    if (description === undefined) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    const github = new GitHubClient(session.accessToken, org)
    
    // 更新儲存庫描述
    const updatedRepo = await github.updateRepositoryDescription(repo, description)

    return NextResponse.json({
      success: true,
      data: updatedRepo
    })
  } catch (error) {
    console.error('Failed to update repository description:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update repository description' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await params
    const { newName } = await request.json()

    if (!newName || typeof newName !== 'string') {
      return NextResponse.json(
        { error: 'New repository name is required' },
        { status: 400 }
      )
    }

    // 驗證新名稱格式
    if (!/^[a-zA-Z0-9._-]+$/.test(newName)) {
      return NextResponse.json(
        { error: 'Repository name can only contain letters, numbers, dots, underscores, and hyphens' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    const client = new GitHubClient(session.accessToken, org)
    const updatedRepo = await client.updateRepositoryName(repo, newName)

    return NextResponse.json({
      success: true,
      data: updatedRepo
    })
  } catch (error) {
    console.error('Error updating repository name:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('422')) {
        return NextResponse.json(
          { error: 'Repository name already exists or is invalid' },
          { status: 422 }
        )
      }
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update repository name' },
      { status: 500 }
    )
  }
} 