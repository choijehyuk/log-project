import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { characterApi } from '../api/character'
import { useAuth } from '../store/AuthContext'
import type { AuthResponse, AuthType } from '../types/auth'

export default function OAuthResultPage() {
  const { applyAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const nickname = searchParams.get('nickname') ?? ''
    const authType = searchParams.get('authType') ?? ''

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true })
      return
    }

    const authData: AuthResponse = { accessToken, refreshToken, nickname, authType: authType as AuthType }
    applyAuth(authData)

    characterApi.autoRegister().catch(() => {})

    navigate('/', { replace: true })
  }, [searchParams, applyAuth, navigate])

  return (
    <div className="auth-page">
      <p>로그인 처리 중...</p>
    </div>
  )
}
