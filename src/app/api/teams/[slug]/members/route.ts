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

    const { data: members } = await octokit.rest.teams.listMembersInOrg({
      org,
      team_slug: slug,
      per_page: 100,
    })

    // Get detailed member roles
    const membersWithRoles = await Promise.all(
      members.map(async member => {
        try {
          const { data: membership } = await octokit.rest.teams.getMembershipForUserInOrg({
            org,
            team_slug: slug,
            username: member.login,
          })
          return {
            id: member.id,
            login: member.login,
            avatar_url: member.avatar_url,
            html_url: member.html_url,
            type: member.type,
            site_admin: member.site_admin,
            role: membership.role,
          }
        } catch (error) {
          // If we can't get membership details, use default
          return {
            id: member.id,
            login: member.login,
            avatar_url: member.avatar_url,
            html_url: member.html_url,
            type: member.type,
            site_admin: member.site_admin,
            role: 'member' as const,
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: membersWithRoles,
    })
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

export async function POST(
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
    const { username, role } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
      org,
      team_slug: slug,
      username,
      role: role || 'member',
    })

    return NextResponse.json({
      success: true,
      message: 'Member added to team successfully',
    })
  } catch (error) {
    console.error('Failed to add team member:', error)
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 })
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
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    await octokit.rest.teams.removeMembershipForUserInOrg({
      org,
      team_slug: slug,
      username,
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed from team successfully',
    })
  } catch (error) {
    console.error('Failed to remove team member:', error)
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
  }
}
