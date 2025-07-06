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

    const { data: repositories } = await octokit.rest.teams.listReposInOrg({
      org,
      team_slug: slug,
      per_page: 100,
    })

    return NextResponse.json({
      success: true,
      data: repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        permissions: {
          admin: repo.permissions?.admin || false,
          maintain: repo.permissions?.maintain || false,
          push: repo.permissions?.push || false,
          triage: repo.permissions?.triage || false,
          pull: repo.permissions?.pull || false,
        },
        owner: {
          id: repo.owner.id,
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url,
          html_url: repo.owner.html_url,
          type: repo.owner.type,
          site_admin: repo.owner.site_admin,
        },
      })),
    })
  } catch (error) {
    console.error('Failed to fetch team repositories:', error)
    return NextResponse.json({ error: 'Failed to fetch team repositories' }, { status: 500 })
  }
}
