import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function OAuthCallbackPage() {
  const { loginWithNexon } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const [requestError, setRequestError] = useState('')
  const error = code ? requestError : '인가 코드가 없습니다.'
  // 인가 코드는 1회용이므로 StrictMode 이중 실행 시 중복 요청 방지
  const requested = useRef(false)

  useEffect(() => {
    if (!code || requested.current) return
    requested.current = true

    loginWithNexon(code)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setRequestError('넥슨 로그인에 실패했습니다.'))
  }, [code, loginWithNexon, navigate])

  return (
    <div className="auth-page">
      {error ? (
        <>
          <p className="error">{error}</p>
          <Link to="/login">로그인으로 돌아가기</Link>
        </>
      ) : (
        <p>로그인 중...</p>
      )}
    </div>
  )
}
