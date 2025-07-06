import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubClient } from '@/lib/github'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ repo: string }> }) {
  try {
    const { repo } = await params
    const { description } = await request.json()

    if (typeof description !== 'string') {
      return NextResponse.json({ error: 'Description must be a string' }, { status: 400 })
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
    const updatedRepo = await client.updateRepositoryDescription(repo, description)

    return NextResponse.json({
      success: true,
      data: updatedRepo,
    })
  } catch (error) {
    console.error('Error updating repository description:', error)

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ error: 'Failed to update repository description' }, { status: 500 })
  }
}
