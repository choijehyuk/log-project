import { useTodaySchedule } from '../hooks/useTodaySchedule'
import type { ContentRecord } from '../types/schedule'

function ContentList({ title, contents }: { title: string; contents: ContentRecord[] }) {
  return (
    <>
      <h3>{title}</h3>
      <ul>
        {contents.map((c) => (
          <li key={c.content_name}>
            {c.content_name} · {c.now_count} / {c.max_count}
          </li>
        ))}
      </ul>
    </>
  )
}

export default function DailyPage() {
  const { schedule, loading, error } = useTodaySchedule()

  return (
    <section>
      <h2>일일 콘텐츠</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : error || !schedule ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p>
            {schedule.characterName} · {schedule.scheduleDate}
          </p>
          <ContentList title="일일" contents={schedule.dailyContents} />
          <ContentList title="주간" contents={schedule.weeklyContents} />
        </>
      )}
    </section>
  )
}
