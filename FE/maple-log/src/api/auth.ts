import type { ApiKeyLoginRequest, AuthResponse, NicknameLoginRequest, OAuthLoginUrlResponse } from '../types/auth'
import { apiClient } from './client'

export const authApi = {
  getNexonLoginUrl: () => apiClient.get<OAuthLoginUrlResponse>('/auth/oauth/nexon/login-url'),
  nexonCallback: (code: string) => apiClient.get<AuthResponse>('/auth/oauth/nexon/callback', { params: { code } }),
  loginWithNickname: (body: NicknameLoginRequest) => apiClient.post<AuthResponse>('/auth/nickname', body),
  loginWithApiKey: (body: ApiKeyLoginRequest) => apiClient.post<AuthResponse>('/auth/api-key', body),
  logout: () => apiClient.post<void>('/auth/logout'),
}
