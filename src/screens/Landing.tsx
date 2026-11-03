import { motion } from 'framer-motion'
import { useState } from 'react'
import { LangSwitch, Logo } from '../components/Brand'
import { QuestRow } from '../components/QuestRow'
import { Avatar, Bar, Icon } from '../components/ui'
import { STARTERS } from '../lib/helper'
import { useT } from '../lib/i18n'
import { go } from '../lib/router'
import { useStore } from '../lib/store'

/** A working miniature of the real dashboard: visitors can tick quests and watch XP move. */
function DashboardPreview() {
  const { t, lang } = useT()
  const sample = [STARTERS.study[0], STARTERS.fitness[0], STARTERS.growth[0]]
  const [done, setDone] = useState([false, true, false])
  const xp = 180 + done.reduce((n, d, i) => n + (d ? [50, 25, 25][i] : 0), 0) - 25
  const need = 200
  return (
    <div className="preview" aria-label={t('land.previewCap')}>
      <div className="preview-head">
        <Avatar emoji="🧙" size={44} />
        <div>
          <b>{lang === 'th' ? 'ฟ้า' : 'Alex'}</b>
          <small>{t('u.level', { n: 3 })}</small>
        </div>
        <span className="streak-pill"><Icon name="flame" size={16} /> {t('u.days', { n: 6 })}</span>
      </div>
      <div className="preview-xp">
        <div className="row-between"><span>XP</span><span className="num">{Math.min(xp, need)} / {need}</span></div>
        <Bar value={xp / need} label="XP" />
      </div>
      <ul className="qlist">
        {sample.map((tp, i) => (
          <QuestRow key={tp.en} q={{ title: lang === 'th' ? tp.th : tp.en, category: tp.category, difficulty: tp.difficulty, minutes: tp.minutes, frequency: tp.frequency }}
            done={done[i]} onToggle={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))} />
        ))}
      </ul>
    </div>
  )
}

export function Landing() {
  const { t } = useT()
  const { s, d } = useStore()
  const start = () => go(s.profile && !s.demo ? '/today' : '/start')
  const demo = () => { d({ type: 'demo', lang: s.settings.lang }); go('/today') }

  const features = [
    { icon: '✅', k: 1 }, { icon: '⚡', k: 2 }, { icon: '🔥', k: 3 },
    { icon: '🏆', k: 4 }, { icon: '📊', k: 5 }, { icon: '🪄', k: 6 },
  ] as const

  return (
    <div className="landing">
      <header className="land-nav wrap">
        <Logo />
        <div className="land-nav-right">
          <LangSwitch />
          {s.profile && !s.demo && <button className="btn btn-ghost btn-sm" onClick={() => go('/today')}>{t('land.continue', { name: s.profile.name })}</button>}
        </div>
      </header>

      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">{t('land.eyebrow')}</p>
            <h1 className="hero-title">{t('land.h1a')}<br /><span className="hl">{t('land.h1b')}</span></h1>
            <p className="hero-lede">{t('land.lede')}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={start}>{t('land.cta')} <Icon name="arrow" size={18} /></button>
              <button className="btn btn-ghost btn-lg" onClick={demo}>{t('land.demo')}</button>
            </div>
            <p className="hero-note">{t('land.note')}</p>
          </div>
          <motion.div className="hero-visual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <DashboardPreview />
            <p className="preview-cap">{t('land.previewCap')}</p>
          </motion.div>
        </section>

        <section className="land-section wrap" aria-labelledby="how">
          <h2 id="how" className="section-title">{t('land.howTitle')}</h2>
          <ol className="steps">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <span className="step-num">{n}</span>
                <h3>{t(`land.s${n}t` as 'land.s1t')}</h3>
                <p>{t(`land.s${n}d` as 'land.s1d')}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="land-section wrap" aria-labelledby="feat">
          <h2 id="feat" className="section-title">{t('land.featTitle')}</h2>
          <ul className="features">
            {features.map((f) => (
              <li key={f.k}>
                <span className="feat-icon" aria-hidden="true">{f.icon}</span>
                <div>
                  <h3>{t(`land.f${f.k}t` as 'land.f1t')}</h3>
                  <p>{t(`land.f${f.k}d` as 'land.f1d')}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="land-cta wrap">
          <p>{t('land.ctaBottom')}</p>
          <button className="btn btn-primary btn-lg" onClick={start}>{t('land.cta')} <Icon name="arrow" size={18} /></button>
        </section>
      </main>

      <footer className="land-foot wrap">{t('land.footer')}</footer>
    </div>
  )
}
