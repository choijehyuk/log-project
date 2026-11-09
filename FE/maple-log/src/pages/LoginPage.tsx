import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { characterApi } from '../api/character'
import { useAuth } from '../store/AuthContext'

type Mode = 'nickname' | 'apikey'

function resolveLoginError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.'
    const status = err.response.status
    if (status === 404 || status === 405) return '서버가 최신 코드로 재시작되지 않았습니다.'
    const msg = err.response.data?.error
    if (msg) return msg
    if (status === 502) return '넥슨 API에서 캐릭터를 찾을 수 없습니다.'
  }
  return '알 수 없는 오류가 발생했습니다.'
}

export default function LoginPage() {
  const { loginWithNickname, loginWithApiKey } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('nickname')
  const [nickname, setNickname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'login' | 'registering'>('idle')

  const handleNicknameLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setStep('login')
    try {
      await loginWithNickname({ nickname })

      setStep('registering')
      try {
        await characterApi.register({ characterName: nickname })
      } catch (regErr) {
        console.error('캐릭터 등록 실패:', regErr)
      }

      navigate('/')
    } catch (err) {
      setError(resolveLoginError(err))
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const handleApiKeyLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setStep('login')
    try {
      await loginWithApiKey({ apiKey })

      setStep('registering')
      try {
        await characterApi.autoRegister()
      } catch (regErr) {
        console.error('캐릭터 자동 등록 실패:', regErr)
      }

      navigate('/')
    } catch (err) {
      setError(resolveLoginError(err))
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const buttonLabel = () => {
    if (step === 'registering') return '캐릭터 불러오는 중...'
    if (step === 'login') return '로그인 중...'
    return mode === 'nickname' ? '시작하기' : 'API 키로 로그인'
  }

  return (
    <div className="login-page">
      <div>
        <div className="login-logo">🍁 MapleLog</div>
        <p className="login-subtitle">메이플스토리 성장 기록 앱</p>
      </div>

      <div className="login-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className={`btn ${mode === 'nickname' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('nickname'); setError('') }}
          >
            닉네임으로 시작
          </button>
          <button
            type="button"
            className={`btn ${mode === 'apikey' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('apikey'); setError('') }}
          >
            API 키로 로그인
          </button>
        </div>

        {mode === 'nickname' ? (
          <form onSubmit={handleNicknameLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              placeholder="캐릭터 닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {buttonLabel()}
            </button>
          </form>
        ) : (
          <form onSubmit={handleApiKeyLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              placeholder="Nexon Open API 키"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {buttonLabel()}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}