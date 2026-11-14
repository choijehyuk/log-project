const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const NICKNAME_KEY = 'nickname'
const AUTH_TYPE_KEY = 'authType'

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getNickname: () => localStorage.getItem(NICKNAME_KEY),
  getAuthType: () => localStorage.getItem(AUTH_TYPE_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  setNickname: (nickname: string | null) => {
    if (nickname) localStorage.setItem(NICKNAME_KEY, nickname)
    else localStorage.removeItem(NICKNAME_KEY)
  },
  setAuthType: (authType: string | null) => {
    if (authType) localStorage.setItem(AUTH_TYPE_KEY, authType)
    else localStorage.removeItem(AUTH_TYPE_KEY)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(NICKNAME_KEY)
    localStorage.removeItem(AUTH_TYPE_KEY)
  },
}
