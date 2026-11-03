import { useState } from 'react'
import { Bar, Icon } from '../components/ui'
import { addDays, fromKey, startOfWeek, weekDays } from '../lib/date'
import { ACHIEVEMENTS, CATEGORIES, CATEGORY_ICON, isDue } from '../lib/game'
import { fmtNum, useT, type Key } from '../lib/i18n'
import { useStore } from '../lib/store'
import { useGame } from '../lib/useGame'

function weekStats(start: string, s: ReturnType<typeof useStore>['s'], today: string) {
  const days = weekDays(start)
  const inWeek = s.completions.filter((c) => c.date >= days[0] && c.date <= days[6])
  const perDay = days.map((d) => inWeek.filter((c) => c.date === d).length)
  const elapsed = days.filter((d) => d <= today)
  const perQuest = s.quests.map((q) => {
    const due = elapsed.filter((d) => isDue(q, d, s.completions)).length
    const done = inWeek.filter((c) => c.questId === q.id).length
    return { q, due, done }
  })
  const due = perQuest.reduce((n, x) => n + x.due, 0)
  const doneOfDue = perQuest.reduce((n, x) => n + Math.min(x.done, x.due), 0)
  return {
    days, perDay, inWeek,
    done: inWeek.length,
    xp: inWeek.reduce((n, c) => n + c.xp, 0),
    active: perDay.filter((n) => n > 0).length,
    elapsed: elapsed.length,
    rate: due ? doneOfDue / due : 0,
    perQuest,
    byCat: CATEGORIES.map((c) => ({ c, n: inWeek.filter((x) => x.category === c).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n),
  }
}

export function Progress() {
  const { s } = useStore()
  const { t, lang } = useT()
  const g = useGame()
  const thisWeek = startOfWeek(g.today)
  const [start, setStart] = useState(thisWeek)
  const w = weekStats(start, s, g.today)
  const prev = weekStats(addDays(start, -7), s, g.today)
  const diff = w.done - prev.done
  const max = Math.max(4, ...w.perDay)
  const fmtRange = (k: string) => fromKey(k).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })
  const isCurrent = start === thisWeek

  const bestIdx = w.perDay.indexOf(Math.max(...w.perDay))
  const weak = w.perQuest.filter((x) => x.due >= 2 && x.done / x.due < 0.5).sort((a, b) => a.done / a.due - b.done / b.due)[0]

  return (
    <div className="page progress">
      <header className="page-head page-head-row">
        <div>
          <h1>{t('p.title')}</h1>
          <p className="page-sub">{t('p.sub')}</p>
        </div>
        <div className="week-nav" role="group" aria-label={t('p.sub')}>
          <button className="icon-btn" onClick={() => setStart(addDays(start, -7))} aria-label={t('p.prev')}><Icon name="left" /></button>
          <span className="week-label">{isCurrent ? t('p.thisWeek') : `${fmtRange(w.days[0])} – ${fmtRange(w.days[6])}`}</span>
          <button className="icon-btn" onClick={() => setStart(addDays(start, 7))} disabled={isCurrent} aria-label={t('p.next')}><Icon name="right" /></button>
        </div>
      </header>

      <section className="kpis" aria-label={t('p.sub')}>
        <div className="card kpi">
          <p className="kpi-label">{t('p.done')}</p>
          <p className="kpi-num">{w.done}</p>
          <p className={`kpi-delta ${diff > 0 ? 'is-up' : diff < 0 ? 'is-down' : ''}`}>
            {diff > 0 ? t('p.vsUp', { n: diff }) : diff < 0 ? t('p.vsDown', { n: diff }) : t('p.vsSame')}
          </p>
        </div>
        <div className="card kpi">
          <p className="kpi-label">{t('p.xp')}</p>
          <p className="kpi-num tone-xp-text">+{fmtNum(w.xp, lang)}</p>
          <p className="kpi-delta">XP</p>
        </div>
        <div className="card kpi">
          <p className="kpi-label">{t('p.days')}</p>
          <p className="kpi-num">{w.active}<small>/7</small></p>
          <div className="day-dots" aria-hidden="true">{w.perDay.map((n, i) => <span key={i} className={n ? 'is-on' : w.days[i] > g.today ? 'is-future' : ''} />)}</div>
        </div>
        <div className="card kpi">
          <p className="kpi-label">{t('p.rate')}</p>
          <p className="kpi-num">{Math.round(w.rate * 100)}<small>%</small></p>
          <Bar value={w.rate} tone="done" size="sm" label={t('p.rate')} />
        </div>
      </section>

      <div className="progress-grid">
        <section className="card" aria-labelledby="chart-t">
          <h2 id="chart-t" className="card-title">{t('p.chart')}</h2>
          <div className="chart" role="img" aria-label={w.days.map((d, i) => `${t(`dayl.${i}` as Key)} ${w.perDay[i]}`).join(', ')}>
            <div className="chart-grid" aria-hidden="true">
              {[max, Math.round(max / 2), 0].map((v) => <span key={v}><i className="num">{v}</i></span>)}
            </div>
            <div className="chart-bars">
              {w.days.map((d, i) => (
                <div key={d} className={`chart-col ${d === g.today ? 'is-today' : ''} ${d > g.today ? 'is-future' : ''}`}>
                  <span className="chart-bar" style={{ height: `${(w.perDay[i] / max) * 100}%` }}>
                    {w.perDay[i] > 0 && <b className="num">{w.perDay[i]}</b>}
                  </span>
                  <span className="chart-day">{t(`day.${i}` as Key)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="cat-t">
          <h2 id="cat-t" className="card-title">{t('p.byCat')}</h2>
          {w.byCat.length === 0 ? <p className="muted">{t('p.noData')}</p> : (
            <ul className="cat-bars">
              {w.byCat.map(({ c, n }) => (
                <li key={c}>
                  <span className="cat-name"><span aria-hidden="true">{CATEGORY_ICON[c]}</span> {t(`cat.${c}`)}</span>
                  <span className={`cat-track cat-${c}`}><span style={{ width: `${(n / w.byCat[0].n) * 100}%` }} /></span>
                  <span className="num">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card review" aria-labelledby="rev-t">
        <h2 id="rev-t" className="card-title">{t('p.review')}</h2>
        {w.done === 0 ? <p className="muted">{t('p.noData')}</p> : (
          <div className="review-cols">
            <div>
              <h3 className="review-h is-good"><Icon name="check" size={16} stroke={3} /> {t('p.wentWell')}</h3>
              <ul>
                <li>{t('p.bestDay', { day: t(`dayl.${bestIdx}` as Key), n: w.perDay[bestIdx] })}</li>
                <li>{t('p.streak', { n: w.active })}</li>
                {w.byCat[0] && <li>{t('p.topCat', { cat: t(`cat.${w.byCat[0].c}`) })}</li>}
              </ul>
            </div>
            <div>
              <h3 className="review-h is-adjust"><Icon name="repeat" size={16} /> {t('p.toImprove')}</h3>
              <ul>
                {weak ? <li>{t('p.weak', { q: weak.q.title, n: weak.done, d: weak.due })}</li> : <li>{t('p.noWeak')}</li>}
                {w.active < w.elapsed && <li>{t('p.zeroDays')}</li>}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="ach-t">
        <div className="card-head">
          <h2 id="ach-t" className="card-title">{t('p.ach')}</h2>
          <span className="count-pill">{t('p.achCount', { a: g.unlocked.length, b: ACHIEVEMENTS.length })}</span>
        </div>
        <ul className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const p = a.progress(g.snap)
            const on = g.unlocked.includes(a.id)
            return (
              <li key={a.id} className={`ach ${on ? 'is-on' : 'is-locked'}`}>
                <span className={`ach-medal tier-${a.tier}`} aria-hidden="true">{on ? a.icon : <Icon name="lock" size={22} />}</span>
                <b>{t(`a.${a.id}` as Key)}</b>
                <small>{t(`ad.${a.id}` as Key)}</small>
                {on ? <span className="ach-state"><Icon name="check" size={12} stroke={3} /> {t('p.unlocked')}</span> : (
                  <>
                    <Bar value={p.value / p.target} tone="muted" size="sm" label={t(`a.${a.id}` as Key)} />
                    <span className="ach-state num">{fmtNum(Math.min(p.value, p.target), lang)} / {fmtNum(p.target, lang)}</span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
