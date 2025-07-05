# GitHub Organization Manager

一個用於管理 GitHub 組織成員、團隊和儲存庫權限的現代化 Web 應用程式。

## 功能特色

- 🔐 **GitHub OAuth 認證** - 安全的 GitHub 登入
- 👥 **成員管理** - 新增、刪除成員和設定角色權限
- 🛡️ **團隊管理** - 建立和管理團隊、分配團隊成員
- 📂 **儲存庫權限** - 管理儲存庫訪問權限
- 📋 **批次處理** - 批次處理權限變更
- 👀 **變更預覽** - 預覽權限變更結果
- 🔍 **Owner-only 篩選** - 篩選只有擁有者權限的專案

## 技術架構

- **前端**: React 18 + Next.js 15 + TypeScript 5.7
- **樣式**: Tailwind CSS 3.4 + clsx + tailwind-merge
- **認證**: NextAuth.js 4.24
- **API**: GitHub REST API (via Octokit 22.0)
- **圖示**: Lucide React 0.525
- **開發工具**: ESLint + Prettier + TypeScript
- **程式碼品質**: 完整的 TypeScript 型別定義和 JSDoc 註解

## 快速開始

### 1. 克隆專案

```bash
git clone <repository-url>
cd github-org-editor
```

### 2. 安裝依賴

```bash
npm install --legacy-peer-deps
```

### 3. 環境設定

複製 `.env.example` 為 `.env.local` 並填入您的配置：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```env
# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub Personal Access Token (for server-side API calls)
GITHUB_ACCESS_TOKEN=your_personal_access_token

# Organization name
GITHUB_ORG=your_organization_name
```

### 4. 設定 GitHub OAuth App

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 建立新的 OAuth App
3. 設定以下資訊：
   - Application name: `GitHub Organization Manager`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. 複製 Client ID 和 Client Secret 到 `.env.local`

### 5. 建立 Personal Access Token

1. 前往 [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. 建立新的 token，並勾選以下權限：
   - `admin:org` - 完整的組織權限
   - `repo` - 完整的儲存庫權限
   - `read:user` - 讀取使用者資料
   - `user:email` - 讀取使用者電子郵件
3. 複製 token 到 `.env.local`

### 6. 啟動開發伺服器

```bash
npm run dev
```

應用程式將在 `http://localhost:3000` 啟動。

## 專案結構

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── members/           # 成員管理頁面
│   ├── teams/             # 團隊管理頁面
│   ├── repositories/      # 儲存庫權限頁面
│   └── batch/             # 批次操作頁面
├── components/            # React 元件
│   ├── auth/             # 認證相關元件
│   ├── layout/           # 佈局元件
│   ├── members/          # 成員管理元件
│   ├── teams/            # 團隊管理元件
│   └── repositories/     # 儲存庫管理元件
├── lib/                  # 工具函式庫
│   ├── auth.ts           # NextAuth 配置
│   └── github.ts         # GitHub API 客戶端
├── types/                # TypeScript 型別定義
│   └── github.ts         # GitHub 相關型別
└── hooks/                # 自定義 React Hooks
```

## 主要功能說明

### 成員管理
- 查看組織所有成員
- 新增新成員到組織
- 設定成員角色 (Admin/Member)
- 移除組織成員

### 團隊管理
- 建立和管理團隊
- 新增/移除團隊成員
- 設定團隊權限和隱私設定

### 儲存庫權限管理
- 查看所有組織儲存庫
- 管理個別使用者的儲存庫權限
- 批次修改多個儲存庫權限

### 批次操作
- 建立批次操作計劃
- 預覽權限變更
- 執行批次權限變更

### Owner-only 專案篩選
- 識別只有 Owner 權限的專案
- 適合找出可能是個人專案的儲存庫

## 開發指令

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產版本
npm run start

# 程式碼檢查
npm run lint

# 修正程式碼格式
npm run lint:fix

# 型別檢查
npm run type-check

# 清除建置檔案
npm run clean
```

## 程式碼品質

本專案採用嚴格的程式碼品質標準：

### TypeScript 支援
- 完整的型別定義和介面
- 嚴格的型別檢查設定
- 詳細的 JSDoc 註解

### 程式碼格式化
- Prettier 自動格式化
- ESLint 程式碼檢查
- 統一的程式碼風格

### 檔案結構
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由 (伺服器端)
│   ├── globals.css     # 全域樣式
│   ├── layout.tsx      # 根佈局元件
│   └── page.tsx        # 首頁元件
├── components/         # React 元件
│   ├── auth/          # 認證相關元件
│   ├── layout/        # 佈局元件
│   └── members/       # 成員管理元件
├── lib/               # 工具函式庫
│   ├── auth.ts        # NextAuth 配置
│   ├── github.ts      # GitHub API 客戶端
│   └── utils.ts       # 通用工具函式
├── types/             # TypeScript 型別定義
│   ├── github.ts      # GitHub 相關型別
│   └── next-auth.d.ts # NextAuth 型別擴展
└── hooks/             # 自定義 React Hooks
```

## 注意事項

1. **權限要求**: 需要組織的管理員權限才能執行成員和權限管理操作
2. **API 限制**: GitHub API 有速率限制，大量操作時請注意
3. **安全性**: 請妥善保管您的 access token 和 OAuth secrets
4. **測試**: 建議先在測試組織上進行操作測試
5. **相容性**: 支援 Node.js 18+ 和現代瀏覽器

## 維護指南

### 更新套件
```bash
# 檢查過期套件
npm outdated

# 更新套件
npm update

# 測試更新後的相容性
npm run build && npm run type-check
```

### 新增功能
1. 在 `src/types/github.ts` 中定義相關型別
2. 在 `src/lib/github.ts` 中加入 API 客戶端方法
3. 建立對應的 API 路由和 React 元件
4. 加上完整的 TypeScript 註解和文件

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！

請確保：
- 遵循現有的程式碼風格
- 加上適當的 TypeScript 型別和註解
- 測試您的變更

## 授權

MIT License