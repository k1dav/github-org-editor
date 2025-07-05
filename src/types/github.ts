/**
 * GitHub 相關型別定義
 * 包含所有與 GitHub API 互動所需的型別和介面
 */

/**
 * GitHub 使用者基本資訊介面
 * 代表 GitHub 平台上的使用者或機器人帳號
 */
export interface GitHubUser {
  /** 使用者的唯一識別 ID */
  id: number
  /** 使用者名稱 */
  login: string
  /** 頭像圖片 URL */
  avatar_url: string
  /** 使用者 GitHub 個人頁面 URL */
  html_url: string
  /** 帳號類型：使用者或機器人 */
  type: 'User' | 'Bot'
  /** 是否為 GitHub 網站管理員 */
  site_admin: boolean
  /** 使用者真實姓名（可選） */
  name?: string
  /** 使用者電子郵件（可選） */
  email?: string
  /** 使用者個人簡介（可選） */
  bio?: string
  /** 使用者所屬公司（可選） */
  company?: string
  /** 使用者所在地點（可選） */
  location?: string
}

/**
 * 組織成員介面
 * 繼承 GitHubUser，並加上組織相關的角色和狀態資訊
 */
export interface OrganizationMember extends GitHubUser {
  /** 在組織中的角色：管理員或一般成員 */
  role: 'admin' | 'member'
  /** 成員狀態：已啟用或待接受邀請 */
  state: 'active' | 'pending'
}

/**
 * GitHub 團隊介面
 * 代表組織內的團隊資訊
 */
export interface Team {
  /** 團隊的唯一識別 ID */
  id: number
  /** 團隊名稱 */
  name: string
  /** 團隊的 URL slug（用於 API 路徑） */
  slug: string
  /** 團隊描述（可選） */
  description?: string
  /** 團隊隱私設定：秘密或封閉 */
  privacy: 'secret' | 'closed'
  /** 團隊預設權限等級 */
  permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin'
  /** 團隊成員數量 */
  members_count: number
  /** 團隊可存取的儲存庫數量 */
  repos_count: number
  /** 團隊頁面 URL */
  html_url: string
}

/**
 * GitHub 儲存庫介面
 * 代表組織或個人的程式碼儲存庫
 */
export interface Repository {
  /** 儲存庫的唯一識別 ID */
  id: number
  /** 儲存庫名稱 */
  name: string
  /** 完整儲存庫名稱（包含擁有者） */
  full_name: string
  /** 儲存庫描述（可選） */
  description?: string
  /** 是否為私人儲存庫 */
  private: boolean
  /** 儲存庫頁面 URL */
  html_url: string
  /** 預設分支名稱 */
  default_branch: string
  /** 當前使用者對此儲存庫的權限 */
  permissions: {
    /** 是否有管理員權限 */
    admin: boolean
    /** 是否有維護權限 */
    maintain: boolean
    /** 是否有推送權限 */
    push: boolean
    /** 是否有分類權限 */
    triage: boolean
    /** 是否有拉取權限 */
    pull: boolean
  }
  /** 儲存庫擁有者資訊 */
  owner: GitHubUser
}

/**
 * 儲存庫權限介面
 * 表示特定使用者或團隊對特定儲存庫的權限關係
 */
export interface RepositoryPermission {
  /** 權限類型：使用者或團隊 */
  type: 'user' | 'team'
  /** 擁有權限的使用者（僅當 type 為 'user' 時） */
  user: GitHubUser | null
  /** 擁有權限的團隊（僅當 type 為 'team' 時） */
  team: Team | null
  /** 目標儲存庫 */
  repository: Repository
  /** 權限等級 */
  permission: 'read' | 'triage' | 'write' | 'maintain' | 'admin'
}

/**
 * 團隊成員介面
 * 繼承 GitHubUser，並加上團隊內的角色資訊
 */
export interface TeamMember extends GitHubUser {
  /** 在團隊中的角色：一般成員或維護者 */
  role: 'member' | 'maintainer'
}


/**
 * API 回應包裝介面
 * 標準化 API 回應格式
 */
export interface ApiResponse<T = unknown> {
  /** 操作是否成功 */
  success: boolean
  /** 回應資料 */
  data?: T
  /** 錯誤訊息（如果失敗） */
  error?: string
  /** 詳細錯誤資訊（如果失敗） */
  details?: string
}

/**
 * 分頁資訊介面
 * 用於處理大量資料的分頁顯示
 */
export interface PaginationInfo {
  /** 目前頁數 */
  page: number
  /** 每頁項目數 */
  per_page: number
  /** 總項目數 */
  total_count: number
  /** 總頁數 */
  total_pages: number
  /** 是否有下一頁 */
  has_next: boolean
  /** 是否有上一頁 */
  has_prev: boolean
}

/**
 * 分頁回應介面
 * 包含分頁資訊的 API 回應
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 分頁資訊 */
  pagination: PaginationInfo
}