import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { LangSwitch, Logo } from '../components/Brand'
import { AVATARS, Icon, useToast } from '../components/ui'
import { todayKey } from '../lib/date'
import { CATEGORIES, CATEGORY_ICON, XP_BY_DIFFICULTY, type Category } from '../lib/game'
import { STARTERS, tplTitle } from '../lib/helper'
import { useT } from '../lib/i18n'
import { go } from '../lib/router'
import { useStore } from '../lib/store'

export function Onboarding() {
  const { t, lang } = useT()
  const { d } = useStore()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [focus, setFocus] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [pick, setPick] = useState<number | 'own' | null>(null)
  const [own, setOwn] = useState('')
  const [err, setErr] = useState('')

  const suggestions = (focus.length ? focus : (['growth'] as Category[]))
    .flatMap((c) => STARTERS[c].slice(0, focus.length > 2 ? 1 : 2))
    .slice(0, 6)

  const toggleFocus = (c: Category) => { setErr(''); setFocus((f) => (f.includes(c) ? f.filter((x) => x !== c) : [...f, c])) }

  const next = () => {
    if (step === 1 && !focus.length) return setErr(t('ob.s1err'))
    if (step === 2 && (!name.trim() || name.trim().length > 20)) return setErr(t('ob.nameErr'))
    if (step === 3) {
      if (pick === null || (pick === 'own' && own.trim().length < 3)) return setErr(t('ob.s3err'))
      const tp = pick === 'own' ? null : suggestions[pick]
      d({
        type: 'onboard',
        profile: { name: name.trim(), avatar, focus, createdAt: todayKey() },
        quest: tp
          ? { title: tplTitle(tp, lang), category: tp.category, frequency: tp.frequency, difficulty: tp.difficulty, minutes: tp.minutes }
          : { title: own.trim().slice(0, 60), category: focus[0] ?? 'growth', frequency: 'daily', difficulty: 'easy', minutes: null },
      })
      toast({ text: t('ob.welcome', { name: name.trim() }), icon: avatar })
      return go('/today')
    }
    setErr('')
    setStep(step + 1)
  }
  const back = () => { setErr(''); step === 1 ? go('/') : setStep(step - 1) }

  return (
    <div className="onboard">
      <header className="ob-top">
        <button className="logo-btn" onClick={() => go('/')} aria-label="LevelUp home"><Logo size={28} /></button>
        <LangSwitch />
      </header>

      <main id="main" className="ob-card">
        <div className="ob-progress" aria-label={t('ob.step', { n: step })}>
          <span className="ob-step-label">{t('ob.step', { n: step })}</span>
          <div className="ob-dots">{[1, 2, 3].map((n) => <span key={n} className={n <= step ? 'is-on' : ''} />)}</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.form key={step} className="ob-body" noValidate
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}
            onSubmit={(e) => { e.preventDefault(); next() }}>

            {step === 1 && (
              <fieldset>
                <legend><h1 className="ob-title">{t('ob.s1t')}</h1><p className="ob-sub">{t('ob.s1d')}</p></legend>
                <div className="goal-grid">
                  {CATEGORIES.map((c) => (
                    <label key={c} className={`goal ${focus.includes(c) ? 'is-on' : ''}`}>
                      <input type="checkbox" checked={focus.includes(c)} onChange={() => toggleFocus(c)} />
                      <span className="goal-icon" aria-hidden="true">{CATEGORY_ICON[c]}</span>
                      <b>{t(`cat.${c}`)}</b>
                      <small>{t(`catd.${c}`)}</small>
                      <span className="goal-tick" aria-hidden="true"><Icon name="check" size={14} stroke={3} /></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <div>
                <h1 className="ob-title">{t('ob.s2t')}</h1>
                <p className="ob-sub">{t('ob.s2d')}</p>
                <div className="char-preview" aria-hidden="true">
                  <span className="char-emoji">{avatar}</span>
                  <b>{name.trim() || t('ob.namePh')}</b>
                  <small>{t('u.level', { n: 1 })}</small>
                </div>
                <label className="field">
                  <span className="field-label">{t('ob.name')}</span>
                  <input className={`input ${err ? 'is-invalid' : ''}`} value={name} maxLength={20} autoFocus placeholder={t('ob.namePh')}
                    aria-invalid={!!err} aria-describedby={err ? 'ob-err' : undefined}
                    onChange={(e) => { setName(e.target.value); setErr('') }} />
                </label>
                <fieldset className="field">
                  <legend className="field-label">{t('ob.avatar')}</legend>
                  <div className="avatar-grid">
                    {AVATARS.map((a) => (
                      <label key={a} className={`avatar-opt ${avatar === a ? 'is-on' : ''}`}>
                        <input type="radio" name="avatar" checked={avatar === a} onChange={() => setAvatar(a)} aria-label={a} />
                        <span aria-hidden="true">{a}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <fieldset>
                <legend><h1 className="ob-title">{t('ob.s3t')}</h1><p className="ob-sub">{t('ob.s3d')}</p></legend>
                <p className="field-label">{t('ob.suggested')}</p>
                <div className="pick-list">
                  {suggestions.map((tp, i) => (
                    <label key={tp.en} className={`pick ${pick === i ? 'is-on' : ''}`}>
                      <input type="radio" name="first" checked={pick === i} onChange={() => { setPick(i); setErr('') }} />
                      <span className="pick-icon" aria-hidden="true">{CATEGORY_ICON[tp.category]}</span>
                      <span className="pick-text">
                        <b>{tplTitle(tp, lang)}</b>
                        <small>{t(`freq.${tp.frequency}`)}{tp.minutes ? ` · ${t('u.min', { n: tp.minutes })}` : ''}</small>
                      </span>
                      <span className="xp-chip">+{XP_BY_DIFFICULTY[tp.difficulty]} XP</span>
                    </label>
                  ))}
                  <label className={`pick pick-own ${pick === 'own' ? 'is-on' : ''}`}>
                    <input type="radio" name="first" checked={pick === 'own'} onChange={() => { setPick('own'); setErr('') }} />
                    <span className="pick-icon" aria-hidden="true">✏️</span>
                    <span className="pick-text">
                      <b>{t('ob.own')}</b>
                      <input className="input input-sm" value={own} maxLength={60} placeholder={t('ob.ownPh')} aria-label={t('ob.own')}
                        onFocus={() => setPick('own')} onChange={(e) => { setOwn(e.target.value); setPick('own'); setErr('') }} />
                    </span>
                  </label>
                </div>
              </fieldset>
            )}

            {err && <p className="form-error" id="ob-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}

            <div className="ob-actions">
              <button type="button" className="btn btn-ghost" onClick={back}><Icon name="left" size={18} /> {t('ob.back')}</button>
              <button type="submit" className="btn btn-primary">
                {step === 3 ? t('ob.finish') : t('ob.next')} <Icon name="arrow" size={18} />
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </main>
    </div>
  )
}
