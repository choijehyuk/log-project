import { useEffect, useState } from 'react'
import { type EventNoticeItem, type NoticeItem, type RankingItem, noticeApi } from '../api/notice'

type Tab = 'notice' | 'event' | 'ranking'

const WORLDS = ['', '스카니아', '베라', '루나', '제니스', '크로아', '유니온', '엘리시움', '이노시스', '레드', '오로라', '아케인', '노바', '리부트', '리부트2']

function formatDate(iso: string) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function NoticeList({ items }: { items: NoticeItem[] }) {
  if (items.length === 0) return <p className="empty">공지사항이 없습니다.</p>
  return (
    <div className="card">
      {items.map((item) => (
        <a
          key={item.notice_id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-item"
        >
          <div className="news-title">{item.title}</div>
          <div className="news-date">{formatDate(item.date)}</div>
        </a>
      ))}
    </div>
  )
}

function EventList({ items }: { items: EventNoticeItem[] }) {
  if (items.length === 0) return <p className="empty">진행 중인 이벤트가 없습니다.</p>
  return (
    <div className="card">
      {items.map((item) => (
        <a
          key={item.notice_id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-item"
        >
          <div className="news-title">{item.title}</div>
          <div className="news-date">
            {formatDate(item.date_event_start)} ~ {formatDate(item.date_event_end)}
          </div>
        </a>
      ))}
    </div>
  )
}

function RankingList({ items, onLoadMore, loading }: { items: RankingItem[]; onLoadMore: () => void; loading: boolean }) {
  if (items.length === 0 && !loading) return <p className="empty">랭킹 데이터가 없습니다.</p>
  return (
    <>
      <div className="card">
        {items.map((item) => (
          <div key={`${item.ranking}-${item.character_name}`} className="ranking-item">
            <span className="ranking-rank">{item.ranking}</span>
            <div className="ranking-info">
              <div className="ranking-name">{item.character_name}</div>
              <div className="ranking-sub">
                {item.world_name} · {item.class_name} · Lv.{item.character_level}
                {item.character_guildname && ` · ${item.character_guildname}`}
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? '불러오는 중...' : '더 보기'}
        </button>
      )}
    </>
  )
}

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>('notice')
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [events, setEvents] = useState<EventNoticeItem[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [rankingPage, setRankingPage] = useState(1)
  const [worldFilter, setWorldFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tab === 'notice' && notices.length === 0) {
      setLoading(true)
      setError('')
      noticeApi.getNotices()
        .then(({ data }) => setNotices(data.notice ?? []))
        .catch(() => setError('공지를 불러오지 못했습니다.'))
        .finally(() => setLoading(false))
    }
  }, [tab, notices.length])

  useEffect(() => {
    if (tab === 'event' && events.length === 0) {
      setLoading(true)
      setError('')
      noticeApi.getEventNotices()
        .then(({ data }) => setEvents(data.event_notice ?? []))
        .catch(() => setError('이벤트를 불러오지 못했습니다.'))
        .finally(() => setLoading(false))
    }
  }, [tab, events.length])

  const loadRanking = (world: string, page: number, append = false) => {
    setLoading(true)
    setError('')
    noticeApi.getRanking({ worldName: world || undefined, page })
      .then(({ data }) => {
        const items = data.ranking ?? []
        setRanking((prev) => append ? [...prev, ...items] : items)
        setRankingPage(page)
      })
      .catch(() => setError('랭킹을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (tab === 'ranking' && ranking.length === 0) {
      loadRanking(worldFilter, 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const handleWorldChange = (world: string) => {
    setWorldFilter(world)
    setRanking([])
    loadRanking(world, 1)
  }

  return (
    <div className="page">
      <h1 className="page-header">소식</h1>

      <div className="char-tabs" style={{ marginBottom: 16 }}>
        {(['notice', 'event', 'ranking'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`char-tab${tab === t ? ' active' : ''}`}
            onClick={() => { setTab(t); setError('') }}
          >
            {t === 'notice' ? '공지' : t === 'event' ? '이벤트' : '랭킹'}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}

      {tab === 'ranking' && (
        <select
          value={worldFilter}
          onChange={(e) => handleWorldChange(e.target.value)}
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            width: '100%',
          }}
        >
          {WORLDS.map((w) => (
            <option key={w} value={w}>{w === '' ? '전체 서버' : w}</option>
          ))}
        </select>
      )}

      {loading && ranking.length === 0 && <p className="loading">불러오는 중...</p>}

      {tab === 'notice' && !loading && <NoticeList items={notices} />}
      {tab === 'event' && !loading && <EventList items={events} />}
      {tab === 'ranking' && (
        <RankingList
          items={ranking}
          loading={loading}
          onLoadMore={() => loadRanking(worldFilter, rankingPage + 1, true)}
        />
      )}
    </div>
  )
}
