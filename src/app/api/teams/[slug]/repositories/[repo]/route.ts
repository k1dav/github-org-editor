import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, repo } = await params
    const body = await request.json()
    const { permission } = body

    if (!permission) {
      return NextResponse.json({ error: 'Permission is required' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
      org,
      team_slug: slug,
      owner: org,
      repo,
      permission,
    })

    return NextResponse.json({
      success: true,
      message: 'Repository permission updated successfully',
    })
  } catch (error) {
    console.error('Failed to update repository permission:', error)
    return NextResponse.json({ error: 'Failed to update repository permission' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug, repo } = await params

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    await octokit.rest.teams.removeRepoInOrg({
      org,
      team_slug: slug,
      owner: org,
      repo,
    })

    return NextResponse.json({
      success: true,
      message: 'Repository removed from team successfully',
    })
  } catch (error) {
    console.error('Failed to remove repository from team:', error)
    return NextResponse.json({ error: 'Failed to remove repository from team' }, { status: 500 })
  }
}
