/**
 * GitHub API 客戶端
 * 提供與 GitHub REST API 互動的封裝類別
 * 主要用於管理組織成員、團隊和儲存庫權限
 */

import { Octokit } from '@octokit/rest'
import type {
  GitHubUser,
  OrganizationMember,
  Team,
  Repository,
  TeamMember,
  RepositoryPermission,
} from '@/types/github'

/**
 * GitHub 客戶端類別
 * 封裝了所有與 GitHub API 的互動邏輯
 *
 * @example
 * ```typescript
 * const client = new GitHubClient('your-access-token', 'your-org')
 * const members = await client.getOrganizationMembers()
 * ```
 */
export class GitHubClient {
  /** Octokit 實例，用於實際的 API 呼叫 */
  private octokit: Octokit
  /** 目標組織名稱 */
  private org: string

  /**
   * 建構函式
   *
   * @param accessToken - GitHub Personal Access Token 或 OAuth token
   * @param org - 目標組織名稱
   *
   * @throws {Error} 當 accessToken 或 org 為空時拋出錯誤
   */
  constructor(accessToken: string, org: string) {
    if (!accessToken) {
      throw new Error('Access token is required')
    }
    if (!org) {
      throw new Error('Organization name is required')
    }

    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: 'github-org-editor/1.0.0',
    })
    this.org = org
  }

  /**
   * 取得組織所有成員列表
   * 包含每個成員的角色和狀態資訊
   *
   * @returns Promise<OrganizationMember[]> 組織成員陣列
   * @throws {Error} 當 API 呼叫失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * const members = await client.getOrganizationMembers()
   * console.log(`組織有 ${members.length} 個成員`)
   * ```
   */
  async getOrganizationMembers(): Promise<OrganizationMember[]> {
    try {
      console.log(`Fetching members for organization: ${this.org}`)

      // 取得組織成員基本列表，使用分頁
      const members: any[] = []
      let page = 1

      while (true) {
        const { data } = await this.octokit.orgs.listMembers({
          org: this.org,
          per_page: 100,
          page,
        })

        if (data.length === 0) break
        members.push(...data)
        page++
      }

      console.log(`Found ${members.length} members`)

      // 並行取得每個成員的詳細角色資訊
      const membersWithRoles = await Promise.all(
        members.map(async member => {
          try {
            // 取得成員在組織中的詳細資訊（角色、狀態等）
            const { data: membership } = await this.octokit.orgs.getMembershipForUser({
              org: this.org,
              username: member.login,
            })

            // 成功取得詳細資訊，回傳完整的成員資料
            return {
              id: member.id,
              login: member.login,
              avatar_url: member.avatar_url,
              html_url: member.html_url,
              type: member.type as 'User' | 'Bot',
              site_admin: member.site_admin,
              name: member.name || undefined,
              email: member.email || undefined,
              role: membership.role as 'admin' | 'member',
              state: membership.state as 'active' | 'pending',
            }
          } catch (error) {
            console.warn(`Cannot get membership details for ${member.login}:`, error)
            // 無法取得詳細資訊時，使用預設值
            // 這通常發生在權限不足或成員設定為私人時
            return {
              id: member.id,
              login: member.login,
              avatar_url: member.avatar_url,
              html_url: member.html_url,
              type: member.type as 'User' | 'Bot',
              site_admin: member.site_admin,
              name: member.name || undefined,
              email: member.email || undefined,
              role: 'member' as const, // 預設為一般成員
              state: 'active' as const, // 預設為已啟用狀態
            }
          }
        })
      )

      console.log(`Returning ${membersWithRoles.length} members with roles`)
      return membersWithRoles
    } catch (error) {
      console.error('Error fetching organization members:', error)
      throw new Error(
        `Failed to fetch organization members: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * 取得組織所有團隊列表
   *
   * @returns Promise<Team[]> 團隊陣列
   * @throws {Error} 當 API 呼叫失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * const teams = await client.getOrganizationTeams()
   * console.log(`組織有 ${teams.length} 個團隊`)
   * ```
   */
  async getOrganizationTeams(): Promise<Team[]> {
    try {
      // 取得組織所有團隊的基本資訊，使用分頁
      const teams: any[] = []
      let page = 1

      while (true) {
        const { data } = await this.octokit.teams.list({
          org: this.org,
          per_page: 100,
          page,
        })

        if (data.length === 0) break
        teams.push(...data)
        page++
      }

      // 將 API 回應轉換為我們的 Team 介面格式，先不獲取詳細計數以提高性能
      const formattedTeams = teams.map(team => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        description: team.description || undefined,
        privacy: team.privacy as 'secret' | 'closed',
        permission: team.permission as 'pull' | 'triage' | 'push' | 'maintain' | 'admin',
        members_count: 0, // 可以後續獲取，避免太多 API 調用
        repos_count: 0, // 可以後續獲取，避免太多 API 調用
        html_url: team.html_url,
      }))

      return formattedTeams
    } catch (error) {
      console.error('Error fetching organization teams:', error)
      throw new Error(
        `Failed to fetch organization teams: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getTeamMembers(teamSlug: string): Promise<TeamMember[]> {
    try {
      // 取得團隊所有成員，使用分頁
      const members: any[] = []
      let page = 1

      while (true) {
        const { data } = await this.octokit.teams.listMembersInOrg({
          org: this.org,
          team_slug: teamSlug,
          per_page: 100,
          page,
        })

        if (data.length === 0) break
        members.push(...data)
        page++
      }

      const membersWithRoles = await Promise.all(
        members.map(async member => {
          try {
            const { data: membership } = await this.octokit.teams.getMembershipForUserInOrg({
              org: this.org,
              team_slug: teamSlug,
              username: member.login,
            })

            return {
              id: member.id,
              login: member.login,
              avatar_url: member.avatar_url,
              html_url: member.html_url,
              type: member.type as 'User' | 'Bot',
              site_admin: member.site_admin,
              name: member.name || undefined,
              email: member.email || undefined,
              role: membership.role as 'member' | 'maintainer',
            }
          } catch (error) {
            return {
              id: member.id,
              login: member.login,
              avatar_url: member.avatar_url,
              html_url: member.html_url,
              type: member.type as 'User' | 'Bot',
              site_admin: member.site_admin,
              name: member.name || undefined,
              email: member.email || undefined,
              role: 'member' as const,
            }
          }
        })
      )

      return membersWithRoles
    } catch (error) {
      console.error('Error fetching team members:', error)
      throw error
    }
  }

  async getOrganizationRepositories(): Promise<Repository[]> {
    try {
      // 取得組織所有儲存庫，使用分頁
      const repositories: any[] = []
      let page = 1

      while (true) {
        const { data } = await this.octokit.repos.listForOrg({
          org: this.org,
          per_page: 100,
          sort: 'updated',
          direction: 'desc',
          page,
        })

        if (data.length === 0) break
        repositories.push(...data)
        page++
      }

      return repositories.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || undefined,
        private: repo.private,
        html_url: repo.html_url,
        default_branch: repo.default_branch || 'main',
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
          type: repo.owner.type as 'User' | 'Bot',
          site_admin: repo.owner.site_admin,
        },
      }))
    } catch (error) {
      console.error('Error fetching organization repositories:', error)
      throw error
    }
  }

  async getRepositoryCollaborators(repoName: string): Promise<RepositoryPermission[]> {
    try {
      // 取得儲存庫所有協作者，使用分頁
      const collaborators: any[] = []
      let page = 1

      while (true) {
        const { data } = await this.octokit.repos.listCollaborators({
          owner: this.org,
          repo: repoName,
          per_page: 100,
          page,
        })

        if (data.length === 0) break
        collaborators.push(...data)
        page++
      }

      const repository: Repository = {
        id: 0,
        name: repoName,
        full_name: `${this.org}/${repoName}`,
        private: false,
        html_url: `https://github.com/${this.org}/${repoName}`,
        default_branch: 'main',
        permissions: {
          admin: false,
          maintain: false,
          push: false,
          triage: false,
          pull: false,
        },
        owner: {
          id: 0,
          login: this.org,
          avatar_url: '',
          html_url: `https://github.com/${this.org}`,
          type: 'User',
          site_admin: false,
        },
      }

      return collaborators.map(collaborator => ({
        type: 'user' as const,
        user: {
          id: collaborator.id,
          login: collaborator.login,
          avatar_url: collaborator.avatar_url,
          html_url: collaborator.html_url,
          type: collaborator.type as 'User' | 'Bot',
          site_admin: collaborator.site_admin,
        },
        team: null,
        repository,
        permission: collaborator.permissions?.admin
          ? 'admin'
          : collaborator.permissions?.maintain
            ? 'maintain'
            : collaborator.permissions?.push
              ? 'write'
              : collaborator.permissions?.triage
                ? 'triage'
                : 'read',
      }))
    } catch (error) {
      console.error('Error fetching repository collaborators:', error)
      throw error
    }
  }

  async getOwnerOnlyRepositories(): Promise<Repository[]> {
    const repos = await this.getOrganizationRepositories()
    const ownerOnlyRepos: Repository[] = []

    for (const repo of repos) {
      try {
        // 只檢查是否有團隊協作
        const hasTeamCollaboration = await this.hasTeamCollaboration(repo.name)

        // 條件：沒有團隊協作
        if (!hasTeamCollaboration) {
          ownerOnlyRepos.push(repo)
        }
      } catch (error) {
        console.error(`Error checking team collaboration for ${repo.name}:`, error)
      }
    }

    return ownerOnlyRepos
  }

  /**
   * 檢查儲存庫是否有團隊協作
   *
   * @param repoName - 儲存庫名稱
   * @returns Promise<boolean> 是否有團隊協作
   */
  async hasTeamCollaboration(repoName: string): Promise<boolean> {
    try {
      // 直接取得此儲存庫的團隊權限
      const { data: teams } = await this.octokit.repos.listTeams({
        owner: this.org,
        repo: repoName,
        per_page: 100,
      })

      // 如果有任何團隊有此儲存庫的權限，則有團隊協作
      return teams.length > 0
    } catch (error) {
      console.error(`Error checking team collaboration for ${repoName}:`, error)
      return false // 發生錯誤時假設沒有團隊協作
    }
  }

  /**
   * 新增成員到組織或更新成員角色
   * 如果使用者尚未是組織成員，將發送邀請
   * 如果使用者已是成員，將更新其角色
   *
   * @param username - 要新增或更新的使用者名稱
   * @param role - 要設定的角色，預設為 'member'
   * @returns Promise<void>
   * @throws {Error} 當操作失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * // 新增一般成員
   * await client.addMemberToOrganization('username')
   *
   * // 新增管理員
   * await client.addMemberToOrganization('username', 'admin')
   * ```
   */
  async addMemberToOrganization(
    username: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<void> {
    try {
      // 設定或更新使用者在組織中的成員身份和角色
      await this.octokit.orgs.setMembershipForUser({
        org: this.org,
        username,
        role,
      })
    } catch (error) {
      console.error('Error adding member to organization:', error)
      throw error
    }
  }

  /**
   * 從組織中移除成員
   * 此操作會完全移除使用者的組織成員身份
   *
   * @param username - 要移除的使用者名稱
   * @returns Promise<void>
   * @throws {Error} 當操作失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * await client.removeMemberFromOrganization('username')
   * ```
   *
   * @warning 此操作無法復原，請謹慎使用
   */
  async removeMemberFromOrganization(username: string): Promise<void> {
    try {
      // 移除使用者的組織成員身份
      await this.octokit.orgs.removeMembershipForUser({
        org: this.org,
        username,
      })
    } catch (error) {
      console.error('Error removing member from organization:', error)
      throw error
    }
  }

  async addMemberToTeam(
    teamSlug: string,
    username: string,
    role: 'member' | 'maintainer' = 'member'
  ): Promise<void> {
    try {
      await this.octokit.teams.addOrUpdateMembershipForUserInOrg({
        org: this.org,
        team_slug: teamSlug,
        username,
        role,
      })
    } catch (error) {
      console.error('Error adding member to team:', error)
      throw error
    }
  }

  async removeMemberFromTeam(teamSlug: string, username: string): Promise<void> {
    try {
      await this.octokit.teams.removeMembershipForUserInOrg({
        org: this.org,
        team_slug: teamSlug,
        username,
      })
    } catch (error) {
      console.error('Error removing member from team:', error)
      throw error
    }
  }

  async setRepositoryPermission(
    repoName: string,
    username: string,
    permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin'
  ): Promise<void> {
    try {
      await this.octokit.repos.addCollaborator({
        owner: this.org,
        repo: repoName,
        username,
        permission,
      })
    } catch (error) {
      console.error('Error setting repository permission:', error)
      throw error
    }
  }

  async removeRepositoryPermission(repoName: string, username: string): Promise<void> {
    try {
      await this.octokit.repos.removeCollaborator({
        owner: this.org,
        repo: repoName,
        username,
      })
    } catch (error) {
      console.error('Error removing repository permission:', error)
      throw error
    }
  }

  /**
   * 更新儲存庫描述
   *
   * @param repoName - 儲存庫名稱
   * @param description - 新的描述內容
   * @returns Promise<Repository> 更新後的儲存庫資訊
   * @throws {Error} 當操作失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * const updatedRepo = await client.updateRepositoryDescription('my-repo', '新的描述')
   * console.log('Updated description:', updatedRepo.description)
   * ```
   */
  async updateRepositoryDescription(repoName: string, description: string): Promise<Repository> {
    try {
      const { data } = await this.octokit.repos.update({
        owner: this.org,
        repo: repoName,
        description,
      })

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description || undefined,
        private: data.private,
        html_url: data.html_url,
        default_branch: data.default_branch || 'main',
        permissions: {
          admin: data.permissions?.admin || false,
          maintain: data.permissions?.maintain || false,
          push: data.permissions?.push || false,
          triage: data.permissions?.triage || false,
          pull: data.permissions?.pull || false,
        },
        owner: {
          id: data.owner.id,
          login: data.owner.login,
          avatar_url: data.owner.avatar_url,
          html_url: data.owner.html_url,
          type: data.owner.type as 'User' | 'Bot',
          site_admin: data.owner.site_admin,
        },
      }
    } catch (error) {
      console.error('Error updating repository description:', error)
      throw error
    }
  }

  /**
   * 更新儲存庫名稱
   *
   * @param oldRepoName - 舊的儲存庫名稱
   * @param newRepoName - 新的儲存庫名稱
   * @returns Promise<Repository> 更新後的儲存庫資訊
   * @throws {Error} 當操作失敗時拋出錯誤
   *
   * @example
   * ```typescript
   * const updatedRepo = await client.updateRepositoryName('old-repo', 'new-repo')
   * console.log('Updated name:', updatedRepo.name)
   * ```
   */
  async updateRepositoryName(oldRepoName: string, newRepoName: string): Promise<Repository> {
    try {
      const { data } = await this.octokit.repos.update({
        owner: this.org,
        repo: oldRepoName,
        name: newRepoName,
      })

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description || undefined,
        private: data.private,
        html_url: data.html_url,
        default_branch: data.default_branch || 'main',
        permissions: {
          admin: data.permissions?.admin || false,
          maintain: data.permissions?.maintain || false,
          push: data.permissions?.push || false,
          triage: data.permissions?.triage || false,
          pull: data.permissions?.pull || false,
        },
        owner: {
          id: data.owner.id,
          login: data.owner.login,
          avatar_url: data.owner.avatar_url,
          html_url: data.owner.html_url,
          type: data.owner.type as 'User' | 'Bot',
          site_admin: data.owner.site_admin,
        },
      }
    } catch (error) {
      console.error('Error updating repository name:', error)
      throw error
    }
  }
}
