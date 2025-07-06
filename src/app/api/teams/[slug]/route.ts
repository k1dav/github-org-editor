import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    // 取得團隊詳細資訊
    const { data: team } = await octokit.rest.teams.getByName({
      org,
      team_slug: slug,
    })

    // 取得團隊成員數量
    const { data: members } = await octokit.rest.teams.listMembersInOrg({
      org,
      team_slug: slug,
      per_page: 100,
    })

    // 取得團隊儲存庫數量
    const { data: repos } = await octokit.rest.teams.listReposInOrg({
      org,
      team_slug: slug,
      per_page: 100,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        privacy: team.privacy,
        permission: team.permission,
        members_count: members.length,
        repos_count: repos.length,
        html_url: team.html_url,
      },
    })
  } catch (error) {
    console.error('Failed to fetch team details:', error)
    return NextResponse.json({ error: 'Failed to fetch team details' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    await octokit.rest.teams.deleteInOrg({
      org,
      team_slug: slug,
    })

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete team:', error)
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { name, description, privacy, permission } = body

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    const { data: team } = await octokit.rest.teams.updateInOrg({
      org,
      team_slug: slug,
      name: name || undefined,
      description: description || undefined,
      privacy: privacy || undefined,
      permission: permission || undefined,
    })

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        privacy: team.privacy,
        permission: team.permission,
        members_count: team.members_count,
        repos_count: team.repos_count,
        html_url: team.html_url,
      },
    })
  } catch (error) {
    console.error('Failed to update team:', error)
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
  }
}
