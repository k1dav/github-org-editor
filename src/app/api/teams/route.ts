import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { GitHubClient } from '@/lib/github'
import { Octokit } from '@octokit/rest'

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

    const github = new GitHubClient(session.accessToken, org)
    const teams = await github.getOrganizationTeams()

    return NextResponse.json({
      success: true,
      data: teams
    })
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, privacy } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const { data: team } = await octokit.rest.teams.create({
      org,
      name,
      description: description || undefined,
      privacy: privacy || 'closed',
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
        members_count: team.members_count || 0,
        repos_count: team.repos_count || 0,
        html_url: team.html_url,
      }
    })
  } catch (error) {
    console.error('Failed to create team:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    )
  }
}