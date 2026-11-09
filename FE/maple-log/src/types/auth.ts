export type AuthType = 'OAUTH' | 'API_KEY' | 'NICKNAME'

export interface NicknameLoginRequest {
  nickname: string
}

export interface ApiKeyLoginRequest {
  apiKey: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  nickname: string | null
  authType: AuthType
}

export interface OAuthLoginUrlResponse {
  loginUrl: string
}
