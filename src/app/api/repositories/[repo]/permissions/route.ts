import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Octokit } from '@octokit/rest'

export async function GET(request: NextRequest, { params }: { params: Promise<{ repo: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repo } = await params

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    // Get all repository teams with pagination
    const teams: any[] = []
    let teamsPage = 1
    while (true) {
      const { data: teamsData } = await octokit.rest.repos.listTeams({
        owner: org,
        repo,
        per_page: 100,
        page: teamsPage,
      })

      if (teamsData.length === 0) break
      teams.push(...teamsData)
      teamsPage++
    }

    // Get all repository collaborators with pagination
    const collaborators: any[] = []
    let collaboratorsPage = 1
    while (true) {
      const { data: collaboratorsData } = await octokit.rest.repos.listCollaborators({
        owner: org,
        repo,
        per_page: 100,
        page: collaboratorsPage,
      })

      if (collaboratorsData.length === 0) break
      collaborators.push(...collaboratorsData)
      collaboratorsPage++
    }

    // Get all organization members for potential collaborators list
    const orgMembers: any[] = []
    let membersPage = 1
    while (true) {
      const { data: membersData } = await octokit.rest.orgs.listMembers({
        org,
        per_page: 100,
        page: membersPage,
      })

      if (membersData.length === 0) break
      orgMembers.push(...membersData)
      membersPage++
    }

    const userPermissions = collaborators.map(collaborator => ({
      type: 'user' as const,
      user: {
        id: collaborator.id,
        login: collaborator.login,
        avatar_url: collaborator.avatar_url,
        html_url: collaborator.html_url,
        type: collaborator.type,
        site_admin: collaborator.site_admin,
      },
      team: null,
      repository: {
        id: 0, // Will be filled by the frontend
        name: repo,
        full_name: `${org}/${repo}`,
      },
      permission: collaborator.role_name || 'read',
    }))

    const teamPermissions = teams.map(team => ({
      type: 'team' as const,
      user: null,
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description,
        privacy: team.privacy,
        permission: team.permission,
        members_count: 0, // Will be fetched separately if needed
        repos_count: 0, // Will be fetched separately if needed
        html_url: team.html_url,
      },
      repository: {
        id: 0, // Will be filled by the frontend
        name: repo,
        full_name: `${org}/${repo}`,
      },
      permission: team.permission || 'read',
    }))

    const allPermissions = [...userPermissions, ...teamPermissions]

    // Get potential collaborators (org members who are not already collaborators)
    const potentialCollaborators = orgMembers
      .filter(member => !collaborators.some(collaborator => collaborator.login === member.login))
      .map(member => ({
        id: member.id,
        login: member.login,
        avatar_url: member.avatar_url,
        html_url: member.html_url,
        type: member.type,
        site_admin: member.site_admin,
        name: member.name || undefined,
      }))

    return NextResponse.json({
      success: true,
      permissions: allPermissions,
      potentialCollaborators,
    })
  } catch (error) {
    console.error('Failed to fetch repository permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch repository permissions' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ repo: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repo } = await params
    const body = await request.json()
    const { type, name, permission } = body

    if (!type || !name || !permission) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate permission values
    const validPermissions = ['read', 'triage', 'write', 'maintain', 'admin']
    if (!validPermissions.includes(permission)) {
      return NextResponse.json({ error: 'Invalid permission value' }, { status: 400 })
    }

    // Validate type values
    if (!['user', 'team'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type value. Must be "user" or "team"' },
        { status: 400 }
      )
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    if (type === 'user') {
      await octokit.rest.repos.addCollaborator({
        owner: org,
        repo,
        username: name,
        permission,
      })
    } else if (type === 'team') {
      await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org: org,
        owner: org,
        team_slug: name,
        repo: repo,
        permission: permission,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Permission updated successfully',
    })
  } catch (error) {
    console.error('Failed to update repository permission:', error)
    return NextResponse.json({ error: 'Failed to update repository permission' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { repo } = await params
    const body = await request.json()
    const { type, name } = body

    if (!type || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const org = process.env.GITHUB_ORG
    if (!org) {
      return NextResponse.json({ error: 'GitHub organization not configured' }, { status: 500 })
    }

    if (type === 'user') {
      await octokit.rest.repos.removeCollaborator({
        owner: org,
        repo,
        username: name,
      })
    } else if (type === 'team') {
      await octokit.rest.teams.removeRepoInOrg({
        org,
        team_slug: name,
        owner: org,
        repo,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Permission removed successfully',
    })
  } catch (error) {
    console.error('Failed to remove repository permission:', error)
    return NextResponse.json({ error: 'Failed to remove repository permission' }, { status: 500 })
  }
}
