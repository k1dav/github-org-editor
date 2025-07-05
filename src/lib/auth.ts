/**
 * NextAuth.js 認證配置
 * 設定 GitHub OAuth 認證和會話管理
 */

import { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

/**
 * NextAuth 認證選項配置
 * 包含 GitHub OAuth 設定、回調函式和自訂頁面
 */
export const authOptions: NextAuthOptions = {
  // OAuth 提供者配置
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!, // GitHub OAuth App 的 Client ID
      clientSecret: process.env.GITHUB_CLIENT_SECRET!, // GitHub OAuth App 的 Client Secret
      authorization: {
        params: {
          // 請求的權限範圍，涵蓋組織管理、團隊管理、儲存庫管理和使用者資訊
          scope: 'read:org admin:org repo admin:repo_hook read:user user:email admin:team',
        },
      },
    }),
  ],
  
  // 回調函式，用於自訂認證流程
  callbacks: {
    /**
     * JWT 回調函式
     * 在 JWT token 建立或更新時呼叫
     * 
     * @param token - 目前的 JWT token
     * @param account - OAuth 帳號資訊（僅在首次登入時提供）
     * @returns 更新後的 token
     */
    async jwt({ token, account }) {
      // 在首次登入時，將 access token 儲存到 JWT 中
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },

    /**
     * Session 回調函式
     * 在建立 session 物件時呼叫
     * 
     * @param session - 目前的 session
     * @param token - JWT token
     * @returns 更新後的 session
     */
    async session({ session, token }) {
      // 將 access token 加入到 session 中，供客戶端使用
      session.accessToken = token.accessToken as string
      return session
    },
  },

  // 自訂認證頁面路徑
  pages: {
    signIn: '/auth/signin', // 自訂登入頁面
    error: '/auth/error',   // 自訂錯誤頁面
  },
}