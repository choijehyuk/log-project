import { useTodaySchedule } from '../hooks/useTodaySchedule'

export default function BossPage() {
  const { schedule, loading, error } = useTodaySchedule()

  return (
    <section>
      <h2>주간 보스</h2>
      {loading ? (
        <p>불러오는 중...</p>
      ) : error || !schedule ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p>
            {schedule.characterName} · 이번 주 {schedule.weeklyBossClearCount} / {schedule.weeklyBossClearLimitCount}
          </p>
          <ul>
            {[...schedule.bossContents]
              .sort((a, b) => a.list_order_no - b.list_order_no)
              .map((boss) => (
                <li key={`${boss.content_name}-${boss.difficulty}`}>
                  {boss.difficulty} {boss.content_name} ({boss.cycle}) {boss.complete_flag === 'true' && '✅'}
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  )
}
