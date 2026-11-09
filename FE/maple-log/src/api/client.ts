import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse } from '../types/auth'
import { tokenStorage } from '../utils/token'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// 요청마다 Access Token 첨부
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 응답 시 Refresh Token으로 재발급 후 원래 요청 재시도
let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const { data } = await axios.post<AuthResponse>(`${baseURL}/auth/refresh`, null, {
    headers: { 'Refresh-Token': refreshToken },
  })
  tokenStorage.setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch (refreshError) {
      tokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)
