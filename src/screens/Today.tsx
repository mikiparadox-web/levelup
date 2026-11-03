import { QuestRow } from '../components/QuestRow'
import { Bar, Icon, useToast } from '../components/ui'
import { weekDays, startOfWeek, weekdayIndex } from '../lib/date'
import { ACHIEVEMENTS, XP_BY_DIFFICULTY, questStreak } from '../lib/game'
import { fmtNum, useT, type Key } from '../lib/i18n'
import { go } from '../lib/router'
import { sound } from '../lib/sound'
import { useStore } from '../lib/store'
import { useGame } from '../lib/useGame'

function greetingKey(): Key {
  const h = new Date().getHours()
  return h < 12 ? 'dash.morning' : h < 18 ? 'dash.afternoon' : 'dash.evening'
}

export function Today() {
  const { s, d } = useStore()
  const { t, lang } = useT()
  const g = useGame()
  const toast = useToast()
  const p = s.profile!
  const left = g.todays.length - g.doneIds.size

  const toggle = (id: string, title: string, difficulty: keyof typeof XP_BY_DIFFICULTY) => {
    const wasDone = g.doneIds.has(id)
    d({ type: 'toggle', id, date: g.today })
    if (wasDone) { sound.undo(); return }
    sound.complete()
    toast({
      text: t('dash.toastDone', { xp: XP_BY_DIFFICULTY[difficulty], q: title }), icon: '⚡', tone: 'xp',
      action: { label: t('dash.undo'), run: () => d({ type: 'toggle', id, date: g.today }) },
    })
  }

  const week = weekDays(startOfWeek(g.today))
  const perDay = week.map((day) => s.completions.filter((c) => c.date === day).length)
  const maxDay = Math.max(1, ...perDay)
  const dateLabel = new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page today">
      <header className="page-head">
        <p className="page-date">{dateLabel}</p>
        <h1>{t(greetingKey(), { name: p.name })}</h1>
        <p className="page-sub">
          {g.todays.length === 0 ? t('dash.noneToday') : left === 0 ? t('dash.allDone') : left === 1 ? t('dash.left1') : t('dash.left', { n: left })}
        </p>
      </header>

      {s.demo && (
        <div className="demo-banner">
          <span>🧪 {t('pr.demoNote')}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => { d({ type: 'reset' }); go('/start') }}>{t('pr.demoBtn')}</button>
        </div>
      )}

      <section className="stat-row" aria-label="Stats">
        <div className="card level-card">
          <div className="level-badge" aria-hidden="true"><span>{g.lvl.level}</span></div>
          <div className="level-main">
            <div className="row-between">
              <h2 className="level-title">{t('u.level', { n: g.lvl.level })}</h2>
              <span className="num muted">{fmtNum(g.lvl.current, lang)} / {fmtNum(g.lvl.need, lang)} XP</span>
            </div>
            <Bar value={g.lvl.pct} size="lg" label={t('u.level', { n: g.lvl.level })} />
            <p className="muted small">{t('dash.toNext', { x: fmtNum(g.lvl.toNext, lang), n: g.lvl.level + 1 })}</p>
          </div>
        </div>
        <div className={`card streak-card ${g.doneToday ? 'is-lit' : ''}`}>
          <span className="streak-flame" aria-hidden="true"><Icon name="flame" size={30} /></span>
          <div>
            <p className="stat-num">{g.streak}</p>
            <p className="stat-label">{t('dash.streak')}</p>
          </div>
          <p className="streak-hint">
            {g.doneToday ? <><Icon name="check" size={14} stroke={3} /> {t('dash.streakSafe')}</> : g.streak > 0 ? t('dash.keepStreak', { n: g.streak }) : t('dash.startStreak')}
          </p>
        </div>
        <div className="card mini-stat">
          <span className="mini-icon tone-xp" aria-hidden="true"><Icon name="bolt" size={18} /></span>
          <p className="stat-num">+{fmtNum(g.xpToday, lang)}</p>
          <p className="stat-label">{t('dash.xpToday')}</p>
        </div>
      </section>

      <div className="today-grid">
        <section className="card quests-card" aria-labelledby="todays">
          <div className="card-head">
            <h2 id="todays">{t('dash.todayTitle')}</h2>
            {g.todays.length > 0 && <span className="count-pill num">{g.doneIds.size}/{g.todays.length}</span>}
          </div>
          {g.todays.length > 0 && <Bar value={g.doneIds.size / g.todays.length} tone="done" size="sm" label={t('dash.todayTitle')} />}
          {g.todays.length === 0 ? (
            <div className="empty">
              <span className="empty-art" aria-hidden="true">🗺️</span>
              <h3>{t('dash.emptyT')}</h3>
              <p>{t('dash.emptyD')}</p>
              <button className="btn btn-primary" onClick={() => go('/quests/new')}><Icon name="plus" /> {t('dash.emptyBtn')}</button>
            </div>
          ) : (
            <ul className="qlist">
              {g.todays.map((q) => (
                <QuestRow key={q.id} q={q} done={g.doneIds.has(q.id)} streakDays={questStreak(q, s.completions, g.today)}
                  onToggle={() => toggle(q.id, q.title, q.difficulty)} />
              ))}
            </ul>
          )}
          <div className="card-foot">
            <button className="btn btn-ghost btn-sm" onClick={() => go('/quests/new')}><Icon name="plus" size={16} /> {t('nav.newQuest')}</button>
            <button className="btn btn-link btn-sm" onClick={() => go('/quests')}>{t('dash.manage')}</button>
          </div>
        </section>

        <aside className="today-side">
          <section className="card" aria-labelledby="nextach">
            <h2 id="nextach" className="card-title">{t('dash.nextAch')}</h2>
            {g.next ? (
              <div className="next-ach">
                <span className={`ach-medal tier-${g.next.a.tier}`} aria-hidden="true">{g.next.a.icon}</span>
                <div className="next-ach-body">
                  <b>{t(`a.${g.next.a.id}` as Key)}</b>
                  <small>{t(`ad.${g.next.a.id}` as Key)}</small>
                  <Bar value={g.next.p.value / g.next.p.target} tone="brand" size="sm" label={t(`a.${g.next.a.id}` as Key)} />
                  <small className="num">{fmtNum(Math.min(g.next.p.value, g.next.p.target), lang)} / {fmtNum(g.next.p.target, lang)}</small>
                </div>
              </div>
            ) : <p className="muted">{t('dash.allAch')}</p>}
            <p className="muted small">{t('p.achCount', { a: g.unlocked.length, b: ACHIEVEMENTS.length })}</p>
          </section>

          <section className="card" aria-labelledby="wk">
            <div className="card-head">
              <h2 id="wk" className="card-title">{t('dash.week')}</h2>
              <button className="btn btn-link btn-sm" onClick={() => go('/progress')}>{t('dash.seeProgress')} <Icon name="right" size={14} /></button>
            </div>
            <div className="week-mini" role="img" aria-label={week.map((day, i) => `${t(`dayl.${weekdayIndex(day)}` as Key)}: ${perDay[i]}`).join(', ')}>
              {week.map((day, i) => (
                <div key={day} className={`wm-col ${day === g.today ? 'is-today' : ''} ${day > g.today ? 'is-future' : ''}`}>
                  <span className="wm-val num">{perDay[i] || ''}</span>
                  <span className="wm-bar"><span style={{ height: `${(perDay[i] / maxDay) * 100}%` }} /></span>
                  <span className="wm-day">{t(`day.${i}` as Key)}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
