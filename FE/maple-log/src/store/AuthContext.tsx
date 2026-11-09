import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { ApiKeyLoginRequest, AuthResponse, NicknameLoginRequest } from '../types/auth'
import { tokenStorage } from '../utils/token'

interface AuthContextValue {
  isAuthenticated: boolean
  nickname: string | null
  loginWithNickname: (body: NicknameLoginRequest) => Promise<void>
  loginWithApiKey: (body: ApiKeyLoginRequest) => Promise<void>
  loginWithNexon: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStorage.getAccessToken())
  const [nickname, setNickname] = useState(() => tokenStorage.getNickname())

  const applyAuth = useCallback((data: AuthResponse) => {
    tokenStorage.setTokens(data.accessToken, data.refreshToken)
    tokenStorage.setNickname(data.nickname)
    setNickname(data.nickname)
    setIsAuthenticated(true)
  }, [])

  const loginWithNickname = useCallback(
    async (body: NicknameLoginRequest) => {
      const { data } = await authApi.loginWithNickname(body)
      applyAuth(data)
    },
    [applyAuth],
  )

  const loginWithApiKey = useCallback(
    async (body: ApiKeyLoginRequest) => {
      const { data } = await authApi.loginWithApiKey(body)
      applyAuth(data)
    },
    [applyAuth],
  )

  const loginWithNexon = useCallback(
    async (code: string) => {
      const { data } = await authApi.nexonCallback(code)
      applyAuth(data)
    },
    [applyAuth],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clear()
      setNickname(null)
      setIsAuthenticated(false)
    }
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, nickname, loginWithNickname, loginWithApiKey, loginWithNexon, logout }),
    [isAuthenticated, nickname, loginWithNickname, loginWithApiKey, loginWithNexon, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
